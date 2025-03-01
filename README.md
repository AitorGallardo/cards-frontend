# Pixel Art Tweet Grid

A React + Vite application that displays tweets as interactive pixel art cards in a grid layout with Balatro-style card animations.

## Project Overview

This project creates a grid of pixel art tweet cards that users can interact with in various ways:
- Drag and drop cards to reorganize the grid
- Select multiple cards and stack them into a deck
- Unstack a deck to deal cards back to the grid like a professional card dealer
- Enjoy smooth Balatro-inspired card animations

![Pixel Art Tweet Grid Demo](./demo.gif)

## Key Features

### 1. Pixel Art Styling
- Custom pixel art rendering for tweet cards
- Pixelated profile pictures and decorative elements
- Canvas-based rendering for high performance

### 2. Interactive Card Grid
- Drag and drop functionality
- Smart grid reorganization
- Card selection mode
- Card stacking and unstacking

### 3. Balatro-Style Animations
- Professional card dealing animations
- Deck stacking/unstacking animations
- Smooth hover and movement effects
- Dynamic shadows and reflections

### 4. Real-time Feedback
- Visual guides when moving cards
- Selection indicators
- Animation and sound effects

## Implementation Details

### Grid Reorganization Logic
The grid follows specific reorganization rules:
- When a card is moved, its original position is left empty
- When dropped on another card, the displaced card and all subsequent cards move forward one position
- Cards follow a natural reading order (left-to-right, top-to-bottom)
- No empty spaces are left after reorganization

### Card Dealing Animation
The card dealing animation is designed to mimic a professional card dealer:
- Cards follow natural arcing paths using cubic bezier curves
- Cards rotate realistically during flight
- Each card has subtle variations for natural movement
- Animation timing creates a satisfying dealing rhythm

### Stacking/Unstacking
- Cards stack with a satisfying animation
- Unstacking deals cards back to the grid with professional dealing animation
- Original stacking order is preserved during unstacking

## Project Structure

```
tweet-pixel-art/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── assets/
│   │   ├── shuffle.mp3
│   │   ├── deal.mp3
│   │   └── place.mp3
│   ├── components/
│   │   ├── TweetCardGrid.jsx    # Main grid component with interaction logic
│   │   ├── TweetCard.jsx        # Individual card component
│   │   └── CardEffects.jsx      # Visual effects for cards
│   ├── styles/
│   │   ├── TweetCard.css        # Card styling and animations
│   │   └── Controls.css         # Button styling
│   ├── utils/
│   │   ├── tweetUtils.js        # Tweet data generation
│   │   └── pixelArtRenderer.js  # Canvas-based pixel art renderer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

## Iteration History

This project has gone through several iterations to improve:
1. Initial implementation of pixel art cards with basic drag and drop
2. Addition of grid management and card reorganization
3. Implementation of card selection and stacking features
4. Refinement of animations to match Balatro-style card handling
5. Enhancement of unstacking to use professional card dealing motion

## Current Challenges

The main focus has been on perfecting:
1. Natural card movement and animations
2. Proper grid reorganization logic
3. Professional card dealing during unstacking

## Next Steps

Potential future enhancements:
- Connecting to real tweet data via API
- Adding more pixel art customization options
- Implementing additional card interactions and animations
- Supporting responsive layouts for different screen sizes