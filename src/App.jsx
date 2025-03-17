import "./App.css";
import TweetCardGrid from "./components/TweetCardGrid";
import ShaderSelector from "./components/ShaderToggle";
import { ShaderProvider } from "./utils/ShaderContext";

function App() {
  return (
    <ShaderProvider>
      <div className="app-container">
        <ShaderSelector />
        <TweetCardGrid />
      </div>
    </ShaderProvider>
  );
}

export default App;
