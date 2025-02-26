// components/OptimizedTweetGrid.js
import React, { useRef, useEffect, useState, useMemo } from 'react';

export const OptimizedTweetGrid = ({ 
  tweets = [], 
  gridSize = 7, 
  enhancedVersion = false 
}) => {
  const canvasRef = useRef(null);
  const [hoveredTweet, setHoveredTweet] = useState(null);
  const [grabbedTweet, setGrabbedTweet] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);
  const [grid, setGrid] = useState([]);
  
  // Configuration
  const config = useMemo(() => ({
    cardWidth: enhancedVersion ? 280 : 240, // Larger cards in enhanced version
    cardHeight: enhancedVersion ? 280 : 240,
    gridSpacing: enhancedVersion ? 15 : 10,
    cols: gridSize,
    animationSpeed: enhancedVersion ? 0.4 : 0.3, // Smoother animation in enhanced version
    snapThreshold: enhancedVersion ? 40 : 30, // Better snapping in enhanced version
    hoverScale: enhancedVersion ? 1.2 : 1.15, // Larger hover effect in enhanced version
    shadowBlur: enhancedVersion ? 20 : 12, // Enhanced shadow effect
    animationAmplitude: enhancedVersion ? 6 : 4, // Stronger floating animation
  }), [enhancedVersion, gridSize]);

  // Generate grid cells
  useEffect(() => {
    const cols = config.cols;
    const rows = Math.ceil(50 / cols);
    const cellWidth = config.cardWidth + config.gridSpacing;
    const cellHeight = config.cardHeight + config.gridSpacing;
    
    const newGrid = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newGrid.push({
          id: row * cols + col,
          position: {
            x: col * cellWidth,
            y: row * cellHeight
          },
          occupied: false
        });
      }
    }
    setGrid(newGrid);
  }, [config]);

  // Generate 50 sample tweets if none provided
  const allTweets = useMemo(() => {
    if (tweets.length > 0) return tweets;
    
    return Array(50).fill().map((_, i) => {
      const col = i % config.cols;
      const row = Math.floor(i / config.cols);
      
      return {
        id: i,
        username: `User${i}`,
        handle: `@user${i}`,
        content: `This is sample tweet #${i}. Pixel art is amazing!`,
        profileColor: getRandomColor(),
        position: { 
          x: col * (config.cardWidth + config.gridSpacing), 
          y: row * (config.cardHeight + config.gridSpacing)
        },
        rotation: Math.random() * 2 - 1, // Slight random rotation (-1 to 1 degrees)
        scale: 1,
        gridCell: i // Reference to grid cell
      };
    });
  }, [tweets, config]);

  // Template caching
  const templateCache = useMemo(() => {
    const cache = {};
    
    // Pre-render the card template
    const createTemplate = () => {
      const canvas = document.createElement('canvas');
      canvas.width = config.cardWidth;
      canvas.height = config.cardHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw card background
      ctx.fillStyle = '#1A1A1A';
      roundRect(ctx, 0, 0, config.cardWidth, config.cardHeight, 12);
      
      return canvas;
    };
    
    cache.cardTemplate = createTemplate();
    
    return cache;
  }, [config]);

  function getRandomColor() {
    const colors = ['#FFC857', '#5DADEC', '#77DD77', '#FF6B6B', '#CB99C9', '#FDFD96'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Find the nearest available grid cell
  const findNearestGridCell = (x, y) => {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const cell of grid) {
      // Skip occupied cells (except for the cell occupied by the grabbed tweet)
      const grabbedTweetObj = allTweets.find(t => t.id === grabbedTweet);
      if (cell.occupied && grabbedTweetObj && grabbedTweetObj.gridCell !== cell.id) {
        continue;
      }
      
      const dx = cell.position.x - x;
      const dy = cell.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cell;
      }
    }
    
    // Only snap if we're close enough
    if (minDistance <= config.snapThreshold) {
      return nearest;
    }
    return null;
  };

  // Update grid occupancy
  const updateGridOccupancy = () => {
    // Reset all cells to unoccupied
    const updatedGrid = grid.map(cell => ({ ...cell, occupied: false }));
    
    // Mark cells as occupied based on tweet positions
    allTweets.forEach(tweet => {
      if (tweet.gridCell !== undefined) {
        const cellIndex = updatedGrid.findIndex(cell => cell.id === tweet.gridCell);
        if (cellIndex !== -1) {
          updatedGrid[cellIndex].occupied = true;
        }
      }
    });
    
    setGrid(updatedGrid);
  };

  useEffect(() => {
    updateGridOccupancy();
  }, [allTweets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pixelSize = 3; // Size of each "pixel" in our art
    
    // Set canvas size based on the grid
    const cols = config.cols;
    const rows = Math.ceil(allTweets.length / cols);
    const canvasWidth = cols * (config.cardWidth + config.gridSpacing);
    const canvasHeight = rows * (config.cardHeight + config.gridSpacing);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Animation loop
    let animationFrameId;
    let frameCount = 0;
    
    const render = () => {
      frameCount++;
      // Update animation state every 2 frames for better performance
      if (frameCount % 2 === 0) {
        setAnimationFrame(prevFrame => (prevFrame + 1) % 100);
      }
      
      // Clear canvas
      ctx.fillStyle = '#0F0F0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Optionally show grid (for debugging)
      // if (true) {
      //   ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      //   grid.forEach(cell => {
      //     ctx.strokeRect(
      //       cell.position.x, 
      //       cell.position.y, 
      //       config.cardWidth, 
      //       config.cardHeight
      //     );
      //   });
      // }
      
      // Draw all tweets
      allTweets.forEach((tweet, index) => {
        // Skip grabbed tweet (it will be drawn at mouse position)
        if (grabbedTweet === tweet.id) return;
        
        // Only animate if visible in viewport (optimization)
        const isVisible = true; // Simplified; would check against viewport
        
        // Apply idle animation (slower)
        const idleOffsetY = isVisible 
          ? Math.sin((frameCount * config.animationSpeed + index * 20) / 40) * 3 
          : 0;
        
        // Apply hover effect
        const isHovered = hoveredTweet === tweet.id;
        const scale = isHovered ? 1.1 : 1;
        
        // Draw tweet
        drawTweet(
          ctx, 
          tweet, 
          tweet.position.x, 
          tweet.position.y + idleOffsetY, 
          pixelSize,
          scale,
          tweet.rotation,
          templateCache
        );
      });
      
      // Draw grabbed tweet last (on top)
      if (grabbedTweet !== null) {
        const tweet = allTweets.find(t => t.id === grabbedTweet);
        if (tweet) {
          // Find nearest grid cell for snapping visual hint
          const nearestCell = findNearestGridCell(mousePos.x - offset.x, mousePos.y - offset.y);
          
          // Position (with snapping preview if near a cell)
          const x = nearestCell ? nearestCell.position.x : mousePos.x - offset.x;
          const y = nearestCell ? nearestCell.position.y : mousePos.y - offset.y;
          
          // Draw shadow/outline for grid snapping preview
          if (nearestCell) {
            ctx.save();
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 3;
            roundRect(
              ctx, 
              x, 
              y, 
              config.cardWidth, 
              config.cardHeight, 
              12,
              false,
              true
            );
            ctx.restore();
          }
          
          drawTweet(
            ctx, 
            tweet, 
            x, 
            y, 
            pixelSize,
            1.1,
            tweet.rotation * 2, // Exaggerate rotation when grabbed
            templateCache
          );
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [allTweets, hoveredTweet, grabbedTweet, mousePos, offset, animationFrame, grid, config, templateCache]);

  // Draw a single tweet on the canvas
  const drawTweet = (ctx, tweet, x, y, pixelSize, scale = 1, rotation = 0, cache) => {
    const width = config.cardWidth * scale;
    const height = config.cardHeight * scale;
    
    // Save context state
    ctx.save();
    
    // Translate to center of tweet for rotation
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(rotation * Math.PI / 180);
    
    // Use cached template for better performance
    if (scale === 1 && cache?.cardTemplate) {
      // Draw the cached template
      ctx.drawImage(cache.cardTemplate, -width/2, -height/2, width, height);
    } else {
      // Draw card background if we need to scale or don't have a cache
      ctx.fillStyle = '#1A1A1A';
      roundRect(ctx, -width/2, -height/2, width, height, 12 * scale);
    }
    
    // Draw profile circle
    ctx.fillStyle = tweet.profileColor;
    ctx.beginPath();
    ctx.arc(-width/2 + 38 * scale, -height/2 + 38 * scale, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pixelated face (scaled up by 50%)
    drawPixelatedFace(ctx, -width/2 + 23 * scale, -height/2 + 23 * scale, pixelSize * scale);
    
    // Draw username
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${18 * scale}px monospace`;
    ctx.fillText(tweet.username, -width/2 + 68 * scale, -height/2 + 33 * scale);
    
    // Draw handle
    ctx.fillStyle = '#6D6D6D';
    ctx.font = `${15 * scale}px monospace`;
    ctx.fillText(tweet.handle, -width/2 + 68 * scale, -height/2 + 53 * scale);
    
    // Draw content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${16 * scale}px monospace`;
    wrapText(ctx, tweet.content, -width/2 + 23 * scale, -height/2 + 90 * scale, width - 45 * scale, 22 * scale);
    
    // Restore context state
    ctx.restore();
  };

  // Helper function for rounded rectangles
  function roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
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
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Helper function for text wrapping
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y + (lineCount * lineHeight));
        line = words[n] + ' ';
        lineCount++;
        
        // Limit to 6 lines
        if (lineCount >= 6) {
          if (n < words.length - 1) {
            line = line.slice(0, -1) + '...';
          }
          ctx.fillText(line, x, y + (lineCount * lineHeight));
          break;
        }
      } else {
        line = testLine;
      }
    }
    
    // Print last line
    if (lineCount < 6) {
      ctx.fillText(line, x, y + (lineCount * lineHeight));
    }
  };

  // Helper function to draw pixelated face
  const drawPixelatedFace = (ctx, x, y, size) => {
    // Scaled up pixel face (50% larger)
    // Hair
    ctx.fillStyle = '#664229';
    ctx.fillRect(x, y, size*5, size);
    ctx.fillRect(x, y+size, size, size*3);
    ctx.fillRect(x+size*4, y+size, size, size*3);
    
    // Face
    ctx.fillStyle = '#F5D0A9';
    ctx.fillRect(x+size, y+size, size*3, size*4);
    
    // Eyes/glasses
    ctx.fillStyle = '#000000';
    ctx.fillRect(x+size, y+size*2, size, size);
    ctx.fillRect(x+size*3, y+size*2, size, size);
    
    // Glasses frame
    ctx.fillRect(x+size, y+size*2, size*3, size/2);
    
    // Smile
    ctx.fillRect(x+size*1.5, y+size*4, size*2, size/2);
  };

  // Mouse event handlers with optimized grid management
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setMousePos({ x, y });
    
    // Update position if grabbing a tweet
    if (grabbedTweet !== null) return;
    
    // Check for hover (only check tweets in view)
    let hovered = null;
    for (let i = allTweets.length - 1; i >= 0; i--) {
      const tweet = allTweets[i];
      
      // Simple bounding box check
      if (
        x >= tweet.position.x && 
        x <= tweet.position.x + config.cardWidth &&
        y >= tweet.position.y && 
        y <= tweet.position.y + config.cardHeight
      ) {
        hovered = tweet.id;
        break;
      }
    }
    setHoveredTweet(hovered);
  };

  const handleMouseDown = (e) => {
    if (hoveredTweet !== null) {
      setGrabbedTweet(hoveredTweet);
      
      const tweet = allTweets.find(t => t.id === hoveredTweet);
      if (tweet) {
        setOffset({
          x: mousePos.x - tweet.position.x,
          y: mousePos.y - tweet.position.y
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (grabbedTweet !== null) {
      // Find the nearest grid cell for snapping
      const tweet = allTweets.find(t => t.id === grabbedTweet);
      if (tweet) {
        const nearestCell = findNearestGridCell(mousePos.x - offset.x, mousePos.y - offset.y);
        
        // Create a copy of all tweets for update
        const updatedTweets = [...allTweets];
        const index = updatedTweets.findIndex(t => t.id === grabbedTweet);
        
        if (index !== -1) {
          // Update position and grid cell reference
          if (nearestCell) {
            // Snap to grid
            updatedTweets[index] = {
              ...updatedTweets[index],
              position: { ...nearestCell.position },
              gridCell: nearestCell.id
            };
          } else {
            // Free positioning if not near a grid cell
            updatedTweets[index] = {
              ...updatedTweets[index],
              position: {
                x: mousePos.x - offset.x,
                y: mousePos.y - offset.y
              },
              gridCell: undefined
            };
          }
          
          // Update the tweets
          setGrid(prev => {
            const updated = [...prev];
            
            // Mark previous cell as unoccupied
            const oldCellId = tweet.gridCell;
            if (oldCellId !== undefined) {
              const oldCellIndex = updated.findIndex(cell => cell.id === oldCellId);
              if (oldCellIndex !== -1) {
                updated[oldCellIndex] = { ...updated[oldCellIndex], occupied: false };
              }
            }
            
            // Mark new cell as occupied
            if (nearestCell) {
              const newCellIndex = updated.findIndex(cell => cell.id === nearestCell.id);
              if (newCellIndex !== -1) {
                updated[newCellIndex] = { ...updated[newCellIndex], occupied: true };
              }
            }
            
            return updated;
          });
        }
      }
      
      // Reset grabbed state
      setGrabbedTweet(null);
    }
  };

  return (
    <div className="tweet-pixel-art-container">
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          height: 'auto',
          cursor: hoveredTweet !== null ? 'pointer' : 'default',
          border: '1px solid #333'
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default OptimizedTweetGrid;