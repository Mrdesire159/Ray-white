import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { RequestProvider } from './context/RequestContext';
import { PriceProvider } from './context/PriceContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <RequestProvider>
      <PriceProvider>
        <App />
      </PriceProvider>
    </RequestProvider>
  </ThemeProvider>
);
