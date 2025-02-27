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
  


    