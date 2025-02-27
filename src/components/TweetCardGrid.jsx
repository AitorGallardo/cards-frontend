// file: src/components/TweetCardGrid.jsx (updated)
import React, { useState, useEffect, useRef } from 'react';
import TweetCard from './TweetCard';
import CardEffects from './CardEffects';
import { generateSampleTweets, getRandomProfileColor } from '../utils/tweetUtils';
import shuffleSound from '../assets/shuffle.mp3';
import dealSound from '../assets/deal.mp3';
import placeSound from '../assets/place.mp3';
import stackSound from '../assets/stack.mp3';
import './Controls.css';


const TweetCardGrid = () => {
  const gridRef = useRef(null);
  const [tweets, setTweets] = useState([]);
  const [grid, setGrid] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snapGuide, setSnapGuide] = useState(null);
  const [isDealing, setIsDealing] = useState(true);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isStacking, setIsStacking] = useState(false);
  
  // Sound effects
  const shuffleSoundRef = useRef(null);
  const dealSoundRef = useRef(null);
  const placeSoundRef = useRef(null);
  const stackSoundRef = useRef(null);
  
  // Configure sounds
  useEffect(() => {
    shuffleSoundRef.current = new Audio(shuffleSound);
    shuffleSoundRef.current.volume = 0.4;
    
    dealSoundRef.current = new Audio(dealSound);
    dealSoundRef.current.volume = 0.3;
    
    placeSoundRef.current = new Audio(placeSound);
    placeSoundRef.current.volume = 0.3;
    
    stackSoundRef.current = new Audio(stackSound);
    stackSoundRef.current.volume = 0.5;
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
  
  // Handle card click for selection or dragging
  const handleCardClick = (tweetId, e) => {
    if (isDealing || isStacking) return;
    
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;
    
    if (isSelectionMode) {
      // Toggle selection
      const newSelectedCards = new Set(selectedCards);
      if (newSelectedCards.has(tweetId)) {
        newSelectedCards.delete(tweetId);
      } else {
        newSelectedCards.add(tweetId);
        
        // Play select sound
        if (dealSoundRef.current) {
          dealSoundRef.current.currentTime = 0;
          dealSoundRef.current.volume = 0.2;
          dealSoundRef.current.play();
        }
      }
      setSelectedCards(newSelectedCards);
    } else {
      // Start dragging
      handleMouseDown(tweetId, e);
    }
  };
  
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
      const nearestCell = findNearestCell(newX, newY);
      
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
    if (isDealing || isSelectionMode || isStacking) return;
    
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
    
    // Remember which grid cell this card came from (for reorganization)
    const sourceCell = tweet.gridCell;
    if (sourceCell) {
      // Track it as the source cell for reorganization
      tweet.sourceCell = sourceCell;
    }
  };
  
// file: src/components/TweetCardGrid.jsx (updated reorganization logic)

// Function to handle card dropping and reorganization
const handleMouseUp = () => {
  if (!draggingCard) return;
  
  const tweet = tweets.find(t => t.id === draggingCard);
  if (!tweet) {
    setDraggingCard(null);
    setSnapGuide(null);
    return;
  }
  
  // Find nearest grid cell
  const nearestCell = findNearestCell(tweet.position.x, tweet.position.y);
  
  if (nearestCell) {
    // Get the source cell this card was dragged from
    const sourceCell = tweet.sourceCell;
    const targetCell = nearestCell.id;
    
    // Check if target cell is already occupied by another card
    const occupiedBy = tweets.find(t => t.gridCell === targetCell && t.id !== draggingCard);
    
    if (occupiedBy) {
      // Play place sound
      if (placeSoundRef.current) {
        placeSoundRef.current.currentTime = 0;
        placeSoundRef.current.play();
      }
      
      // Swap positions: place dragged card in target position
      setTweets(prev => 
        prev.map(t => {
          if (t.id === draggingCard) {
            // Dragged card goes to target position
            return { 
              ...t, 
              position: { ...nearestCell.position }, 
              gridCell: targetCell,
              sourceCell: null,
              animationClass: 'shuffle',
              zIndex: 500
            };
          }
          return t;
        })
      );
      
      // Now trigger cascade reorganization starting from the displaced card
      setTimeout(() => {
        cascadeReorganize(occupiedBy.id, sourceCell, targetCell);
      }, 100);
    } else {
      // Target cell is empty, just place the card there
      setTweets(prev => 
        prev.map(t => 
          t.id === draggingCard
            ? { 
                ...t, 
                position: { ...nearestCell.position }, 
                gridCell: targetCell,
                sourceCell: null,
                animationClass: 'shuffle',
                zIndex: 500
              }
            : t
        )
      );
      
      // Update grid occupancy
      setGrid(prev => 
        prev.map(cell => 
          cell.id === targetCell
            ? { ...cell, occupied: true }
            : cell
        )
      );
      
      // If we had a source cell and it's different from target, reorganize
      if (sourceCell && sourceCell !== targetCell) {
        setTimeout(() => {
          reorganizeGrid(sourceCell);
        }, 300);
      }
    }
  } else {
    // Return to original position if available
    const originalCell = tweet.gridCell 
      ? grid.find(cell => cell.id === tweet.gridCell)
      : null;
      
    if (originalCell) {
      setTweets(prev => 
        prev.map(t => 
          t.id === draggingCard
            ? { 
                ...t, 
                position: { ...originalCell.position }, 
                gridCell: originalCell.id,
                sourceCell: null,
                animationClass: 'shuffle'
              }
            : t
        )
      );
    }
  }
  
  setDraggingCard(null);
  setSnapGuide(null);
};

// Cascade reorganization - move all cards one position following a specific path
const cascadeReorganize = (startCardId, emptyCell, targetCell) => {
  // Play shuffle sound
  if (shuffleSoundRef.current) {
    shuffleSoundRef.current.currentTime = 0;
    shuffleSoundRef.current.play();
  }
  
  // Convert cell ids to row/col
  const getRowCol = (cellId) => {
    const [row, col] = cellId.split('-').map(Number);
    return { row, col };
  };
  
  // Calculate the linear position of a cell (row * cols + col)
  const getCellPosition = (cellId) => {
    const { row, col } = getRowCol(cellId);
    return row * config.cols + col;
  };
  
  // Get all grid cells sorted by position
  const sortedCells = [...grid].sort((a, b) => {
    return getCellPosition(a.id) - getCellPosition(b.id);
  });
  
  // Get all cards in the grid
  const cardsInGrid = tweets.filter(t => t.gridCell !== null);
  
  // Find the displaced card and create a chain of movements
  const displacedCard = tweets.find(t => t.id === startCardId);
  if (!displacedCard || !emptyCell) return;
  
  // The first move is the displaced card to the empty cell
  const moveChain = [{
    tweetId: displacedCard.id,
    fromCell: displacedCard.gridCell,
    toCell: emptyCell
  }];
  
  // Now we need to find subsequent cards to move
  // Sort cards by their position in the grid
  const sortedCards = [...cardsInGrid].sort((a, b) => {
    if (!a.gridCell || !b.gridCell) return 0;
    return getCellPosition(a.gridCell) - getCellPosition(b.gridCell);
  });
  
  // Find index of the displaced card
  const displacedIndex = sortedCards.findIndex(t => t.id === displacedCard.id);
  
  // For each subsequent card, move it to the position of the previous card
  let currentFromCell = displacedCard.gridCell;
  for (let i = displacedIndex + 1; i < sortedCards.length; i++) {
    const nextCard = sortedCards[i];
    
    // Skip if this card doesn't have a grid position
    if (!nextCard.gridCell) continue;
    
    // Create the move
    moveChain.push({
      tweetId: nextCard.id,
      fromCell: nextCard.gridCell,
      toCell: currentFromCell
    });
    
    // Update the from cell for the next iteration
    currentFromCell = nextCard.gridCell;
  }
  
  // Execute the move chain with staggered timing
  moveChain.forEach((move, index) => {
    setTimeout(() => {
      const targetCell = grid.find(cell => cell.id === move.toCell);
      if (!targetCell) return;
      
      setTweets(prev => 
        prev.map(tweet => 
          tweet.id === move.tweetId
            ? { 
                ...tweet, 
                position: { ...targetCell.position }, 
                gridCell: move.toCell,
                animationClass: 'shuffle',
                zIndex: 100 + index
              }
            : tweet
          )
      );
      
      // Update grid occupancy
      setGrid(prev => 
        prev.map(cell => 
          cell.id === move.toCell
            ? { ...cell, occupied: true }
            : cell.id === move.fromCell
              ? { ...cell, occupied: false }
              : cell
        )
      );
    }, 100 + index * 50); // Stagger the animations
  });
  
  // Reset animation classes after animations complete
  setTimeout(() => {
    setTweets(prev => 
      prev.map(tweet => ({ 
        ...tweet, 
        animationClass: null,
        // Reset z-index based on grid position
        zIndex: tweet.gridCell ? getCellPosition(tweet.gridCell) + 1 : 1
      }))
    );
  }, 100 + moveChain.length * 50 + 500);
};
  
  // Find nearest grid cell (either empty or occupied)
  const findNearestCell = (x, y) => {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const cell of grid) {
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
  
  // Reorganize grid when a card is moved (improved version)
  const reorganizeGrid = (sourceCell, targetCell) => {
    if (!sourceCell || sourceCell === targetCell) return;
    
    // Play shuffle sound
    if (shuffleSoundRef.current) {
      shuffleSoundRef.current.currentTime = 0;
      shuffleSoundRef.current.play();
    }
    
    // We need to find cards that should be shifted to fill the source cell
    const sourceRow = parseInt(sourceCell.split('-')[0]);
    const sourceCol = parseInt(sourceCell.split('-')[1]);
    
    // Get all occupied cells
    const occupiedCellMap = {};
    tweets.forEach(tweet => {
      if (tweet.gridCell) {
        occupiedCellMap[tweet.gridCell] = true;
      }
    });
    
    // Calculate which cards need to move
    const cardsToMove = [];
    
    for (let row = sourceRow; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        // Skip the source cell itself
        if (row === sourceRow && col === sourceCol) continue;
        
        const cellId = `${row}-${col}`;
        
        // Skip the target cell (where the card was dropped)
        if (cellId === targetCell) continue;
        
        // If this cell is occupied, we might need to move it
        if (occupiedCellMap[cellId]) {
          // Find which cell this card should move to
          let targetRow = row;
          let targetCol = col;
          
          // If in the same row as source but after it, move left
          if (row === sourceRow && col > sourceCol) {
            targetCol = col - 1;
          } 
          // If in a row after source, move up a row
          else if (row > sourceRow) {
            // Move to the last position in the previous row
            if (col === 0) {
              targetRow = row - 1;
              targetCol = config.cols - 1;
            } else {
              targetCol = col - 1;
            }
          }
          
          const newCellId = `${targetRow}-${targetCol}`;
          
          // Skip if target is occupied
          if (occupiedCellMap[newCellId]) continue;
          
          // Find the tweet that's in this cell
          const tweetInCell = tweets.find(t => t.gridCell === cellId);
          if (tweetInCell) {
            cardsToMove.push({
              tweetId: tweetInCell.id,
              fromCell: cellId,
              toCell: newCellId
            });
            
            // Update the occupied map for next iterations
            occupiedCellMap[cellId] = false;
            occupiedCellMap[newCellId] = true;
          }
        }
      }
    }
    
    // Apply the moves with staggered timing
    cardsToMove.forEach((move, index) => {
      setTimeout(() => {
        const targetCell = grid.find(cell => cell.id === move.toCell);
        if (!targetCell) return;
        
        setTweets(prev => 
          prev.map(tweet => 
            tweet.id === move.tweetId
              ? { 
                  ...tweet, 
                  position: { ...targetCell.position }, 
                  gridCell: move.toCell,
                  animationClass: 'shuffle',
                  zIndex: 100 + index
                }
              : tweet
          )
        );
        
        // Update grid occupancy
        setGrid(prev => 
          prev.map(cell => 
            cell.id === move.toCell
              ? { ...cell, occupied: true }
              : cell.id === move.fromCell
                ? { ...cell, occupied: false }
                : cell
          )
        );
        
      }, 100 + index * 50); // Stagger the animations
    });
    
    // Reset animation classes after animations complete
    setTimeout(() => {
      setTweets(prev => 
        prev.map(tweet => ({ 
          ...tweet, 
          animationClass: null,
          // Reset z-index based on grid position
          zIndex: tweet.gridCell ? parseInt(tweet.gridCell.split('-')[0]) * config.cols + 
                                parseInt(tweet.gridCell.split('-')[1]) + 1 : 1
        }))
      );
    }, 100 + cardsToMove.length * 50 + 500);
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    if (isStacking) return;
    
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // Exiting selection mode, clear selections
      setSelectedCards(new Set());
    }
  };
  
  // Stack selected cards into a deck
  const stackSelectedCards = async () => {
    if (selectedCards.size < 2 || isStacking) return;
    
    setIsStacking(true);
    
    // Play stack sound
    if (stackSoundRef.current) {
      stackSoundRef.current.currentTime = 0;
      stackSoundRef.current.play();
    }
    
    // Find a suitable target position for the stack (center of the first selected card)
    const selectedTweets = tweets.filter(tweet => selectedCards.has(tweet.id));
    const firstCard = selectedTweets[0];
    const stackPosition = { ...firstCard.position };
    
    // Clear grid cells of selected cards
    setGrid(prev => 
      prev.map(cell => {
        const isOccupiedBySelectedCard = selectedTweets.some(tweet => tweet.gridCell === cell.id);
        return isOccupiedBySelectedCard ? { ...cell, occupied: false } : cell;
      })
    );
    
    // Sort cards so higher cards in the grid come first (for better animation)
    const sortedCards = [...selectedTweets].sort((a, b) => {
      if (!a.gridCell || !b.gridCell) return 0;
      const [aRow, aCol] = a.gridCell.split('-').map(Number);
      const [bRow, bCol] = b.gridCell.split('-').map(Number);
      return (aRow * config.cols + aCol) - (bRow * config.cols + bCol);
    });
    
    // Animate cards one by one to the stack
    for (let i = 0; i < sortedCards.length; i++) {
      const tweet = sortedCards[i];
      
      // Calculate slight offset for deck appearance
      const offsetX = i * 2;
      const offsetY = i * 2;
      
      setTweets(prev => 
        prev.map(t => 
          t.id === tweet.id
            ? { 
                ...t, 
                position: { 
                  x: stackPosition.x + offsetX, 
                  y: stackPosition.y + offsetY 
                }, 
                gridCell: null,
                animationClass: 'stack',
                zIndex: 200 + i,
                isStacked: true
              }
            : t
        )
      );
      
      // Play stack sound for each card
      if (dealSoundRef.current && i > 0) {
        dealSoundRef.current.currentTime = 0;
        dealSoundRef.current.volume = 0.15;
        dealSoundRef.current.play();
      }
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update remaining cards to fill empty spaces
    setTimeout(() => {
      reorganizeAfterStacking();
    }, 500);
    
    // Reset state
    setSelectedCards(new Set());
    setIsSelectionMode(false);
    
    // Allow some time for animations to complete
    setTimeout(() => {
      setIsStacking(false);
      
      // Reset animation classes
      setTweets(prev => 
        prev.map(tweet => ({
          ...tweet,
          animationClass: tweet.isStacked ? 'stacked' : null
        }))
      );
    }, 1000);
  };
  
  // Reorganize remaining cards after stacking
  const reorganizeAfterStacking = () => {
    // Play shuffle sound
    if (shuffleSoundRef.current) {
      shuffleSoundRef.current.currentTime = 0;
      shuffleSoundRef.current.play();
    }
    
    // Get all cards that aren't stacked
    const remainingCards = tweets.filter(tweet => !tweet.isStacked);
    
    // Find all empty grid cells
    const emptyCells = grid.filter(cell => !cell.occupied);
    
    // Sort both arrays to ensure consistent placement
    const sortedCells = [...emptyCells].sort((a, b) => {
      const [aRow, aCol] = a.id.split('-').map(Number);
      const [bRow, bCol] = b.id.split('-').map(Number);
      return (aRow * config.cols + aCol) - (bRow * config.cols + bCol);
    });
    
    const sortedCards = [...remainingCards].sort((a, b) => {
      if (!a.gridCell || !b.gridCell) return 0;
      const aOrder = a.gridCell ? parseInt(a.gridCell.split('-')[0]) * config.cols + 
                              parseInt(a.gridCell.split('-')[1]) : Infinity;
      const bOrder = b.gridCell ? parseInt(b.gridCell.split('-')[0]) * config.cols + 
                              parseInt(b.gridCell.split('-')[1]) : Infinity;
      return aOrder - bOrder;
    });
    
    // Find floating cards (no grid position) and cards that need to be moved
    const cardsToMove = [];
    const floatingCards = [];
    
    sortedCards.forEach(tweet => {
      if (!tweet.gridCell) {
        floatingCards.push(tweet);
      } else {
        // Check if this card needs to move to fill gaps
        const [row, col] = tweet.gridCell.split('-').map(Number);
        const index = row * config.cols + col;
        const shouldBeAt = sortedCells[cardsToMove.length + floatingCards.length];
        
        if (shouldBeAt && tweet.gridCell !== shouldBeAt.id) {
          cardsToMove.push({
            tweet,
            targetCell: shouldBeAt
          });
        }
      }
    });
    
    // Move cards to fill gaps
    cardsToMove.forEach((move, index) => {
      setTimeout(() => {
        setTweets(prev => 
          prev.map(t => 
            t.id === move.tweet.id
              ? { 
                  ...t, 
                  position: { ...move.targetCell.position }, 
                  gridCell: move.targetCell.id,
                  animationClass: 'shuffle',
                  zIndex: 100 + index
                }
              : t
          )
        );
        
        // Update grid occupancy
        setGrid(prev => 
          prev.map(cell => 
            cell.id === move.targetCell.id
              ? { ...cell, occupied: true }
              : cell.id === move.tweet.gridCell
                ? { ...cell, occupied: false }
                : cell
          )
        );
      }, 100 + index * 50);
    });
    
    // Place any floating cards
    floatingCards.forEach((tweet, index) => {
      const availableCell = sortedCells[cardsToMove.length + index];
      if (!availableCell) return;
      
      setTimeout(() => {
        setTweets(prev => 
          prev.map(t => 
            t.id === tweet.id
              ? { 
                  ...t, 
                  position: { ...availableCell.position }, 
                  gridCell: availableCell.id,
                  animationClass: 'shuffle',
                  zIndex: 100 + cardsToMove.length + index
                }
              : t
          )
        );
        
        // Update grid occupancy
        setGrid(prev => 
          prev.map(cell => 
            cell.id === availableCell.id
              ? { ...cell, occupied: true }
              : cell
          )
        );
      }, 100 + (cardsToMove.length + index) * 50);
    });
  };
  
// file: src/components/TweetCardGrid.jsx (updated unstacking)

// file: src/components/TweetCardGrid.jsx (corrected unstacking)

// Handle click for unstacking cards with proper reverse animation
// file: src/components/TweetCardGrid.jsx (refined card dealing)

// Handle unstack with smooth dealer-like animation
const handleUnstackClick = async () => {
  const stackedCards = tweets.filter(tweet => tweet.isStacked);
  if (stackedCards.length < 2 || isStacking) return;
  
  setIsStacking(true);
  
  // Play shuffle sound
  if (shuffleSoundRef.current) {
    shuffleSoundRef.current.currentTime = 0;
    shuffleSoundRef.current.volume = 0.4;
    shuffleSoundRef.current.play();
  }
  
  // Find empty cells
  const emptyCells = grid.filter(cell => !cell.occupied);
  if (emptyCells.length < stackedCards.length) {
    setIsStacking(false);
    return; // Not enough space
  }
  
  // Sort cells for a natural dealing pattern (left to right, top to bottom)
  const sortedCells = [...emptyCells].sort((a, b) => {
    const [aRow, aCol] = a.id.split('-').map(Number);
    const [bRow, bCol] = b.id.split('-').map(Number);
    return (aRow * config.cols + aCol) - (bRow * config.cols + bCol);
  });
  
  // Sort stacked cards by their z-index (original stacking order)
  const orderedStackedCards = [...stackedCards].sort((a, b) => a.zIndex - b.zIndex);
  
  // Get the position of the stack (for animation starting point)
  const stackPosition = {
    x: orderedStackedCards[0].position.x,
    y: orderedStackedCards[0].position.y
  };
  
  // First prepare the stack - a slight shuffle animation
  setTweets(prev => 
    prev.map(tweet => 
      tweet.isStacked
        ? { 
            ...tweet, 
            animationClass: 'shuffle-prepare',
            // Ensure all stacked cards are perfectly aligned
            position: {
              x: stackPosition.x + (tweet.zIndex % 5) * 2, 
              y: stackPosition.y + (tweet.zIndex % 5) * 2
            }
          }
        : tweet
    )
  );
  
  // Wait for the shuffle-prepare animation
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Deal cards with a smooth, professional card dealer motion
  for (let i = 0; i < orderedStackedCards.length; i++) {
    const tweet = orderedStackedCards[i];
    const targetCell = sortedCells[i];
    
    // Play card deal sound with slight variation
    if (dealSoundRef.current) {
      dealSoundRef.current.currentTime = 0;
      dealSoundRef.current.volume = 0.2 + Math.random() * 0.1;
      dealSoundRef.current.playbackRate = 0.9 + Math.random() * 0.2;
      dealSoundRef.current.play();
    }
    
    // Calculate the card's path for a natural dealing arc
    // Dealers typically deal in an arc from their position to the player's position
    const startPos = { 
      x: stackPosition.x + (tweet.zIndex % 5) * 2, 
      y: stackPosition.y + (tweet.zIndex % 5) * 2
    };
    
    const endPos = { ...targetCell.position };
    
    // Calculate control points for a bezier curve path
    // This creates the natural arc of a card being dealt
    const controlPoint1 = {
      x: startPos.x + (endPos.x - startPos.x) * 0.3,
      y: startPos.y - 40 - Math.random() * 20 // Slightly above the starting point
    };
    
    const controlPoint2 = {
      x: startPos.x + (endPos.x - startPos.x) * 0.7,
      y: endPos.y - 20 - Math.random() * 10 // Slightly above the ending point
    };
    
    // Set the card in dealing motion
    setTweets(prev => 
      prev.map(t => 
        t.id === tweet.id
          ? { 
              ...t,
              // Store path data for the animation
              dealPath: {
                start: startPos,
                end: endPos,
                control1: controlPoint1,
                control2: controlPoint2
              },
              gridCell: targetCell.id, // Set the final destination
              animationClass: 'card-dealing',
              zIndex: 500 - i, // Maintain proper layering during animation
              isStacked: false
            }
          : t
      )
    );
    
    // Update grid occupancy
    setGrid(prev => 
      prev.map(cell => 
        cell.id === targetCell.id
          ? { ...cell, occupied: true }
          : cell
      )
    );
    
    // Short delay between dealing each card (professionals deal quickly)
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  
  // Allow time for all dealing animations to complete
  setTimeout(() => {
    // Reset all cards to their final positions
    setTweets(prev => 
      prev.map(tweet => ({ 
        ...tweet, 
        animationClass: null,
        dealPath: null,
        // Place each card exactly at its grid position
        position: tweet.gridCell ? grid.find(cell => cell.id === tweet.gridCell)?.position || tweet.position : tweet.position,
        zIndex: tweet.gridCell ? parseInt(tweet.gridCell.split('-')[0]) * config.cols + 
                              parseInt(tweet.gridCell.split('-')[1]) + 1 : 1
      }))
    );
    setIsStacking(false);
  }, 800);
};
  
  return (
    <>
      <div className="controls">
        <button 
          className={`control-button ${isSelectionMode ? 'active' : ''}`}
          onClick={toggleSelectionMode}
          disabled={isDealing || isStacking}
        >
          {isSelectionMode ? 'Cancel Selection' : 'Select Cards'}
        </button>
        
        <button 
          className="control-button stack-button"
          onClick={stackSelectedCards}
          disabled={selectedCards.size < 2 || isDealing || isStacking}
        >
          Stack Selected ({selectedCards.size})
        </button>
        
        <button 
          className="control-button unstack-button"
          onClick={handleUnstackClick}
          disabled={!tweets.some(t => t.isStacked) || isDealing || isStacking}
        >
          Unstack Deck
        </button>
      </div>
      
      <div 
        className={`card-grid ${isSelectionMode ? 'selection-mode' : ''}`}
        ref={gridRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid snap guide */}
        {snapGuide && !isSelectionMode && (
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
            isSelected={selectedCards.has(tweet.id)}
            isSelectionMode={isSelectionMode}
            isStacked={tweet.isStacked}
            onClick={(e) => handleCardClick(tweet.id, e)}
            onMouseDown={(e) => handleMouseDown(tweet.id, e)}
            dealDelay={index * config.dealDelay}
            isDealing={isDealing}
            zIndex={tweet.zIndex || index + 1}
          />
        ))}
        
        {/* Card effects layer */}
        <CardEffects gridRef={gridRef} />
      </div>
    </>
  );
};

export default TweetCardGrid;