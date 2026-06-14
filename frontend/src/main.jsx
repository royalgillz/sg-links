import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// apply the saved theme before first paint so every route matches
document.documentElement.classList.toggle('dark', localStorage.getItem('sglinks_theme') === 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
