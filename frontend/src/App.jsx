import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

// Core layout — eager loaded, always present
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';
import AmbientBackground from './components/AmbientBackground';
import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';

// Homepage sections — eager loaded for instant render
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Showcase from './components/Showcase';
import Reviews from './components/Reviews';
import Location from './components/Location';

// Other pages — lazy loaded (code split per route)
const SmartMenu = lazy(() => import('./components/SmartMenu'));
const Reservations = lazy(() => import('./pages/Reservations'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Tracking = lazy(() => import('./pages/Tracking'));
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const LuxuryAudioPlayer = lazy(() => import('./components/LuxuryAudioPlayer'));
const AdminApp = lazy(() => import('./admin/App'));

// Lightweight loading spinner
const LuxuryLoader = () => (
  <div className="min-h-[60vh] bg-luxury-dark flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-luxury-gold animate-spin" />
      </div>
      <p className="text-luxury-gold/50 text-[10px] uppercase tracking-[0.4em] font-bold">Loading</p>
    </div>
  </div>
);

// ─── Homepage: all scrollable sections on the / route ───────────────────────
const HomePage = () => (
  <>
    <Hero />
    <ErrorBoundary>
      <About />
    </ErrorBoundary>
    <ErrorBoundary>
      <Features />
    </ErrorBoundary>
    <ErrorBoundary>
      <Showcase />
    </ErrorBoundary>
    <ErrorBoundary>
      <Gallery />
    </ErrorBoundary>
    <ErrorBoundary>
      <Reviews />
    </ErrorBoundary>
    <ErrorBoundary>
      <Location />
    </ErrorBoundary>
    <Footer />
  </>
);

// ─── App ─────────────────────────────────────────────────────────────────────
const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Intelligent idle prefetch for instant navigation
    const prefetchAssets = () => {
      // 1. Prefetch dynamic route chunks in background
      import('./components/SmartMenu');
      import('./pages/Reservations');
      import('./pages/GalleryPage');
      import('./pages/Checkout');
      import('./components/AIChatbot');
      import('./components/LuxuryAudioPlayer');

      // 2. Prefetch Menu API data into memory cache
      if (!window.__AURA_MENU_CACHE__) {
        fetch('http://localhost:5001/api/menu')
          .then(res => res.json())
          .then(data => {
            window.__AURA_MENU_CACHE__ = data;
            try { sessionStorage.setItem('aura_menu_cache', JSON.stringify(data)); } catch (_) {}
          })
          .catch(() => {});
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchAssets, { timeout: 1500 });
    } else {
      setTimeout(prefetchAssets, 500);
    }
  }, []);

  useEffect(() => {
    // Connect socket for active users tracking
    const socket = io('http://localhost:5001');

    // Generate or get sessionId
    let sessionId = localStorage.getItem('aura_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('aura_session_id', sessionId);
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('http://localhost:5001/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            path: location.pathname,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            browser: navigator.userAgent
          })
        });
      } catch (err) {
        console.error('Failed to track analytics');
      }
    };

    trackPageView();

    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    // Root container — no overflow-hidden, no fixed height
    <div className="bg-luxury-dark text-luxury-cream selection:bg-luxury-gold selection:text-luxury-dark font-sans relative">

      {/* Ambient decorative layer — z-0 */}
      <ErrorBoundary>
        <AmbientBackground />
      </ErrorBoundary>

      {/* Cinematic vignette — z-5, pointer-events-none, never blocks content */}
      <div className="cinematic-vignette" aria-hidden="true" />

      {/* Custom cursor — isolated, non-critical */}
      <ErrorBoundary>
        <CustomCursor />
      </ErrorBoundary>

      {/* Customer Navbar — only shown on customer storefront */}
      {!isAdmin && (
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>
      )}

      {/* Customer Cart drawer */}
      {!isAdmin && (
        <ErrorBoundary>
          <CartSidebar />
        </ErrorBoundary>
      )}

      {/* Customer AI Chatbot */}
      {!isAdmin && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <AIChatbot />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Customer Luxury Audio Player */}
      {!isAdmin && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <LuxuryAudioPlayer />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* ── Page routing ── */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* HOME — full scrollable page with all sections */}
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <PageTransition>
                  <HomePage />
                </PageTransition>
              </ErrorBoundary>
            }
          />

          {/* MENU */}
          <Route
            path="/menu"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <SmartMenu />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* RESERVATIONS */}
          <Route
            path="/reservations"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <Reservations />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* GALLERY */}
          <Route
            path="/gallery"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <GalleryPage />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* CHECKOUT */}
          <Route
            path="/checkout"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <Checkout />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* ORDER TRACKING */}
          <Route
            path="/tracking"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <Tracking />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/tracking/:id"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <PageTransition>
                    <Tracking />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* 👑 ADMIN PORTAL (Nested routes under /admin/*) */}
          <Route
            path="/admin/*"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LuxuryLoader />}>
                  <AdminApp />
                </Suspense>
              </ErrorBoundary>
            }
          />

        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App;
