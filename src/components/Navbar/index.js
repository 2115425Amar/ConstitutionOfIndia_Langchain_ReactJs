import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: { en: 'Home', hi: 'होम' } },
    { path: '/preamble', label: { en: 'Preamble', hi: 'प्रस्तावना' } },
    { path: '/quiz', label: { en: 'Ai_Quiz_Langchain', hi: 'प्रश्नोत्तरी' } },
    { path: '/board-game', label: { en: 'Snakes & Ladders', hi: 'बोर्ड खेल' } },
    { path: '/card-game2', label: { en: 'Memory Cards', hi: 'मेमोरी कार्ड्स' } },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <button onClick={() => navigate('/')} className="nav-brand-button">
        <img src="ashok-chakra.png" alt="Logo" className="nav-logo" style={{ height: '7vh', width: '7vh' }} />
          {language === 'en' ? 'Nagrik & Constitution' : 'नागरिक और संविधान'}
        </button>
      </div>
      
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setMenuOpen(false);
            }}
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
      
      <button 
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? 'Close Menu' : 'Menu'}
      </button>
    </nav>
  );
};

export default Navbar;