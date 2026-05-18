import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Estimator from './pages/Estimator';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      NProgress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { 
              background: 'var(--bg-1)', 
              color: 'var(--fg)', 
              border: '1px solid var(--border)', 
              fontSize: '13.5px', 
              borderRadius: 'var(--r-lg)' 
            },
            success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg)' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg)' } },
          }} 
        />
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about"     element={<About />} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}

export default App;
