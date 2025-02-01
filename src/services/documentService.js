// Add this script tag to your public/index.html
// <script src="https://cdn.jsdelivr.net/npm/@google/generative-ai"></script>

class DocumentService {
  constructor() {
    this.documents = null;
    // For development only - remove in production
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY ;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Debug log (remove in production)
    console.log('API Key loaded:', this.apiKey ? 'Yes' : 'No', 
      'Length:', this.apiKey?.length || 0);
    
    if (!this.apiKey) {
      console.error('Gemini API key not found. Make sure REACT_APP_GEMINI_API_KEY is set in .env');
    }

    // Update rate limiting properties
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // Increase to 2 seconds
    this.maxRetries = 3;
    this.retryDelay = 3000; // 3 seconds between retries
  }

  async makeRateLimitedRequest(endpoint, options) {
    return new Promise((resolve, reject) => {
      const request = {
        endpoint,
        options,
        resolve,
        reject,
        retries: 0
      };
      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;
    const now = Date.now();
    const timeToWait = Math.max(0, this.minRequestInterval - (now - this.lastRequestTime));

    await new Promise(resolve => setTimeout(resolve, timeToWait));

    const request = this.requestQueue.shift();
    
    try {
      const response = await fetch(request.endpoint, request.options);
      this.lastRequestTime = Date.now();

      if (response.status === 429) { // Too Many Requests
        if (request.retries < this.maxRetries) {
          request.retries++;
          // Put back in queue with exponential backoff
          setTimeout(() => {
            this.requestQueue.push(request);
            this.isProcessing = false;
            this.processQueue();
          }, this.retryDelay * Math.pow(2, request.retries - 1));
          return;
        } else {
          request.reject(new Error('Max retries exceeded'));
        }
      } else {
        request.resolve(response);
      }
    } catch (error) {
      request.reject(error);
    } finally {
      this.isProcessing = false;
      // Wait before processing next request
      setTimeout(() => this.processQueue(), this.minRequestInterval);
    }
  }

  async loadAndProcessPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' '); // Normalize whitespace
        fullText += pageText + '\n';
      }

      // Clean and normalize text
      fullText = fullText
        .replace(/\n+/g, ' ') // Replace multiple newlines with space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Split into more meaningful chunks based on paragraphs or sections
      const chunks = [];
      let currentChunk = "";
      const paragraphs = fullText.split(/\.\s+/); // Split on sentence endings

      for (const paragraph of paragraphs) {
        if (paragraph.trim().length === 0) continue;
        
        if ((currentChunk + paragraph).length > 1000) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '. ' : '') + paragraph;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }

      this.documents = chunks.map(chunk => ({
        pageContent: chunk,
        metadata: { 
          source: file.name,
          length: chunk.length,
          preview: chunk.substring(0, 100)
        }
      }));

      console.log('Processed PDF into chunks:', {
        totalChunks: this.documents.length,
        sampleChunk: this.documents[0]?.pageContent.substring(0, 200),
        allChunks: this.documents.map(doc => doc.pageContent.substring(0, 100))
      });

      return true;
    } catch (error) {
      console.error('Error processing PDF:', error);
      return false;
    }
  }

  async generateQuestions(topic, count = 5) {
    if (!this.documents) {
      throw new Error('No documents loaded');
    }

    if (!this.apiKey) {
      throw new Error('API key not found');
    }

    try {
      // Improved content matching
      const searchTerms = topic.toLowerCase().split(/\s+/);
      const relevantDocs = this.documents
        .map(doc => {
          const content = doc.pageContent.toLowerCase();
          const relevanceScore = searchTerms.reduce((score, term) => {
            return score + (content.includes(term) ? 1 : 0);
          }, 0);
          return { ...doc, relevanceScore };
        })
        .filter(doc => doc.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      if (relevantDocs.length === 0) {
        throw new Error('No relevant content found');
      }

      const prompt = `
        Generate ${count} multiple-choice questions based on this content about the Indian Constitution.
        Each question must have exactly 4 options and 1 correct answer.
        Format your response as a JSON array of questions.
        Each question must include:
        - Question text in English and Hindi
        - 4 options in English and Hindi
        - The index (0-3) of the correct option
        - An explanation in English and Hindi

        Example format:
        [
          {
            "question": {
              "en": "What is the significance of Article X?",
              "hi": "अनुच्छेद X का क्या महत्व है?"
            },
            "options": {
              "en": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "hi": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"]
            },
            "correct": 0,
            "explanation": {
              "en": "The explanation in English",
              "hi": "हिंदी में स्पष्टीकरण"
            }
          }
        ]

        Content to base questions on:
        ${relevantDocs.map(doc => doc.pageContent).join('\n\n')}
      `;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      };

      const response = await this.makeRateLimitedRequest(
        `${this.apiEndpoint}?key=${this.apiKey}`,
        options
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response format');
      }

      let text = data.candidates[0].content.parts[0].text;

      // Clean up the response text
      text = text
        .replace(/```json\s*/g, '')  // Remove JSON code block markers
        .replace(/```\s*$/g, '')     // Remove ending code block markers
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/\n\s*/g, ' ')      // Remove newlines and extra spaces
        .trim();

      // Extract JSON array if wrapped in other text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const cleanedJson = jsonMatch[0].replace(/,\s*]/g, ']'); // Fix trailing commas
      console.log('Cleaned JSON:', cleanedJson);

      try {
        const parsedQuestions = JSON.parse(cleanedJson);
        
        // Validate the structure of each question
        const validQuestions = parsedQuestions.filter(q => {
          try {
            return (
              q.question?.en && typeof q.question.en === 'string' &&
              q.question?.hi && typeof q.question.hi === 'string' &&
              Array.isArray(q.options?.en) && q.options.en.length === 4 &&
              Array.isArray(q.options?.hi) && q.options.hi.length === 4 &&
              typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 &&
              q.explanation?.en && typeof q.explanation.en === 'string' &&
              q.explanation?.hi && typeof q.explanation.hi === 'string'
            );
          } catch {
            return false;
          }
        });

        if (validQuestions.length === 0) {
          throw new Error('No valid questions found in response');
        }

        return validQuestions;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Failed to parse:', cleanedJson);
        throw new Error('Failed to parse questions JSON');
      }
    } catch (error) {
      console.error('Error in generateQuestions:', error);
      throw error;
    }
  }

  async searchContent(query) {
    if (!this.documents) {
      throw new Error('No documents loaded');
    }

    try {
      // Calculate relevance scores first
      const searchTerms = query.toLowerCase().split(/\s+/);
      const matchingResults = this.documents.map((doc, index) => {
        const content = doc.pageContent.toLowerCase();
        const score = searchTerms.reduce((total, term) => 
          total + (content.includes(term) ? 1 : 0), 0) / searchTerms.length;
        return {
          index,
          score,
          preview: doc.pageContent.substring(0, 200) + '...',
          content: doc.pageContent
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

      const prompt = `
        Based on the following content, answer this question: "${query}"
        Keep the answer concise but informative.
        If the answer is not found in the content, say so.

        Content:
        ${matchingResults.map(r => r.content).join('\n\n')}
      `;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      };

      const response = await this.makeRateLimitedRequest(
        `${this.apiEndpoint}?key=${this.apiKey}`,
        options
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 429) {
          return {
            error: 'Too many requests. Please try again in a few seconds.',
            isRateLimit: true
          };
        }
        
        throw new Error(`Failed to search content: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.candidates[0].content.parts[0].text;

      return {
        answer,
        sourceChunk: matchingResults[0]?.index || 0,
        matchingResults
      };
    } catch (error) {
      console.error('Error searching content:', error);
      return {
        error: error.message || 'Failed to search content',
        isRateLimit: error.message?.includes('429')
      };
    }
  }

  async generateQuestionsFromContent(content) {
    if (!content) {
      throw new Error('No content provided');
    }

    try {
      const prompt = `
        Based on the following content about the Indian Constitution, generate 3 multiple-choice questions.
        Each question should have 4 options with one correct answer.
        Return ONLY the JSON array without any markdown formatting or code blocks.
        Format as an array of objects with this structure:
        {
          "question": { "en": "Question in English", "hi": "Question in Hindi" },
          "options": { 
            "en": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "hi": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"]
          },
          "correct": 0,
          "explanation": { "en": "Explanation in English", "hi": "Explanation in Hindi" }
        }

        Content:
        ${content}
      `;

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      };

      const response = await this.makeRateLimitedRequest(
        `${this.apiEndpoint}?key=${this.apiKey}`,
        options
      );

      if (!response.ok) {
        console.error('API Error:', await response.json());
        throw new Error('API Error');
      }

      const data = await response.json();
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }

      const text = data.candidates[0].content.parts[0].text
        .replace(/```json\s*/, '')
        .replace(/```\s*$/, '')
        .trim();

      const parsedQuestions = JSON.parse(text);
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error('Invalid questions format');
      }

      return parsedQuestions;
    } catch (error) {
      console.error('Error generating questions from content:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const documentService = new DocumentService();
export default documentService; 