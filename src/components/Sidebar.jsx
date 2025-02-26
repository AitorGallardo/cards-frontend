import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Tweet Pixel Art</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
              end
            >
              Single Tweet Generator
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/grid" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Interactive Grid
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/grid-v2" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Grid V2 (Enhanced)
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/grid-final" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Grid Final
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>Made with React & Canvas</p>
      </div>
    </div>
  );
};

export default Sidebar; 