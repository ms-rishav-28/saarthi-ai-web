import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="footer-inner">
          <div className="footer-copy">© 2026 Saarthi AI. Built with ❤️ in Bengaluru, India.</div>
          <div className="footer-links">
            <span className="badge-indiastack">🇮🇳 Built on IndiaStack</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
