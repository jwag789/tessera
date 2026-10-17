import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tessera/tokens/tokens.css';
import '@tessera/react/styles.css';
import '@tessera/react/fonts.css';
import '@tessera/tokens/themes/cartridge.css';
import '@tessera/react/themes/cartridge.css';
import '@tessera/tokens/themes/cartridge-fonts.css';
import '@tessera/tokens/themes/polygon.css';
import '@tessera/react/themes/polygon.css';
import '@tessera/tokens/themes/polygon-fonts.css';
import '@tessera/tokens/themes/gloop.css';
import '@tessera/react/themes/gloop.css';
import '@tessera/tokens/themes/gloop-fonts.css';
import './styles.css';
import './paper.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
