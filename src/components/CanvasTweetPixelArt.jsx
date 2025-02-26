import React, { useRef, useEffect } from 'react';

const CanvasTweetPixelArt = ({ tweet, width = 320, height = 320 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !tweet) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pixelSize = 4; // Size of each "pixel" in our art
    
    // Clear canvas
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);
    
    // Draw card background
    ctx.fillStyle = '#1A1A1A';
    drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 16);
    
    // Draw profile circle
    ctx.fillStyle = tweet.profileColor || '#FFC857';
    ctx.beginPath();
    ctx.arc(50, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pixelated face (simplified)
    drawPixelatedFace(ctx, 35, 40, pixelSize);
    
    // Draw username
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.fillText(tweet.username || 'Username', 90, 45);
    
    // Draw handle
    ctx.fillStyle = '#6D6D6D';
    ctx.font = '10px monospace';
    ctx.fillText(tweet.handle || '@handle', 90, 62);
    
    // Draw content
    drawPixelatedText(ctx, tweet.content || '', 30, 100, width - 60, pixelSize);
    
  }, [tweet, width, height]);
  
  // Helper function to draw rounded rectangles
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };
  
  // Helper function to draw pixelated text
  const drawPixelatedText = (ctx, text, x, y, maxWidth, pixelSize) => {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px monospace';
    
    words.forEach(word => {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, lineY);
        line = word;
        lineY += 25; // Line spacing
      } else {
        line = testLine;
      }
    });
    
    ctx.fillText(line, x, lineY);
  };
  
  // Helper function to draw pixelated face
  const drawPixelatedFace = (ctx, x, y, pixelSize) => {
    // Hair (top row)
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#664229';
      ctx.fillRect(x + i * 6, y, 6, 6);
    }
    
    // Second row (hair sides, skin middle)
    ctx.fillStyle = '#664229';
    ctx.fillRect(x, y + 6, 6, 6);
    ctx.fillRect(x + 24, y + 6, 6, 6);
    
    ctx.fillStyle = '#F5D0A9';
    for (let i = 1; i < 4; i++) {
      ctx.fillRect(x + i * 6, y + 6, 6, 6);
    }
    
    // Face
    ctx.fillStyle = '#F5D0A9';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + i * 6, y + 12, 6, 6);
    }
    
    // Eyes/glasses
    ctx.fillStyle = '#F5D0A9';
    ctx.fillRect(x, y + 18, 6, 6);
    ctx.fillRect(x + 24, y + 18, 6, 6);
    
    ctx.fillStyle = '#000000';
    for (let i = 1; i < 4; i++) {
      ctx.fillRect(x + i * 6, y + 18, 6, 6);
    }
    
    // Lower face
    ctx.fillStyle = '#F5D0A9';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + i * 6, y + 24, 6, 6);
    }
    
    // Smile
    ctx.fillStyle = '#000000';
    for (let i = 1; i < 4; i++) {
      ctx.fillRect(x + i * 6, y + 24, 6, 1);
    }
    ctx.fillRect(x + 6, y + 25, 18, 2);
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default CanvasTweetPixelArt; 