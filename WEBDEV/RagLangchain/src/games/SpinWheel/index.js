import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './SpinWheel.css';

const SpinWheel = ({ sections, onSectionSelected }) => {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDeg, setCurrentDeg] = useState(0);
  const [winner, setWinner] = useState(null);

  const colors = sections.map(() => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return { r, g, b };
  });

  const drawWheel = (ctx, currentRotation) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;
    const step = 360 / sections.length;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sections
    let startDeg = currentRotation;
    sections.forEach((section, i) => {
      const endDeg = startDeg + step;
      const color = colors[i];

      // Draw outer section
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, toRad(startDeg), toRad(endDeg));
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = `rgb(${color.r - 30},${color.g - 30},${color.b - 30})`;
      ctx.fill();

      // Draw inner section
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg));
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      ctx.fill();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(toRad((startDeg + endDeg) / 2));
      ctx.textAlign = "center";
      ctx.fillStyle = isLightColor(color) ? "#000" : "#fff";
      ctx.font = 'bold 16px Arial';
      ctx.fillText(section.label[language], radius - 60, 0);
      ctx.restore();

      // Check winner
      if (startDeg % 360 < 360 && startDeg % 360 > 270 && endDeg % 360 > 0 && endDeg % 360 < 90) {
        setWinner(section);
      }

      startDeg = endDeg;
    });
  };

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const maxRotation = 360 * 6 + Math.random() * 360;
    let currentRotation = currentDeg;
    let speed = 20;
    
    const animate = () => {
      if (speed <= 0.01) {
        setIsSpinning(false);
        if (winner && onSectionSelected) {
          onSectionSelected(winner);
        }
        return;
      }

      speed = easeOutSine(getPercent(currentRotation, maxRotation, 0)) * 20;
      currentRotation += speed;
      setCurrentDeg(currentRotation);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawWheel(ctx, currentDeg);
  }, [currentDeg, sections, language]);

  return (
    <div className="wheel-container">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={500}
        className="wheel-canvas"
      />
      <div className="wheel-center" onClick={spin}>
        <div className="wheel-pointer"></div>
      </div>
    </div>
  );
};

// Helper functions
const toRad = (deg) => deg * (Math.PI / 180.0);
const easeOutSine = (x) => Math.sin((x * Math.PI) / 2);
const getPercent = (input, max, min) => (((input - min) * 100) / (max - min)) / 100;
const isLightColor = (color) => color.r > 150 || color.g > 150 || color.b > 150;

export default SpinWheel; 