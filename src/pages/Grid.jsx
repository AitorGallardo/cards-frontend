import { OptimizedTweetGrid } from '../components/OptimizedTweetGrid';
import './Grid.css';

function Grid() {
  return (
    <div className="container">
      <h1>Interactive Tweet Grid</h1>
      
      <div className="tweet-grid-container">
        <OptimizedTweetGrid />
      </div>
      
      <div className="instructions">
        <h2>How to Use</h2>
        <p>Interact with the grid of tweet pixels below:</p>
        <ul className="list-disc">
          <li>Click on a tweet to expand it</li>
          <li>Hover over tweets to see preview animations</li>
          <li>Drag tweets to rearrange them in the grid</li>
          <li>Double-click to see engagement metrics</li>
        </ul>
      </div>
    </div>
  );
}

export default Grid; 