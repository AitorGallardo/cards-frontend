import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Grid from './pages/Grid.jsx'
import GridV2 from './pages/GridV2.jsx'
import Layout from './components/Layout.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="grid" element={<Grid />} />
          <Route path="grid-v2" element={<GridV2 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
