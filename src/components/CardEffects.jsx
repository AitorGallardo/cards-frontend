// file: src/components/CardEffects.jsx
import React, { useEffect, useRef } from 'react';
import './CardEffects.css';

const CardEffects = ({ gridRef }) => {
  const effectsCanvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = effectsCanvasRef.current;
    if (!canvas || !gridRef.current) return;
    
    const gridElement = gridRef.current;
    const rect = gridElement.getBoundingClientRect();
    
    // Set canvas size to match grid
    canvas.width = gridElement.offsetWidth;
    canvas.height = gridElement.offsetHeight;
    
    // Get context
    const ctx = canvas.getContext('2d');
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = gridElement.offsetWidth;
      canvas.height = gridElement.offsetHeight;
    });
    
    resizeObserver.observe(gridElement);
    
    // Particle system for card effects
    let particles = [];
    
    const addCardMovementEffect = (x, y) => {
      const numParticles = Math.random() * 3 + 2;
      
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: x + Math.random() * 40 - 20,
          y: y + Math.random() * 40 - 20,
          size: Math.random() * 5 + 3,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * -1 - 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
          life: 1,
          decay: Math.random() * 0.02 + 0.005
        });
      }
    };
    
    // Animation frame handler
    let lastPositions = {};
    let animationFrameId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get all tweet cards
      const cards = Array.from(gridElement.querySelectorAll('.tweet-card'));
      
      // Check if cards have moved
      cards.forEach(card => {
        const id = card.style.zIndex;
        const rect = card.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        if (lastPositions[id]) {
          const dx = x - lastPositions[id].x;
          const dy = y - lastPositions[id].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If card has moved significantly, add particles
          if (distance > 5) {
            addCardMovementEffect(x, y);
          }
        }
        
        lastPositions[id] = { x, y };
      });
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= p.decay;
        
        if (p.life > 0) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.rect(p.x, p.y, p.size, p.size);
          ctx.fill();
        } else {
          particles.splice(i, 1);
          i--;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [gridRef]);
  
  return (
    <canvas 
      ref={effectsCanvasRef} 
      className="card-effects-canvas"
    />
  );
};

export default CardEffects;

