import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

const statVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const stats = [
  { num: '1,600', suffix: '+', label: 'Central Schemes' },
  { num: '300M+', suffix: '', label: 'Underserved Citizens' },
  { num: '₹5L', suffix: '+', label: 'Avg. Benefits Unclaimed' },
  { num: '22', suffix: '', label: 'Indian Languages' },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <motion.div
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-badge" variants={itemVariants}>
          <span className="hero-badge-dot"></span>
          Built for India · AI-First · 22 Languages
        </motion.div>

        <motion.h1 variants={itemVariants}>
          Your <em>AI navigator</em> through India's government services
        </motion.h1>

        <motion.p className="hero-sub" variants={itemVariants}>
          Tell Saarthi what's happening in your life. It identifies every scheme you're eligible for, fills the forms, submits the applications, and tracks them — in your language.
        </motion.p>

        <motion.div className="hero-cta-group" variants={itemVariants}>
          <motion.a
            href="#waitlist"
            className="btn-hero"
            whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
            whileTap={{ y: 0 }}
          >
            Get Early Access →
          </motion.a>
          <motion.a
            href="#how-it-works"
            className="btn-ghost"
            whileHover={{ backgroundColor: 'var(--color-surface-offset)' }}
            whileTap={{ scale: 0.98 }}
          >
            See how it works
          </motion.a>
        </motion.div>

        <motion.div
          className="hero-stats"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} style={{ display: 'contents' }}>
              {i > 0 && <div className="hero-stat-divider" />}
              <motion.div className="hero-stat" variants={statVariants}>
                <div className="hero-stat-num">
                  <span>{stat.num}</span>{stat.suffix}
                </div>
                <div className="hero-stat-label">{stat.label}</div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
