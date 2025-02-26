// file: src/components/TweetCardGrid.jsx (updated)
import React, { useState, useEffect, useRef } from 'react';
import TweetCard from './TweetCard';
import CardEffects from './CardEffects';
import { generateSampleTweets, getRandomProfileColor } from '../utils/tweetUtils';
import shuffleSound from '../assets/shuffle.mp3';
import dealSound from '../assets/deal.mp3';
import placeSound from '../assets/place.mp3';

const TweetCardGrid = () => {
  const gridRef = useRef(null);
  const [tweets, setTweets] = useState([]);
  const [grid, setGrid] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snapGuide, setSnapGuide] = useState(null);
  const [isDealing, setIsDealing] = useState(true);
  
  // Sound effects
  const shuffleSoundRef = useRef(null);
  const dealSoundRef = useRef(null);
  const placeSoundRef = useRef(null);
  
  // Configure sounds
  useEffect(() => {
    shuffleSoundRef.current = new Audio(shuffleSound);
    shuffleSoundRef.current.volume = 0.4;
    
    dealSoundRef.current = new Audio(dealSound);
    dealSoundRef.current.volume = 0.3;
    
    placeSoundRef.current = new Audio(placeSound);
    placeSoundRef.current.volume = 0.3;
  }, []);
  
  // Grid configuration
  const config = {
    cardWidth: 240,
    cardHeight: 280,
    gridGap: 20,
    cols: 4,
    rows: 4,
    dealDelay: 150, // ms between dealing each card
  };
  
  // Initialize grid and tweets
  useEffect(() => {
    // Create grid cells
    const newGrid = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        newGrid.push({
          id: `${row}-${col}`,
          position: {
            x: col * (config.cardWidth + config.gridGap) + 20,
            y: row * (config.cardHeight + config.gridGap) + 20
          },
          occupied: false
        });
      }
    }
    setGrid(newGrid);
    
    // Generate sample tweets
    const sampleTweets = generateSampleTweets(16);
    
    // Deal cards with delay (Balatro style)
    const dealCards = async () => {
      setIsDealing(true);
      const newTweets = [];
      
      // Initial pause
      await new Promise(resolve => setTimeout(resolve, 500));
      
      for (let i = 0; i < sampleTweets.length; i++) {
        // Play card deal sound
        if (dealSoundRef.current) {
          dealSoundRef.current.currentTime = 0;
          dealSoundRef.current.play();
        }
        
        const gridCell = newGrid[i];
        const tweet = {
          ...sampleTweets[i],
          position: { ...gridCell.position },
          gridCell: gridCell.id,
          dealt: true,
          dealIndex: i,
          // Add z-index for deck feel
          zIndex: i + 1
        };
        newTweets.push(tweet);
        
        // Mark grid cell as occupied
        newGrid[i].occupied = true;
        
        // Update state to trigger animation for each card
        setTweets([...newTweets]);
        
        // Delay between dealing cards
        await new Promise(resolve => setTimeout(resolve, config.dealDelay));
      }
      
      // Wait for last card animation to finish
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsDealing(false);
    };
    
    dealCards();
    
    return () => {
      // Cleanup
    };
  }, []);
  
  // Handle card dragging
  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    if (draggingCard) {
      // Calculate new position
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      // Find nearest grid cell
      const nearestCell = findNearestEmptyCell(newX, newY);
      
      // Update snap guide
      if (nearestCell) {
        setSnapGuide({
          x: nearestCell.position.x,
          y: nearestCell.position.y,
          width: config.cardWidth,
          height: config.cardHeight
        });
      } else {
        setSnapGuide(null);
      }
      
      // Update dragging card position
      setTweets(prev => 
        prev.map(tweet => 
          tweet.id === draggingCard
            ? { 
                ...tweet, 
                position: { x: newX, y: newY },
                // Move to top layer while dragging
                zIndex: 1000
              }
            : tweet
        )
      );
    }
  };
  
  const handleMouseDown = (tweetId, e) => {
    if (isDealing) return;
    
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;
    
    // Calculate offset from card origin to mouse
    const rect = e.currentTarget.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggingCard(tweetId);
    
    // Play pickup sound
    if (dealSoundRef.current) {
      dealSoundRef.current.currentTime = 0;
      dealSoundRef.current.play();
    }
    
    // Move card to top of stack (end of array)
    setTweets(prev => {
      const filtered = prev.filter(t => t.id !== tweetId);
      return [...filtered, tweet];
    });
    
    // Update grid occupancy
    if (tweet.gridCell) {
      setGrid(prev => 
        prev.map(cell => 
          cell.id === tweet.gridCell
            ? { ...cell, occupied: false }
            : cell
        )
      );
    }
  };
  
  const handleMouseUp = () => {
    if (!draggingCard) return;
    
    const tweet = tweets.find(t => t.id === draggingCard);
    if (!tweet) {
      setDraggingCard(null);
      setSnapGuide(null);
      return;
    }
    
    // Find nearest grid cell
    const nearestCell = findNearestEmptyCell(tweet.position.x, tweet.position.y);
    
    if (nearestCell) {
      // Play place sound
      if (placeSoundRef.current) {
        placeSoundRef.current.currentTime = 0;
        placeSoundRef.current.play();
      }
      
      // Snap to grid
      setTweets(prev => 
        prev.map(t => 
          t.id === draggingCard
            ? { 
                ...t, 
                position: { ...nearestCell.position }, 
                gridCell: nearestCell.id,
                animationClass: 'shuffle',
                // Keep higher z-index for a moment
                zIndex: 500
              }
            : t
        )
      );
      
      // Update grid occupancy
      setGrid(prev => 
        prev.map(cell => 
          cell.id === nearestCell.id
            ? { ...cell, occupied: true }
            : cell
        )
      );
      
      // Trigger shuffle animation for other cards
      setTimeout(() => {
        reorganizeCards();
      }, 300);
    } else {
      // Return to original position if available
      const originalCell = tweet.gridCell 
        ? grid.find(cell => cell.id === tweet.gridCell)
        : null;
        
      if (originalCell && !originalCell.occupied) {
        setTweets(prev => 
          prev.map(t => 
            t.id === draggingCard
              ? { 
                  ...t, 
                  position: { ...originalCell.position }, 
                  gridCell: originalCell.id,
                  animationClass: 'shuffle'
                }
              : t
          )
        );
        
        // Update grid occupancy
        setGrid(prev => 
          prev.map(cell => 
            cell.id === originalCell.id
              ? { ...cell, occupied: true }
              : cell
          )
        );
      }
    }
    
    setDraggingCard(null);
    setSnapGuide(null);
  };
  
  // Find nearest empty grid cell
  const findNearestEmptyCell = (x, y) => {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const cell of grid) {
      if (cell.occupied) continue;
      
      const dx = cell.position.x + config.cardWidth/2 - (x + config.cardWidth/2);
      const dy = cell.position.y + config.cardHeight/2 - (y + config.cardHeight/2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Set a threshold for snapping
      if (distance < 100 && distance < minDistance) {
        minDistance = distance;
        nearest = cell;
      }
    }
    
    return nearest;
  };
  
  // Reorganize cards to fill empty spaces (Balatro deck-style)
  const reorganizeCards = () => {
    // Play shuffle sound
    if (shuffleSoundRef.current) {
      shuffleSoundRef.current.currentTime = 0;
      shuffleSoundRef.current.play();
    }
    
    // Get all occupied cells and cards with cells
    const occupiedCells = new Set();
    const cardsWithCells = tweets.filter(tweet => tweet.gridCell).sort((a, b) => {
      // Sort by grid position (row, then column)
      const [aRow, aCol] = a.gridCell.split('-').map(Number);
      const [bRow, bCol] = b.gridCell.split('-').map(Number);
      return aRow === bRow ? aCol - bCol : aRow - bRow;
    });
    
    cardsWithCells.forEach(tweet => {
      occupiedCells.add(tweet.gridCell);
    });
    
    // Get all empty cells
    const emptyCells = grid
      .filter(cell => !occupiedCells.has(cell.id))
      .sort((a, b) => {
        // Sort by position (row, then column)
        const [aRow, aCol] = a.id.split('-').map(Number);
        const [bRow, bCol] = b.id.split('-').map(Number);
        return aRow === bRow ? aCol - bCol : aRow - bRow;
      });
    
    // Find floating cards (cards without grid cells)
    const floatingCards = tweets.filter(tweet => !tweet.gridCell);
    
    // Find gaps and move cards to fill them
    let updated = false;
    
    // Look for gaps in the grid
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const cellId = `${row}-${col}`;
        
        // If cell is empty, move a card to fill it
        if (!occupiedCells.has(cellId)) {
          // Find a card from a later position to move here
          let cardToMove = null;
          let cardIndex = -1;
          
          for (let i = 0; i < cardsWithCells.length; i++) {
            const card = cardsWithCells[i];
            const [cardRow, cardCol] = card.gridCell.split('-').map(Number);
            
            // Only move cards from later positions
            if (cardRow > row || (cardRow === row && cardCol > col)) {
              cardToMove = card;
              cardIndex = i;
              break;
            }
          }
          
          // If no card from later position, try to place a floating card
          if (!cardToMove && floatingCards.length > 0) {
            cardToMove = floatingCards.shift();
          }
          
          if (cardToMove) {
            // Update the card's position
            setTweets(prev => 
              prev.map(tweet => 
                tweet.id === cardToMove.id
                  ? { 
                      ...tweet, 
                      position: grid.find(cell => cell.id === cellId).position,
                      gridCell: cellId,
                      animationClass: 'shuffle',
                      // Add staggered z-index for proper Balatro deck feel
                      zIndex: 100 + (row * config.cols + col)
                    }
                  : tweet
              )
            );
            
            // Update grid occupancy
            setGrid(prev => 
              prev.map(cell => 
                cell.id === cellId
                  ? { ...cell, occupied: true }
                  : cell.id === cardToMove.gridCell
                    ? { ...cell, occupied: false }
                    : cell
              )
            );
            
            // If we moved a card with a grid cell, update the cardsWithCells array
            if (cardIndex !== -1) {
              cardsWithCells.splice(cardIndex, 1);
            }
            
            occupiedCells.add(cellId);
            if (cardToMove.gridCell) {
              occupiedCells.delete(cardToMove.gridCell);
            }
            
            updated = true;
          }
        }
      }
    }
    
    // Place any remaining floating cards in any empty cells
    if (floatingCards.length > 0 && emptyCells.length > 0) {
      floatingCards.forEach((card, index) => {
        if (index < emptyCells.length) {
          const cell = emptyCells[index];
          
          setTweets(prev => 
            prev.map(tweet => 
              tweet.id === card.id
                ? { 
                    ...tweet, 
                    position: cell.position,
                    gridCell: cell.id,
                    animationClass: 'shuffle'
                  }
                : tweet
            )
          );
          
          // Update grid occupancy
          setGrid(prev => 
            prev.map(gridCell => 
              gridCell.id === cell.id
                ? { ...gridCell, occupied: true }
                : gridCell
            )
          );
          
          updated = true;
        }
      });
    }
    
    // Reset animation classes after animations complete
    if (updated) {
      setTimeout(() => {
        setTweets(prev => 
          prev.map(tweet => ({ ...tweet, animationClass: null }))
        );
      }, 500);
    }
  };
  
  return (
    <div 
      className="card-grid" 
      ref={gridRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid snap guide */}
      {snapGuide && (
        <div 
          className="grid-snap-guide"
          style={{
            left: snapGuide.x,
            top: snapGuide.y,
            width: snapGuide.width,
            height: snapGuide.height
          }}
        />
      )}
      
      {/* Tweet cards */}
      {tweets.map((tweet, index) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          isDragging={draggingCard === tweet.id}
          onMouseDown={(e) => handleMouseDown(tweet.id, e)}
          dealDelay={index * config.dealDelay}
          isDealing={isDealing}
          zIndex={tweet.zIndex || index + 1}
        />
      ))}
      
      {/* Card effects layer */}
      <CardEffects gridRef={gridRef} />
    </div>
  );
};

export default TweetCardGrid;