// file: src/components/TweetCard.jsx (updated)
import React, { useRef, useEffect, useState } from 'react';
import './TweetCard.css';
import { renderPixelArt } from '../utils/pixelArtRenderer';
import ShaderBackground from './ShaderBackground';
import { useShader, SHADER_OPTIONS } from '../utils/ShaderContext';

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
  const { activeShader, shaderEnabled } = useShader();
  
  // Render pixel art on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Render the pixel art
    renderPixelArt(canvas, tweet, isSelected, shaderEnabled);
    
  }, [tweet, isSelected, shaderEnabled]);

  // Apply card dealing path animation
useEffect(() => {
  if (tweet.animationClass === 'card-dealing' && tweet.dealPath) {
    const cardElement = document.querySelector(`#card-${tweet.id}`);
    if (!cardElement) return;
    
    const { start, end, control1, control2 } = tweet.dealPath;
    
    // Set CSS custom properties for the bezier path animation
    cardElement.style.setProperty('--deal-start-x', `${start.x}px`);
    cardElement.style.setProperty('--deal-start-y', `${start.y}px`);
    cardElement.style.setProperty('--deal-end-x', `${end.x}px`);
    cardElement.style.setProperty('--deal-end-y', `${end.y}px`);
    cardElement.style.setProperty('--deal-x1', `${control1.x}px`);
    cardElement.style.setProperty('--deal-y1', `${control1.y}px`);
    cardElement.style.setProperty('--deal-x2', `${control2.x}px`);
    cardElement.style.setProperty('--deal-y2', `${control2.y}px`);
  }
}, [tweet.animationClass, tweet.dealPath]);
  
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
      id={`card-${tweet.id}`}
      className={`tweet-card ${animationClass} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''} ${isStacked ? 'stacked' : ''} ${shaderEnabled ? 'shader-enabled' : ''}`}
      style={{
        left: tweet.position.x,
        top: tweet.position.y,
        animationDelay: isDealing ? `${dealDelay}ms` : '0ms',
        zIndex: zIndex || 1,
        backgroundColor: shaderEnabled ? 'transparent' : '#1A1A1A',
        position: 'absolute', // Ensure position is absolute
      }}
      onClick={onClick}
      onMouseDown={isSelectionMode ? null : onMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Shader background - only show when enabled */}
      {shaderEnabled && (
        <div className="tweet-card-shader" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 0
        }}>
          <ShaderBackground className="tweet-card-canvas with-shader" shaderType={activeShader} />
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        width="240" 
        height="280" 
        className={`tweet-card-canvas ${shaderEnabled ? 'with-shader' : ''}`}
        style={{ position: 'relative', zIndex: 1 }}
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