import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
import { DateProvider } from './contexts/DateContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ascent">
      <DateProvider>
        <App />
      </DateProvider>
    </BrowserRouter>
  </React.StrictMode>
);
