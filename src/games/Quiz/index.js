import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import constitutionDB from '../../data/constitutionDB';
import './Quiz.css';
import documentService from '../../services/documentService';

const Quiz = () => {
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('constitutionQuizBestScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [pdfPreview, setPdfPreview] = useState(null);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [showPdfContent, setShowPdfContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchingResults, setMatchingResults] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Generate initial questions from constitutionDB
  useEffect(() => {
    const initialQuestions = getInitialQuestions();
    setQuestions(initialQuestions);
  }, [language]);

  const getInitialQuestions = () => {
    const allQuestions = [
      // Preamble questions
      {
        question: {
          en: "What are the key principles mentioned in the Preamble?",
          hi: "प्रस्तावना में उल्लिखित प्रमुख सिद्धांत क्या हैं?"
        },
        options: {
          en: [
            "Sovereign, Socialist, Secular, Democratic, Republic",
            "Freedom, Justice, Liberty, Equality",
            "Unity, Integrity, Fraternity",
            "None of the above"
          ],
          hi: [
            "संप्रभु, समाजवादी, धर्मनिरपेक्ष, लोकतांत्रिक, गणराज्य",
            "स्वतंत्रता, न्याय, स्वतंत्रता, समानता",
            "एकता, अखंडता, बंधुत्व",
            "इनमें से कोई नहीं"
          ]
        },
        correct: 0,
        explanation: {
          en: "The Preamble declares India as a Sovereign, Socialist, Secular, Democratic Republic.",
          hi: "प्रस्तावना भारत को एक संप्रभु, समाजवादी, धर्मनिरपेक्ष, लोकतांत्रिक गणराज्य घोषित करती है।"
        }
      },
      // Fundamental Rights questions
      ...constitutionDB.fundamentalRights.articles.map(article => ({
        question: {
          en: `What is Article ${article.number} about?`,
          hi: `अनुच्छेद ${article.number} किस बारे में है?`
        },
        options: {
          en: [
            article.title.en,
            "Right to Property",
            "Right to Education",
            "Right to Work"
          ],
          hi: [
            article.title.hi,
            "संपत्ति का अधिकार",
            "शिक्षा का अधिकार",
            "काम का अधिकार"
          ]
        },
        correct: 0,
        explanation: {
          en: article.simplified.en.text,
          hi: article.simplified.hi.text
        }
      }))
    ];

    // Shuffle questions
    return allQuestions.sort(() => Math.random() - 0.5);
  };

  // Handle answer selection
  const handleAnswerClick = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 10);
    }

    // Move to next question after delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowExplanation(false);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowScore(true);
        if (score + (answerIndex === questions[currentQuestion].correct ? 10 : 0) > bestScore) {
          setBestScore(score + (answerIndex === questions[currentQuestion].correct ? 10 : 0));
          localStorage.setItem('constitutionQuizBestScore', 
            (score + (answerIndex === questions[currentQuestion].correct ? 10 : 0)).toString()
          );
        }
      }
    }, 2000);
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // Handle PDF upload
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setUploadError(language === 'en' 
        ? 'Please upload a PDF file' 
        : 'कृपया PDF फ़ाइल अपलोड करें');
      return;
    }

    setIsLoading(true);
    setUploadError(null);
    setProcessingStatus(language === 'en' 
      ? 'Processing PDF...' 
      : 'PDF प्रोसेस हो रहा है...');

    try {
      const success = await documentService.loadAndProcessPDF(file);
      if (success) {
        setPdfUploaded(true);
        setPdfPreview(documentService.documents);
        setProcessingStatus(language === 'en' 
          ? 'Generating questions...' 
          : 'प्रश्न तैयार किए जा रहे हैं...');
        
        const generatedQuestions = await documentService.generateQuestions('Indian Constitution');
        if (generatedQuestions) {
          setQuestions(prevQuestions => [...prevQuestions, ...generatedQuestions]);
          setProcessingStatus(language === 'en' 
            ? 'Questions ready!' 
            : 'प्रश्न तैयार हैं!');
        }
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(language === 'en'
        ? 'Error processing PDF. Please try again.'
        : 'PDF प्रोसेस करने में त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
      setTimeout(() => setProcessingStatus(''), 2000);
    }
  };

  const togglePdfContent = () => {
    setShowPdfContent(!showPdfContent);
  };

  const handleChunkSelect = (index) => {
    setSelectedChunks(prev => {
      const isSelected = prev.includes(index);
      if (isSelected) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const generateQuestionsFromSelection = async () => {
    if (selectedChunks.length === 0) return;

    setIsLoading(true);
    try {
      const selectedContent = selectedChunks
        .map(index => pdfPreview[index].pageContent)
        .join('\n\n');
      
      const generatedQuestions = await documentService.generateQuestionsFromContent(selectedContent);
      if (generatedQuestions) {
        setQuestions(prevQuestions => [...prevQuestions, ...generatedQuestions]);
        setShowPdfContent(false);
        setSelectedChunks([]);
      }
    } catch (error) {
      console.error('Error generating questions from selection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate more questions based on performance
  const generateAdaptiveQuestions = async () => {
    if (!pdfUploaded) return;

    setIsLoading(true);
    try {
      // Generate questions based on topics where user performed poorly
      const poorPerformanceTopics = getPoorPerformanceTopics();
      const newQuestions = await documentService.generateQuestions(poorPerformanceTopics[0], 3);
      if (newQuestions) {
        setQuestions(prev => [...prev, ...newQuestions]);
      }
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
    }
    setIsLoading(false);
  };

  // Helper function to identify topics where user needs improvement
  const getPoorPerformanceTopics = () => {
    // Implement logic to track and identify topics where user scored low
    return ['Fundamental Rights']; // Placeholder
  };

  // Update handleSearch function
  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      
      if (!searchQuery.trim()) {
        return;
      }
      
      if (!pdfUploaded || isSearching) return;

      setIsSearching(true);
      try {
        const result = await documentService.searchContent(searchQuery);
        if (result.isRateLimit) {
          setSearchResults({
            error: language === 'en'
              ? 'Too many requests. Please wait a few seconds and try again.'
              : 'बहुत सारे अनुरोध। कृपया कुछ सेकंड प्रतीक्षा करें और पुनः प्रयास करें।'
          });
          setMatchingResults(null);
        } else {
          setSearchResults(result);
          setMatchingResults(result.matchingResults);
        }
      } catch (error) {
        console.error('Error searching content:', error);
        setSearchResults({
          error: language === 'en'
            ? 'Failed to search content'
            : 'सामग्री खोजने में विफल'
        });
        setMatchingResults(null);
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, pdfUploaded, language, isSearching]
  );

  // Update the input onChange handler to only update the input value
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  if (!questions.length) return null;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{language === 'en' ? 'Constitution Quiz' : 'संविधान प्रश्नोत्तरी'}</h1>
        
        {/* PDF Upload Section */}
        <div className="pdf-upload-section">
          <h3>
            {language === 'en' 
              ? 'Upload Study Material (Optional)' 
              : 'अध्ययन सामग्री अपलोड करें (वैकल्पिक)'}
          </h3>
          <div className="upload-container">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePDFUpload}
              className="file-input"
              disabled={isLoading} 
            />
            {pdfUploaded && !isLoading && (
              <span className="success-message">
                ✓ {language === 'en' ? 'PDF Uploaded' : 'PDF अपलोड हो गया'}
              </span>
            )}
          </div>
          {uploadError && (
            <div className="error-message">{uploadError}</div>
          )}
          {processingStatus && (
            <div className="status-message">{processingStatus}</div>
          )}
          
          {/* Search Bar */}
          {pdfUploaded && (
            <div className="search-section">
              <h3>
                {language === 'en' 
                  ? 'Search in PDF Content' 
                  : 'PDF सामग्री में खोजें'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  handleSearch(e);
                }
              }} className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder={language === 'en' 
                    ? 'Type your question...' 
                    : 'अपना प्रश्न टाइप करें...'}
                  className="search-input"
                  disabled={isSearching}
                />
                <button 
                  type="submit" 
                  className="search-button"
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching 
                    ? (language === 'en' ? 'Searching...' : 'खोज रहा है...') 
                    : (language === 'en' ? 'Search' : 'खोजें')}
                </button>
                {searchResults && (
                  <button 
                    type="button" 
                    onClick={clearSearch}
                    className="clear-button"
                  >
                    {language === 'en' ? 'Clear' : 'साफ़ करें'}
                  </button>
                )}
              </form>

              {/* Search Results */}
              {searchResults && !searchResults.error && (
                <div className="search-results">
                  <div className="answer-container">
                    <div className="answer-box">
                      <div className="answer-content">
                        <h4>
                          {language === 'en' ? 'Answer:' : 'उत्तर:'}
                        </h4>
                        <div className="answer-text">
                          {searchResults.answer}
                        </div>
                        <div className="result-source">
                          {language === 'en' 
                            ? 'Source: Section ' 
                            : 'स्रोत: खंड '}
                          #{searchResults.sourceChunk + 1}
                        </div>
                      </div>
                    </div>

                    {matchingResults && matchingResults.length > 0 && (
                      <div className="sources-section">
                        <h5>
                          {language === 'en' 
                            ? 'Sources & Context:' 
                            : 'स्रोत और संदर्भ:'}
                        </h5>
                        <div className="sources-container">
                          {matchingResults.map((result, index) => (
                            <div key={index} className="source-item">
                              <div className="source-header">
                                <span className="source-number">
                                  {language === 'en'
                                    ? `Source ${index + 1}`
                                    : `स्रोत ${index + 1}`}
                                </span>
                                <span className="relevance-badge">
                                  {Math.round(result.score * 100)}% match
                                </span>
                              </div>
                              <div className="source-content">
                                {result.preview}
                                {result.content && result.content !== result.preview && (
                                  <div className="source-expand">
                                    <button 
                                      className="expand-button"
                                      onClick={() => {
                                        const element = document.getElementById(`full-content-${index}`);
                                        if (element) {
                                          element.style.display = element.style.display === 'none' ? 'block' : 'none';
                                        }
                                      }}
                                    >
                                      <span className="expand-icon">⌄</span>
                                      {language === 'en' ? 'Show more' : 'और दिखाएं'}
                                    </button>
                                    <div 
                                      id={`full-content-${index}`} 
                                      className="expanded-content"
                                      style={{ display: 'none' }}
                                    >
                                      {result.content}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate More Questions Section */}
          {pdfUploaded && (
            <div className="generate-more-section">
              <h3>
                {language === 'en' 
                  ? 'Generate Additional Questions' 
                  : 'अतिरिक्त प्रश्न बनाएं'}
              </h3>
              <div className="generate-options">
                <button 
                  onClick={generateAdaptiveQuestions}
                  className="generate-button"
                  disabled={isLoading}
                >
                  {language === 'en' 
                    ? 'Generate Based on Performance' 
                    : 'प्रदर्शन के आधार पर बनाएं'}
                </button>
                <p className="generate-description">
                  {language === 'en'
                    ? 'Generates questions from topics where you need more practice'
                    : 'जिन विषयों में आपको अधिक अभ्यास की आवश्यकता है, उनसे प्रश्न बनाता है'}
                </p>
              </div>
            </div>
          )}

          {/* PDF Content Preview */}
          {pdfPreview && (
            <div className="pdf-preview">
              <button 
                onClick={togglePdfContent}
                className="toggle-pdf-button"
              >
                {language === 'en' 
                  ? (showPdfContent ? 'Hide PDF Content' : 'Show PDF Content')
                  : (showPdfContent ? 'PDF सामग्री छिपाएं' : 'PDF सामग्री दिखाएं')}
              </button>
              
              {showPdfContent && (
                <div className="pdf-content">
                  <div className="content-header">
                    <h4>
                      {language === 'en'
                        ? 'Select sections to generate questions from:'
                        : 'प्रश्न बनाने के लिए खंड चुनें:'}
                    </h4>
                    <button
                      onClick={generateQuestionsFromSelection}
                      disabled={selectedChunks.length === 0}
                      className="generate-selected-button"
                    >
                      {language === 'en'
                        ? 'Generate from Selection'
                        : 'चयन से प्रश्न बनाएं'}
                    </button>
                  </div>
                  <div className="content-chunks">
                    {pdfPreview.map((chunk, index) => (
                      <div 
                        key={index}
                        className={`content-chunk ${selectedChunks.includes(index) ? 'selected' : ''}`}
                        onClick={() => handleChunkSelect(index)}
                      >
                        <div className="chunk-header">
                          <span className="chunk-number">#{index + 1}</span>
                          <span className="chunk-length">
                            {chunk.metadata.length} {language === 'en' ? 'characters' : 'अक्षर'}
                          </span>
                        </div>
                        <p className="chunk-content">{chunk.pageContent}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>{processingStatus}</p>
        </div>
      )}

      {showScore ? (
        <div className="score-section">
          <h2>
            {language === 'en' 
              ? 'Quiz Complete!' 
              : 'प्रश्नोत्तरी पूरी हुई!'}
          </h2>
          <p>
            {language === 'en'
              ? `You scored ${score} out of ${questions.length * 10}`
              : `आपने ${questions.length * 10} में से ${score} अंक प्राप्त किए`}
          </p>
          {score > bestScore && (
            <p className="new-record">
              {language === 'en' ? 'New Best Score!' : 'नया सर्वश्रेष्ठ स्कोर!'}
            </p>
          )}
          <button onClick={resetQuiz} className="reset-button">
            {language === 'en' ? 'Try Again' : 'फिर से प्रयास करें'}
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-progress">
            <span>
              {language === 'en' 
                ? `Question ${currentQuestion + 1}/${questions.length}`
                : `प्रश्न ${currentQuestion + 1}/${questions.length}`}
            </span>
            <span>
              {language === 'en' 
                ? `Score: ${score}`
                : `स्कोर: ${score}`}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="question-section">
            <h2 className="question-text">
              {questions[currentQuestion].question[language]}
            </h2>
            <div className="answer-options">
              {questions[currentQuestion].options[language].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  className={`answer-button ${
                    selectedAnswer === index 
                      ? index === questions[currentQuestion].correct 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  }`}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="explanation">
                <p>{questions[currentQuestion].explanation[language]}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz; 