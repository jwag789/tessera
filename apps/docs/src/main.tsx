import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tessera/tokens/tokens.css';
import '@tessera/react/styles.css';
import '@tessera/react/fonts.css';
import './styles/docs.css';
import './styles/showcase.css';
import './styles/cover.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
