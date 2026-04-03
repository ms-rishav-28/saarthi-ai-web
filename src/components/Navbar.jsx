import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Saarthi AI logo">
              <rect width="28" height="28" rx="7" fill="var(--color-primary)"/>
              <circle cx="14" cy="14" r="7" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <path d="M14 7 L16.5 13.5 L14 12 L11.5 13.5 Z" fill="white"/>
              <path d="M14 21 L11.5 14.5 L14 16 L16.5 14.5 Z" fill="white" fillOpacity="0.5"/>
              <circle cx="14" cy="14" r="1.5" fill="white"/>
            </svg>
            <span>Saarthi AI</span>
          </a>
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#schemes">Schemes</a>
            <a href="#tech">Tech</a>
          </div>
          <div className="nav-actions">
            <button className="btn-theme" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </motion.div>
              </AnimatePresence>
            </button>
            <motion.a
              href="#waitlist"
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join Waitlist
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
