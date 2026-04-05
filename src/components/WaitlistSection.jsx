import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false);
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    location: '',
    consent: false,
    website: '',
  });
  const formRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        if (!response.ok) return;
        const data = await response.json();
        if (mounted && typeof data.count === 'number') {
          setSignupCount(data.count);
        }
      } catch {
        // Silently ignore count failures and keep UI responsive.
      }
    };

    fetchCount();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'Could not submit right now. Please try again.');
        return;
      }

      if (typeof data.count === 'number') {
        setSignupCount(data.count);
      } else {
        setSignupCount((prev) => prev + 1);
      }
      setSubmitted(true);
    } catch {
      setErrorMessage('Network issue detected. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
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
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
                  <select name="role" required value={formData.role} onChange={handleChange}>
                    <option value="" disabled>I am a...</option>
                    <option value="citizen">Individual citizen</option>
                    <option value="ngo">NGO / Field worker</option>
                    <option value="bank">Bank / NBFC</option>
                    <option value="hospital">Hospital / Clinic</option>
                    <option value="ca">CA / Tax consultant</option>
                    <option value="govt">Government official</option>
                    <option value="investor">Investor</option>
                  </select>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City / State"
                  />
                </div>

                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                />

                <label style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                    style={{ marginTop: '2px' }}
                  />
                  I agree to be contacted about early access and product updates.
                </label>

                {errorMessage ? (
                  <p style={{ color: 'var(--color-accent)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', textAlign: 'left' }}>
                    {errorMessage}
                  </p>
                ) : null}

                <motion.button
                  type="submit"
                  className="form-submit"
                  disabled={loading}
                  whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Submitting...' : "Join the Waitlist — It's Free →"}
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {submitted
              ? <><CheckCircle2 size={16} /> {signupCount} people on the waitlist so far.</>
              : <><Lock size={16} /> Your data is safe. DPDP 2023 compliant. No spam, ever.</>
            }
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
