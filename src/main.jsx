import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      Use a basename so routes work when the app is served from
      https://<username>.github.io/ascent/ instead of the domain root.
      This must match both your GitHub repo name and the Vite `base`.
    */}
    <BrowserRouter basename="/ascent">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
