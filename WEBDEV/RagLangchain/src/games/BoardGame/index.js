import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './BoardGame.css';

const BOARD_SIZE = 10;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

const BoardGame = () => {
  const { language } = useLanguage();
  const [playerPosition, setPlayerPosition] = useState(1);
  const [diceNumber, setDiceNumber] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameMessage, setGameMessage] = useState('');

  // Define snakes and ladders with educational content
  const snakesAndLadders = {
    // Ladders (start: end)
    14: { end: 48, type: 'ladder', topic: 'fundamental_rights' },
    19: { end: 60, type: 'ladder', topic: 'directive_principles' },
    26: { end: 53, type: 'ladder', topic: 'citizenship' },
    31: { end: 42, type: 'ladder', topic: 'parliament' },
    // Snakes (start: end)
    92: { end: 25, type: 'snake', topic: 'fundamental_duties' },
    95: { end: 39, type: 'snake', topic: 'emergency_provisions' },
    78: { end: 30, type: 'snake', topic: 'amendments' },
    88: { end: 36, type: 'snake', topic: 'judiciary' },
  };

  const createBoard = () => {
    const cells = [];
    let isReverse = false;

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      const rowCells = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cellNumber = isReverse
          ? row * BOARD_SIZE + (BOARD_SIZE - col)
          : row * BOARD_SIZE + col + 1;

        rowCells.push(
          <div 
            key={cellNumber} 
            className={`board-cell ${playerPosition === cellNumber ? 'has-player' : ''}`}
          >
            <span className="cell-number">{cellNumber}</span>
            {playerPosition === cellNumber && (
              <div className="player-token">🎯</div>
            )}
            {snakesAndLadders[cellNumber] && (
              <div className={`${snakesAndLadders[cellNumber].type}-marker`}>
                {snakesAndLadders[cellNumber].type === 'ladder' ? '🪜' : '🐍'}
              </div>
            )}
          </div>
        );
      }
      cells.push(
        <div key={row} className="board-row">
          {isReverse ? rowCells.reverse() : rowCells}
        </div>
      );
      isReverse = !isReverse;
    }
    return cells;
  };

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setGameMessage('');
    
    // Animate dice roll
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalNumber = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(finalNumber);
        movePlayer(finalNumber);
        setIsRolling(false);
      }
    }, 100);
  };

  const movePlayer = (spaces) => {
    const newPosition = playerPosition + spaces;
    
    if (newPosition > TOTAL_CELLS) {
      setGameMessage(language === 'en' 
        ? 'You need exact number to win!' 
        : 'जीतने के लिए सटीक संख्या की आवश्यकता है!');
      return;
    }

    if (newPosition === TOTAL_CELLS) {
      setPlayerPosition(newPosition);
      setGameMessage(language === 'en' 
        ? 'Congratulations! You won!' 
        : 'बधाई हो! आप जीत गए!');
      return;
    }

    setPlayerPosition(newPosition);

    // Check for snakes and ladders
    if (snakesAndLadders[newPosition]) {
      const { type, end, topic } = snakesAndLadders[newPosition];
      setCurrentQuestion({
        type,
        currentPos: newPosition,
        nextPos: end,
        topic
      });
    }
  };

  const handleQuestionAnswer = (isCorrect) => {
    const { type, currentPos, nextPos } = currentQuestion;
    
    if (type === 'ladder') {
      if (isCorrect) {
        setPlayerPosition(nextPos);
        setGameMessage(language === 'en'
          ? 'Correct! Climb up the ladder!'
          : 'सही! सीढ़ी पर चढ़ें!');
      } else {
        setGameMessage(language === 'en'
          ? 'Incorrect. Stay where you are.'
          : 'गलत। जहां हैं वहीं रहें।');
      }
    } else { // snake
      if (isCorrect) {
        setGameMessage(language === 'en'
          ? 'Correct! You avoided the snake!'
          : 'सही! आपने सांप से बचा!');
      } else {
        setPlayerPosition(nextPos);
        setGameMessage(language === 'en'
          ? 'Incorrect. Down you go!'
          : 'गलत। नीचे जाएं!');
      }
    }
    setCurrentQuestion(null);
  };

  return (
    <div className="board-game-container">
      <h1>
        {language === 'en' 
          ? 'Constitutional Snake & Ladder' 
          : 'संवैधानिक सांप और सीढ़ी'}
      </h1>
      
      <div className="game-board">
        {createBoard()}
      </div>

      <div className="game-controls">
        <div className="dice-section">
          {diceNumber && (
            <div className={`dice dice-${diceNumber} ${isRolling ? 'rolling' : ''}`}>
              {diceNumber}
            </div>
          )}
          <button 
            onClick={rollDice} 
            disabled={isRolling || currentQuestion !== null}
            className="roll-button"
          >
            {language === 'en' ? 'Roll Dice' : 'पासा फेंकें'}
          </button>
        </div>

        {gameMessage && (
          <div className="game-message">
            {gameMessage}
          </div>
        )}

        {currentQuestion && (
          <div className="question-modal">
            {/* Question component goes here */}
            <div className="question-buttons">
              <button onClick={() => handleQuestionAnswer(true)}>
                {language === 'en' ? 'Correct' : 'सही'}
              </button>
              <button onClick={() => handleQuestionAnswer(false)}>
                {language === 'en' ? 'Incorrect' : 'गलत'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardGame; 