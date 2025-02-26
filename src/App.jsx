import { useState } from 'react'
import './App.css'
import CanvasTweetPixelArt from './components/CanvasTweetPixelArt.jsx'

function App() {
  const [tweet, setTweet] = useState({
    username: 'John Doe',
    handle: '@johndoe',
    profileColor: '#4A8FE7',
    content: 'This is my pixel art tweet! Canvas is pretty cool for creating custom graphics in React. #pixelart #reactjs'
  })

  return (
    <div className="app-container">
      <h1>Tweet Pixel Art Generator</h1>
      <div className="canvas-container">
        <CanvasTweetPixelArt tweet={tweet} />
      </div>
      <div className="controls">
        <div className="form-group">
          <label>Username:</label>
          <input 
            type="text" 
            value={tweet.username} 
            onChange={(e) => setTweet({...tweet, username: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Handle:</label>
          <input 
            type="text" 
            value={tweet.handle} 
            onChange={(e) => setTweet({...tweet, handle: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Profile Color:</label>
          <input 
            type="color" 
            value={tweet.profileColor} 
            onChange={(e) => setTweet({...tweet, profileColor: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Tweet Content:</label>
          <textarea 
            value={tweet.content} 
            onChange={(e) => setTweet({...tweet, content: e.target.value})}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

export default App
