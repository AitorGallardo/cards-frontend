import  TweetCardGrid  from '../components/TweetCardGrid';
import './Grid-final.css';

function GridFinal() {
  return (
    <div className="container">
      <h1>Tweet Pixel Art Grid</h1>
      <p>Hover over tweets and drag them around. Watch the Balatro-style animations!</p>
      
      <TweetCardGrid />
    </div>
  );
}

export default GridFinal; 