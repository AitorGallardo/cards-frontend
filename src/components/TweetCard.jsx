// file: src/components/TweetCard.jsx (updated)
import React, { useRef, useEffect, useState } from 'react';
import './TweetCard.css';
import { renderPixelArt } from '../utils/pixelArtRenderer';

const TweetCard = ({ 
  tweet, 
  isDragging, 
  isSelected,
  isSelectionMode,
  isStacked,
  onClick, 
  onMouseDown, 
  dealDelay, 
  isDealing, 
  zIndex 
}) => {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Render pixel art on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Render the pixel art
    renderPixelArt(canvas, tweet, isSelected);
    
  }, [tweet, isSelected]);
  
  // Determine animation class
  let animationClass = 'idle';
  
  if (isDealing && tweet.dealt) {
    animationClass = 'deal';
  } else if (isDragging) {
    animationClass = 'dragging';
  } else if (isHovered && !isDealing && !isStacked) {
    animationClass = 'hover';
  } else if (tweet.animationClass) {
    animationClass = tweet.animationClass;
  } else if (isStacked) {
    animationClass = 'stacked';
  } else {
    animationClass = 'float';
  }
  
  // Add light reflection effect on hover
  const [reflectionPosition, setReflectionPosition] = useState({ x: 50, y: 50 });
  
  const handleMouseMove = (e) => {
    if (!isHovered || isDragging || isStacked) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setReflectionPosition({ x, y });
  };
  
  // file: src/components/TweetCard.jsx (continued)
  return (
    <div
      className={`tweet-card ${animationClass} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''} ${isStacked ? 'stacked' : ''}`}
      style={{
        left: tweet.position.x,
        top: tweet.position.y,
        animationDelay: isDealing ? `${dealDelay}ms` : '0ms',
        zIndex: zIndex || 1
      }}
      onClick={onClick}
      onMouseDown={isSelectionMode ? null : onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <canvas 
        ref={canvasRef} 
        width="240" 
        height="280" 
        className="tweet-card-canvas"
      />
      
      {/* Light reflection effect (Balatro style) */}
      {isHovered && !isDragging && !isDealing && !isStacked && (
        <div 
          className="card-reflection" 
          style={{
            background: `radial-gradient(circle at ${reflectionPosition.x}% ${reflectionPosition.y}%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 30%, transparent 70%)`
          }}
        />
      )}
      
      {/* Selection indicator */}
      {isSelectionMode && (
        <div className="selection-indicator">
          {isSelected ? (
            <div className="checkmark">✓</div>
          ) : (
            <div className="selection-circle"></div>
          )}
        </div>
      )}
      
      {/* Card shadow */}
      <div className="card-shadow"></div>
    </div>
  );
};

export default TweetCard;