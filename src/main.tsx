import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import BedProvider from './context/BedProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BedProvider>
        <App />
      </BedProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
