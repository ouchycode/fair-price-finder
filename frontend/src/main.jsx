import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './styles/index.css';
import logoFpf from './assets/logo/logo-fpf.png';

// CEGAH KILATAN TETAPKAN TEMA DATA SEBELUM RENDER REACT PERTAMA
try {
  const saved = localStorage.getItem('fpf-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
} catch { /* ABAIKAN */ }

function Root() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-quart',
      once: true,
      offset: 40,
    });

    // TETAPKAN FAVICON KE LOGO FPF
    try {
      const link = document.querySelector("link[rel='icon']");
      if (link) link.href = logoFpf;
    } catch (e) { /* ABAIKAN */ }
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
