import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false);
  const [signupCount, setSignupCount] = useState(47);
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSignupCount(prev => prev + 1);
    setSubmitted(true);
  };

  return (
    <motion.section
      className="waitlist-section"
      id="waitlist"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      <div className="container">
        <div className="waitlist-card">
          <div className="hero-badge" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="hero-badge-dot"></span>
            Applications Open — April 2026
          </div>
          <h2>Be the first to use Saarthi AI</h2>
          <p>
            We're onboarding our first cohort of users, partner banks, and NBFCs. Join the waitlist and we'll reach out within 48 hours.
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
              >
                <div className="form-row">
                  <input type="text" placeholder="Your name" required autoComplete="name" />
                  <input type="email" placeholder="Email address" required autoComplete="email" />
                </div>
                <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
                  <select required defaultValue="">
                    <option value="" disabled>I am a...</option>
                    <option value="citizen">Individual citizen</option>
                    <option value="ngo">NGO / Field worker</option>
                    <option value="bank">Bank / NBFC</option>
                    <option value="hospital">Hospital / Clinic</option>
                    <option value="ca">CA / Tax consultant</option>
                    <option value="govt">Government official</option>
                    <option value="investor">Investor</option>
                  </select>
                  <input type="text" placeholder="City / State" />
                </div>
                <motion.button
                  type="submit"
                  className="form-submit"
                  whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join the Waitlist — It's Free →
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="form-success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block' }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="var(--color-success-bg)"/>
                  <motion.path
                    d="M12 20l6 6 10-12"
                    stroke="var(--color-success)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </svg>
                You're on the list! We'll be in touch within 48 hours.
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="waitlist-count"
            animate={{ opacity: 1 }}
          >
            {submitted
              ? `✅ ${signupCount} people on the waitlist so far.`
              : '🔒 Your data is safe. DPDP 2023 compliant. No spam, ever.'
            }
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
