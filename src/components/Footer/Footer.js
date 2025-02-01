// src/components/Footer/Footer.js
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { language } = useLanguage();

return (
    <footer className="footer">
        <div className="footer-content">
            <p>
                {language === 'en' 
                    ? '© 2025 Nagrik Aur Samvidhan. All rights reserved.' 
                    : '© 2025 नागरिक और संविधान। सर्वाधिकार सुरक्षित।'}
            </p>
            <p>
                {language === 'en' 
                    ? 'Contact me: amar8601082@gmail.com' 
                    : 'हमसे संपर्क करें: amar8601082@gmail.com'}
            </p>
        </div>
    </footer>
);
};

export default Footer;