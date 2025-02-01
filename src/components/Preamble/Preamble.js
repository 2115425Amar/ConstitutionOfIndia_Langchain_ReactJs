// src/components/Preamble/Preamble.js
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Preamble.css';

const Preamble = () => {
    const { language } = useLanguage();

    return (
        <div className="preamble">
            {/* <h1 className="preamble-title">{language === 'en' ? 'Preamble of the Constitution of India' : 'भारत के संविधान की प्रस्तावना'}</h1> */}
            <img src="preable.avif" alt="Preamble" height="90%" width="90%" className="preamble-image" />
        </div>
    );
};

export default Preamble;
