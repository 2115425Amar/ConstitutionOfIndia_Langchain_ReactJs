import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const games = [
    {
      path: '/spin-wheel',
      title: { en: 'Spin Wheel', hi: 'चक्र खेल' },
      description: {
        en: 'Learn about different aspects of the constitution through a fun spinning wheel game',
        hi: 'एक मजेदार स्पिनिंग व्हील गेम के माध्यम से संविधान के विभिन्न पहलुओं के बारे में जानें'
      }
    },
    // ... existing code ...
    {
        path: '/card-game',
        title: { en: 'Memory Card Game', hi: 'मेमोरी कार्ड खेल' },
        description: {
          en: 'Match constitutional concepts and learn through memory card games',
          hi: 'मेमोरी कार्ड गेम के माध्यम से संवैधानिक अवधारणाओं को समझें'
        }
      },
  // ... existing code ...
    {
      path: '/board-game',
      title: { en: 'Board Game', hi: 'बोर्ड खेल' },
      description: {
        en: 'Navigate through the constitution in an engaging board game',
        hi: 'एक आकर्षक बोर्ड गेम में संविधान की यात्रा करें'
      }
    },
    {
      path: '/quiz',
      title: { en: 'Quiz', hi: 'प्रश्नोत्तरी' },
      description: {
        en: 'Test your knowledge of the Indian Constitution',
        hi: 'भारतीय संविधान के बारे में अपना ज्ञान जांचें'
      }
    }
  ];

  return (
    <div className="home">
      <h1>
        {language === 'en' 
          ? 'Welcome to Nagrik & Constitution' 
          : 'नागरिक और संविधान में आपका स्वागत है'}
      </h1>
      <div className="game-options">
        {games.map((game) => (
          <button 
            key={game.path}
            onClick={() => navigate(game.path)} 
            className="game-card"
          >
            <h2>{game.title[language]}</h2>
            <p>{game.description[language]}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home; 