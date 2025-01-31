// src/components/Navbar/index.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: { en: 'Home', hi: 'होम' } },
    { path: '/preamble', label: { en: 'Preamble', hi: 'प्रस्तावना' } }, // Add the Preamble link
    { path: '/quiz', label: { en: 'Quiz', hi: 'प्रश्नोत्तरी' } },
    { path: '/board-game', label: { en: 'Snakes & Ladders', hi: 'बोर्ड खेल' } },
    { path: '/card-game2', label: { en: 'Memory Cards', hi: 'मेमोरी कार्ड्स' } },
    { path: '/spin-wheel', label: { en: 'Spin Wheel', hi: 'चक्र खेल' } },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <button onClick={() => navigate('/')} className="nav-brand-button">
          {language === 'en' ? 'Nagrik & Constitution' : 'नागरिक और संविधान'}
        </button>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="nav-link-button"
          >
            {item.label[language]}
          </button>
        ))}
      </div>
      <button 
        className="language-toggle"
        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      >
        {language === 'en' ? 'हिंदी' : 'English'}
      </button>
    </nav>
  );
};

export default Navbar;