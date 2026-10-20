import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tessera-design/tokens/tokens.css';
import '@tessera-design/react/styles.css';
import '@tessera-design/react/fonts.css';
import '@tessera-design/tokens/themes/cartridge.css';
import '@tessera-design/react/themes/cartridge.css';
import '@tessera-design/tokens/themes/cartridge-fonts.css';
import '@tessera-design/tokens/themes/polygon.css';
import '@tessera-design/react/themes/polygon.css';
import '@tessera-design/tokens/themes/polygon-fonts.css';
import '@tessera-design/tokens/themes/gloop.css';
import '@tessera-design/react/themes/gloop.css';
import '@tessera-design/tokens/themes/gloop-fonts.css';
import '@tessera-design/tokens/themes/shonen.css';
import '@tessera-design/react/themes/shonen.css';
import '@tessera-design/tokens/themes/shonen-fonts.css';
import '@tessera-design/tokens/themes/jelly.css';
import '@tessera-design/react/themes/jelly.css';
import '@tessera-design/tokens/themes/jelly-fonts.css';
import '@tessera-design/tokens/themes/neon.css';
import '@tessera-design/react/themes/neon.css';
import '@tessera-design/tokens/themes/neon-fonts.css';
import '@tessera-design/tokens/themes/static.css';
import '@tessera-design/react/themes/static.css';
import '@tessera-design/tokens/themes/static-fonts.css';
import './styles.css';
import './paper.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
