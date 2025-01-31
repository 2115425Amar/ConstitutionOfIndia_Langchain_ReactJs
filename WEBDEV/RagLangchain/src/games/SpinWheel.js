import React, { useState } from 'react';
import constitutionDB from '../data/constitutionDB';

const SpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    'Preamble',
    'Fundamental Rights',
    'Directive Principles',
    'Fundamental Duties'
  ];

  const spinWheel = () => {
    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * topics.length);
    
    setTimeout(() => {
      setSpinning(false);
      setSelectedTopic(topics[randomIndex]);
    }, 3000);
  };

  return (
    <div className="spin-wheel-container">
      <div className={`wheel ${spinning ? 'spinning' : ''}`}>
        {topics.map((topic, index) => (
          <div 
            key={index} 
            className="wheel-section"
            style={{ transform: `rotate(${index * (360 / topics.length)}deg)` }}
          >
            {topic}
          </div>
        ))}
      </div>
      <button onClick={spinWheel} disabled={spinning}>
        Spin the Wheel
      </button>
      
      {selectedTopic && (
        <div className="topic-content">
          <h2>{selectedTopic}</h2>
          {/* Display relevant content from constitutionDB */}
        </div>
      )}
    </div>
  );
};

export default SpinWheel; 