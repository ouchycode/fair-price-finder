import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App';
import './styles/index.css';
import logoFpf from './assets/logo/logo-fpf.png';

// CEGAH KILATAN TEMA SEBELUM RENDER PERTAMA
try {
  const saved = localStorage.getItem('fpf-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
} catch { /* ABAIKAN */ }

function Root() {
  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });

    try {
      const link = document.querySelector("link[rel='icon']");
      if (link) link.href = logoFpf;
    } catch (e) { /* ABAIKAN */ }
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
