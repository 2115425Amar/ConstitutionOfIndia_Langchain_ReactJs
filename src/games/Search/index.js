import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Search.css';
import documentService from '../../services/documentService';
import SpinWheel from '../SpinWheel';

const Search = () => {
  const { language } = useLanguage();
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
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const topicSections = [
    {
      label: { en: 'Fundamental Rights', hi: 'मौलिक अधिकार' },
      color: '#FF6B6B',
      topic: 'fundamental rights'
    },
    {
      label: { en: 'Directive Principles', hi: 'निर्देशक सिद्धांत' },
      color: '#4ECDC4',
      topic: 'directive principles'
    },
    {
      label: { en: 'Citizenship', hi: 'नागरिकता' },
      color: '#45B7D1',
      topic: 'citizenship'
    },
    {
      label: { en: 'Parliament', hi: 'संसद' },
      color: '#96CEB4',
      topic: 'parliament'
    },
    {
      label: { en: 'Judiciary', hi: 'न्यायपालिका' },
      color: '#D4A5A5',
      topic: 'judiciary'
    },
    {
      label: { en: 'State Government', hi: 'राज्य सरकार' },
      color: '#9B59B6',
      topic: 'state government'
    }
  ];

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
          ? 'PDF processed successfully!' 
          : 'PDF सफलतापूर्वक प्रोसेस किया गया!');
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

  // Handle search
  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!searchQuery.trim() || !pdfUploaded || isSearching) return;

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

  // Generate questions from selected content
  const generateQuestionsFromSelection = async () => {
    if (selectedChunks.length === 0) return;

    setIsLoading(true);
    try {
      const selectedContent = selectedChunks
        .map(index => pdfPreview[index].pageContent)
        .join('\n\n');
      
      const questions = await documentService.generateQuestionsFromContent(selectedContent);
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
        setShowPdfContent(false);
        setSelectedChunks([]);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate adaptive questions
  const generateAdaptiveQuestions = async () => {
    if (!pdfUploaded) return;

    setIsLoading(true);
    try {
      const questions = await documentService.generateQuestions('Indian Constitution', 3);
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
      }
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSelected = async (section) => {
    if (!pdfUploaded) return;
    
    setIsLoading(true);
    try {
      const questions = await documentService.generateQuestions(section.topic, 3);
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>
          {language === 'en' 
            ? 'Constitution Search' 
            : 'संविधान खोज'}
        </h1>
        // ... rest of the JSX ...
      </div>
      {pdfUploaded && (
        <div className="spin-wheel-section">
          <h3>
            {language === 'en' 
              ? 'Spin to Generate Topic Questions' 
              : 'विषय प्रश्न बनाने के लिए घुमाएं'}
          </h3>
          <SpinWheel 
            sections={topicSections}
            onSectionSelected={handleSectionSelected}
          />
        </div>
      )}
    </div>
  );
};

export default Search; 