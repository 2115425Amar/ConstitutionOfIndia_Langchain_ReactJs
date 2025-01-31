import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import constitutionDB from '../../data/constitutionDB';
import './CardGame.css';

const CardGame = () => {
  const { language } = useLanguage();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('constitutionCardGameBestScore');
    return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 };
  });

  // Memoize createCards function to avoid recreation on every render
  const createCards = useCallback(() => {
    let cardPairs = [];
    
    // Basic pairs from Fundamental Rights
    const fundamentalRightsPairs = constitutionDB.fundamentalRights.articles.map(article => ([
      {
        id: `title-${article.number}`,
        type: 'title',
        content: article.title[language],
        matchId: article.number,
        category: 'Fundamental Rights'
      },
      {
        id: `desc-${article.number}`,
        type: 'description',
        content: article.simplified[language].text,
        matchId: article.number,
        category: 'Fundamental Rights'
      }
    ]));

    // Add pairs based on difficulty
    switch(difficulty) {
      case 'easy':
        cardPairs = fundamentalRightsPairs.slice(0, 3);
        break;
      case 'medium':
        cardPairs = [
          ...fundamentalRightsPairs.slice(0, 4),
          [{
            id: 'preamble-title',
            type: 'title',
            content: language === 'en' ? 'Preamble' : 'प्रस्तावना',
            matchId: 'preamble',
            category: 'Preamble'
          },
          {
            id: 'preamble-desc',
            type: 'description',
            content: constitutionDB.preamble.simplified[language].text,
            matchId: 'preamble',
            category: 'Preamble'
          }]
        ];
        break;
      case 'hard':
        cardPairs = [
          ...fundamentalRightsPairs,
        ];
        break;
      default:
        cardPairs = fundamentalRightsPairs.slice(0, 3); // Default to easy mode
        break;
    }

    return cardPairs.flat().sort(() => Math.random() - 0.5);
  }, [language, difficulty]); // Add dependencies for useCallback

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && !matchedPairs.length === cards.length / 2) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, matchedPairs.length, cards.length]);

  // Initialize and reset game
  useEffect(() => {
    setCards(createCards());
    setGameStarted(false);
    setTimer(0);
    setScore(0);
    setMoves(0);
    setFlippedCards([]);
    setMatchedPairs([]);
  }, [language, difficulty, createCards]); // Add createCards to dependencies

  const resetGame = () => {
    setGameStarted(false);
    setTimer(0);
    setScore(0);
    setMoves(0);
    setFlippedCards([]);
    setMatchedPairs([]);
    setCards(createCards());
  };

  const handleCardClick = (clickedCard) => {
    if (!gameStarted) setGameStarted(true);
    
    if (flippedCards.length === 2) return;
    if (matchedPairs.includes(clickedCard.matchId) || 
        flippedCards.find(card => card.id === clickedCard.id)) return;

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      if (newFlippedCards[0].matchId === newFlippedCards[1].matchId) {
        // Calculate bonus points based on speed and difficulty
        const basePoints = {
          easy: 10,
          medium: 20,
          hard: 30
        }[difficulty];
        const timeBonus = Math.max(0, 10 - Math.floor(timer / 10)); // Bonus for quick matches
        
        setMatchedPairs([...matchedPairs, clickedCard.matchId]);
        setScore(score + basePoints + timeBonus);
        setFlippedCards([]);

        // Check for game completion
        if (matchedPairs.length + 1 === cards.length / 2) {
          const finalScore = score + basePoints + timeBonus;
          if (finalScore > bestScore[difficulty]) {
            const newBestScore = { ...bestScore, [difficulty]: finalScore };
            setBestScore(newBestScore);
            localStorage.setItem('constitutionCardGameBestScore', JSON.stringify(newBestScore));
          }
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const isCardFlipped = (card) => {
    return flippedCards.find(flipped => flipped.id === card.id) || 
           matchedPairs.includes(card.matchId);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-game">
      <div className="game-header">
        <h1>{language === 'en' ? 'Constitutional Memory Game' : 'संवैधानिक स्मृति खेल'}</h1>
        
        <div className="difficulty-selector">
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              className={`difficulty-button ${difficulty === level ? 'active' : ''}`}
              onClick={() => setDifficulty(level)}
            >
              {language === 'en' ? level.charAt(0).toUpperCase() + level.slice(1) : 
                level === 'easy' ? 'आसान' : 
                level === 'medium' ? 'मध्यम' : 'कठिन'}
            </button>
          ))}
        </div>

        <div className="game-stats">
          <span>{language === 'en' ? `Score: ${score}` : `स्कोर: ${score}`}</span>
          <span>{language === 'en' ? `Best: ${bestScore[difficulty]}` : `सर्वश्रेष्ठ: ${bestScore[difficulty]}`}</span>
          <span>{language === 'en' ? `Moves: ${moves}` : `चाल: ${moves}`}</span>
          <span>{language === 'en' ? `Time: ${formatTime(timer)}` : `समय: ${formatTime(timer)}`}</span>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${isCardFlipped(card) ? 'flipped' : ''} ${card.type} ${card.category.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-category">
                  {language === 'en' ? card.category : 
                    card.category === 'Fundamental Rights' ? 'मौलिक अधिकार' :
                    card.category === 'Preamble' ? 'प्रस्तावना' : card.category}
                </div>
              </div>
              <div className="card-back">
                {card.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {matchedPairs.length === cards.length / 2 && (
        <div className="victory-message">
          <h2>
            {language === 'en' 
              ? `Congratulations! You won in ${moves} moves!` 
              : `बधाई हो! आपने ${moves} चालों में जीत लिया!`}
          </h2>
          <p>
            {language === 'en'
              ? `Time: ${formatTime(timer)} | Score: ${score}`
              : `समय: ${formatTime(timer)} | स्कोर: ${score}`}
          </p>
          {score > bestScore[difficulty] && (
            <p className="new-record">
              {language === 'en' ? 'New Best Score!' : 'नया सर्वश्रेष्ठ स्कोर!'}
            </p>
          )}
          <button onClick={resetGame} className="play-again-button">
            {language === 'en' ? 'Play Again' : 'फिर से खेलें'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CardGame; 