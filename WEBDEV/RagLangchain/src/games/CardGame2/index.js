import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './CardGame2.css';

const CardGame2 = () => {
  const { language } = useLanguage();
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');

  const topics = [
    {
      label: { 
        en: "Preamble", 
        hi: "प्रस्तावना" 
      },
      question: {
        en: "What is the Preamble?",
        hi: "प्रस्तावना क्या है?"
      },
      answer: {
        en: "Introduction to the Constitution",
        hi: "संविधान का परिचय"
      }
    },
    {
      label: {
        en: "Fundamental Rights",
        hi: "मौलिक अधिकार"
      },
      question: {
        en: "What are Fundamental Rights?",
        hi: "मौलिक अधिकार क्या हैं?"
      },
      answer: {
        en: "Basic rights guaranteed to all citizens",
        hi: "सभी नागरिकों को गारंटीकृत मूल अधिकार"
      }
    },
    // Add more topics here
  ];

  const initializeGame = () => {
    // Create pairs of cards (topic + question)
    const cardPairs = topics.flatMap(topic => [
      { ...topic, type: 'topic', id: Math.random() },
      { ...topic, type: 'question', id: Math.random() }
    ]);
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setSelectedCards([]);
    setMatchedPairs([]);
    setScore(0);
    setGameStarted(true);
    setMessage('');
  };

  const handleCardClick = (clickedCard, index) => {
    if (selectedCards.length === 2 || selectedCards.includes(index) || 
        matchedPairs.includes(clickedCard.label[language])) {
      return;
    }

    const newSelectedCards = [...selectedCards, index];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      const [firstIndex, secondIndex] = newSelectedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.label[language] === secondCard.label[language] && 
          firstCard.type !== secondCard.type) {
        // Match found
        setMatchedPairs([...matchedPairs, firstCard.label[language]]);
        setScore(score + 10);
        setMessage(language === 'en' ? 'Match found!' : 'मिलान मिला!');
        setSelectedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
          setMessage(language === 'en' ? 'Try again!' : 'पुनः प्रयास करें!');
        }, 1000);
        setScore(Math.max(0, score - 2));
      }
    }
  };

  const isGameComplete = () => {
    return matchedPairs.length === topics.length;
  };

  useEffect(() => {
    if (isGameComplete()) {
      setMessage(
        language === 'en' 
          ? `Congratulations! You've completed the game with ${score} points!`
          : `बधाई हो! आपने ${score} अंकों के साथ खेल पूरा कर लिया है!`
      );
    }
  }, [matchedPairs, score, language]);

  return (
    <div className="card-game-container">
      <h1>
        {language === 'en' 
          ? 'Constitutional Card Match' 
          : 'संवैधानिक कार्ड मिलान'}
      </h1>

      {!gameStarted ? (
        <div className="game-intro">
          <p>
            {language === 'en'
              ? 'Match the constitutional topics with their questions!'
              : 'संवैधानिक विषयों को उनके प्रश्नों से मिलाएं!'}
          </p>
          <button onClick={initializeGame} className="start-button">
            {language === 'en' ? 'Start Game' : 'खेल शुरू करें'}
          </button>
        </div>
      ) : (
        <>
          <div className="game-stats">
            <span>
              {language === 'en' ? 'Score: ' : 'स्कोर: '}{score}
            </span>
            <span>
              {language === 'en' ? 'Matches: ' : 'मिलान: '}
              {matchedPairs.length}/{topics.length}
            </span>
          </div>

          {message && <div className="game-message">{message}</div>}

          <div className="card-grid">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`card ${
                  selectedCards.includes(index) ? 'flipped' : ''
                } ${
                  matchedPairs.includes(card.label[language]) ? 'matched' : ''
                }`}
                onClick={() => handleCardClick(card, index)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <span>?</span>
                  </div>
                  <div className="card-back">
                    {card.type === 'topic' 
                      ? card.label[language]
                      : card.question[language]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={initializeGame} 
            className="reset-button"
          >
            {language === 'en' ? 'Reset Game' : 'खेल रीसेट करें'}
          </button>
        </>
      )}
    </div>
  );
};

export default CardGame2; 