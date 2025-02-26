import { OptimizedTweetGrid } from '../components/OptimizedTweetGrid';
import './GridV2.css';

function GridV2() {
  return (
    <div className="container">
      <h1>Interactive Tweet Grid V2</h1>
      
      <div className="enhancements">
        <h2>Version 2 Enhancements</h2>
        <div className="enhance-features">
          <p>This improved version includes:</p>
          <ul className="list-disc">
            <li>Smoother animations for tweet movements</li>
            <li>Intelligent grid arrangement for better tweet visibility</li>
            <li>Enhanced hover effects and transitions</li>
            <li>Support for more tweet layouts and styles</li>
            <li>Better performance with optimized rendering</li>
          </ul>
        </div>
      </div>
      
      <div className="tweet-grid-container">
        <OptimizedTweetGrid gridSize={5} enhancedVersion={true} />
      </div>
      
      <div className="instructions">
        <h2>How to Use</h2>
        <p>Interact with the grid of tweet pixels below:</p>
        <ul className="list-disc">
          <li>Click on a tweet to expand it</li>
          <li>Hover over tweets to see preview animations</li>
          <li>Drag tweets to rearrange them in the grid</li>
          <li>Double-click to see engagement metrics</li>
          <li>Use the scroll wheel to zoom in and out</li>
        </ul>
      </div>
    </div>
  );
}

export default GridV2; 