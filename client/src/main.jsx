import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ADICIONE ISSO
import './index.css'
import App from "./App/App.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Envolva o App aqui */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)