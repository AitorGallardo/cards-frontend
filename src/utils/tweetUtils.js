// file: src/utils/tweetUtils.js
export const generateSampleTweets = (count = 16) => {
    const sampleContent = [
      "The best way to build an AI app right now is with @aisdk! Go from idea → working app in 15 mins.",
      "Just learned how to create pixel art from tweets in Vite.js. This is amazing!",
      "The future of web development is all about creative visualizations of data. Pixel art makes everything better.",
      "Working with React and canvas for pixel art is super fun!",
      "Balatro-style card animations make everything feel so satisfying.",
      "Tips for better pixel art: limit your color palette and embrace constraints.",
      "Today I learned how to implement drag & drop with grid snapping in React.",
      "Building a tweet visualization tool using pixel art as the aesthetic.",
      "The key to good UI animations is subtle timing and easing functions.",
      "Just shipped a new feature - pixel art avatars for all users!",
      "I love how CSS animations can bring life to static elements.",
      "Optimizing canvas rendering made my app 10x faster.",
      "Grid layouts don't have to be boring - add some card animations!",
      "The best web apps combine great functionality with delightful animations.",
      "Learning to code is like learning pixel art - it's all about the details.",
      "My favorite part of frontend development is creating little moments of joy."
    ];
    
    const users = [
      { username: "Sully", handle: "@SullyOmarr" },
      { username: "PixelArtFan", handle: "@pixelfan" },
      { username: "ReactDev", handle: "@reactdev" },
      { username: "WebAnimator", handle: "@webanimator" },
      { username: "CodeArtist", handle: "@codeartist" },
      { username: "UIDesigner", handle: "@uidesigner" },
      { username: "DevTips", handle: "@devtips" },
      { username: "FrontendWiz", handle: "@frontendwiz" }
    ];
    
    return Array(count).fill().map((_, i) => ({
      id: `tweet-${i}`,
      username: users[i % users.length].username,
      handle: users[i % users.length].handle,
      content: sampleContent[i % sampleContent.length],
      profileColor: getRandomProfileColor()
    }));
  };
  
  export const getRandomProfileColor = () => {
    const colors = [
      '#FFC857', // Yellow
      '#5DADEC', // Blue
      '#77DD77', // Green
      '#FF6B6B', // Red
      '#CB99C9', // Purple
      '#FDFD96', // Light Yellow
      '#FFB347', // Orange
      '#87CEEB', // Sky Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // file: src/utils/pixelArtRenderer.js
  export const renderPixelArt = (canvas, tweet) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, width, height);
    
    // Draw card outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    roundRect(ctx, 2, 2, width - 4, height - 4, 10, true, true);
    
    // Add pixel art noise texture (subtle)
    addPixelNoise(ctx, width, height, 0.05);
    
    // Draw profile section
    ctx.fillStyle = tweet.profileColor;
    ctx.beginPath();
    ctx.arc(50, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw profile picture (pixel art style)
    drawPixelatedFace(ctx, 30, 30, tweet.profileColor);
    
    // Draw username
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.fillText(tweet.username, 90, 45);
    
    // Draw handle
    ctx.fillStyle = '#999999';
    ctx.font = '14px monospace';
    ctx.fillText(tweet.handle, 90, 65);
    
    // Draw separator
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(20, 85);
    ctx.lineTo(width - 20, 85);
    ctx.stroke();
    
    // Draw content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '15px monospace';
    wrapText(ctx, tweet.content, 20, 115, width - 40, 22);
    
    // Add pixel art corner decorations
    drawCornerPixels(ctx, width, height, tweet.profileColor);
  };
  
  // Helper for rounded rectangles
  const roundRect = (ctx, x, y, width, height, radius, fill = true, stroke = false) => {
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
  };
  
  // Pixelated face drawing
// file: src/utils/pixelArtRenderer.js (continued)

// Pixelated face drawing (continued)
const drawPixelatedFace = (ctx, x, y, profileColor) => {
    const pixelSize = 5;
    
    // Hair color derived from profile color but darker
    const hairColor = darkenColor(profileColor, 40);
    
    // Skin tone - warm beige
    const skinColor = '#F5D0A9';
    
    // Glasses color - black
    const glassesColor = '#000000';
    
    // Simple pixel art face grid (8x8 pixels)
    const faceGrid = [
      'HHHHHHH',
      'HSSSSHH',
      'HSGSGSH',
      'HSSSSHH',
      'HSMMMSH',
      'HSSSSHH',
      'HHHHHHH'
    ];
    
    // Draw each pixel
    for (let row = 0; row < faceGrid.length; row++) {
      for (let col = 0; col < faceGrid[row].length; col++) {
        const pixelType = faceGrid[row][col];
        if (pixelType === ' ') continue; // Empty space
        
        // Choose color based on pixel type
        let pixelColor;
        switch (pixelType) {
          case 'H': pixelColor = hairColor; break;    // Hair
          case 'S': pixelColor = skinColor; break;    // Skin
          case 'G': pixelColor = glassesColor; break; // Glasses
          case 'M': pixelColor = '#333333'; break;    // Mouth/smile
          default: pixelColor = '#FFFFFF';
        }
        
        // Draw the pixel
        ctx.fillStyle = pixelColor;
        ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
      }
    }
  };
  
  // Add subtle pixel noise for texture
  const addPixelNoise = (ctx, width, height, intensity = 0.05) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < intensity) {
        const value = Math.random() < 0.5 ? -10 : 10;
        data[i] = Math.max(0, Math.min(255, data[i] + value));     // R
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + value)); // G
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + value)); // B
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  // Draw pixel art decorations in corners
  const drawCornerPixels = (ctx, width, height, color) => {
    const pixelSize = 4;
    const cornerSize = 4; // In pixels
    
    // Lighter version of profile color
    const lightColor = lightenColor(color, 30);
    
    // Top-left corner
    for (let y = 0; y < cornerSize; y++) {
      for (let x = 0; x < cornerSize - y; x++) {
        ctx.fillStyle = lightColor;
        ctx.fillRect(
          x * pixelSize + 10, 
          y * pixelSize + 10, 
          pixelSize, pixelSize
        );
      }
    }
    
    // Top-right corner
    for (let y = 0; y < cornerSize; y++) {
      for (let x = 0; x < cornerSize - y; x++) {
        ctx.fillStyle = lightColor;
        ctx.fillRect(
          width - (x * pixelSize + 10 + pixelSize), 
          y * pixelSize + 10, 
          pixelSize, pixelSize
        );
      }
    }
    
    // Bottom-left corner
    for (let y = 0; y < cornerSize; y++) {
      for (let x = 0; x < cornerSize - y; x++) {
        ctx.fillStyle = lightColor;
        ctx.fillRect(
          x * pixelSize + 10, 
          height - (y * pixelSize + 10 + pixelSize), 
          pixelSize, pixelSize
        );
      }
    }
    
    // Bottom-right corner
    for (let y = 0; y < cornerSize; y++) {
      for (let x = 0; x < cornerSize - y; x++) {
        ctx.fillStyle = lightColor;
        ctx.fillRect(
          width - (x * pixelSize + 10 + pixelSize), 
          height - (y * pixelSize + 10 + pixelSize), 
          pixelSize, pixelSize
        );
      }
    }
  };
  
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
        // Add a bit of pixel-style randomness to the line
        pixelateText(ctx, line.trim(), x, y + (lineCount * lineHeight));
        line = words[n] + ' ';
        lineCount++;
        
        // Limit to 6 lines
        if (lineCount >= 6) {
          if (n < words.length - 1) {
            line = line.slice(0, -1) + '...';
          }
          pixelateText(ctx, line.trim(), x, y + (lineCount * lineHeight));
          break;
        }
      } else {
        line = testLine;
      }
    }
    
    // Print last line
    if (lineCount < 6) {
      pixelateText(ctx, line.trim(), x, y + (lineCount * lineHeight));
    }
  };
  
  // Add slight pixelation effect to text
  const pixelateText = (ctx, text, x, y) => {
    // Draw text normally first
    ctx.fillText(text, x, y);
    
    // Then add a few random pixel-style "artifacts" for effect
    const textWidth = ctx.measureText(text).width;
    const pixelSize = 2;
    
    for (let i = 0; i < textWidth / 20; i++) {
      if (Math.random() < 0.3) {
        const pixelX = x + Math.random() * textWidth;
        const pixelY = y - 4 + Math.random() * 8;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
      }
    }
  };
  
  // Helper for darkening colors
  const darkenColor = (hex, percent) => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
  
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
  
    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;
  
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Helper for lightening colors
  const lightenColor = (hex, percent) => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
  
    r = Math.min(255, Math.floor(r * (100 + percent) / 100));
    g = Math.min(255, Math.floor(g * (100 + percent) / 100));
    b = Math.min(255, Math.floor(b * (100 + percent) / 100));
  
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

    