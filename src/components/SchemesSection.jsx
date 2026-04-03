import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const schemes = [
  { ministry: 'Ministry of Health', name: 'Ayushman Bharat PM-JAY', benefit: <>Up to <strong>₹5 lakh</strong>/family/year health cover</> },
  { ministry: 'Ministry of Agriculture', name: 'PM Kisan Samman Nidhi', benefit: <><strong>₹6,000</strong>/year for small & marginal farmers</> },
  { ministry: 'Ministry of Women & Child', name: 'PM Matru Vandana Yojana', benefit: <><strong>₹5,000</strong> maternity benefit for 1st live birth</> },
  { ministry: 'Ministry of Housing', name: 'PM Awas Yojana (Urban)', benefit: <>Up to <strong>₹2.67 lakh</strong> subsidy for housing</> },
  { ministry: 'Ministry of Agriculture', name: 'PM Fasal Bima Yojana', benefit: <>Crop insurance — up to <strong>100%</strong> loss coverage</> },
  { ministry: 'Ministry of Finance', name: 'PM Jeevan Jyoti Bima', benefit: <><strong>₹2 lakh</strong> life cover at ₹436/year premium</> },
  { ministry: 'Ministry of Finance', name: 'PM Suraksha Bima', benefit: <><strong>₹2 lakh</strong> accident cover at ₹20/year premium</> },
  { ministry: 'Ministry of Labour', name: 'e-Shram Portal Benefits', benefit: <>Welfare for <strong>30Cr+</strong> unorganised workers</> },
  { ministry: 'Ministry of Education', name: 'PM Scholarship Scheme', benefit: <>Up to <strong>₹36,000</strong>/year for wards of ex-servicemen</> },
  { ministry: 'Ministry of Women & Child', name: 'Sukanya Samridhi Yojana', benefit: <><strong>8.2% p.a.</strong> interest for girl child FD</> },
  { ministry: 'Ministry of Labour', name: 'Atal Pension Yojana', benefit: <>Guaranteed pension of <strong>₹1K–5K</strong>/month</> },
];

export default function SchemesSection() {
  return (
    <motion.section
      className="section"
      id="schemes"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      <div className="container--wide">
        <div className="section-label">Supported Schemes — Phase 1</div>
        <h2 className="section-title">Starting with India's highest-impact programs.</h2>
        <div className="schemes-grid">
          {schemes.map((s, i) => (
            <motion.div
              key={s.name}
              className="scheme-card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -1, borderColor: 'var(--color-primary)' }}
            >
              <div className="scheme-ministry">{s.ministry}</div>
              <div className="scheme-name">{s.name}</div>
              <div className="scheme-benefit">{s.benefit}</div>
            </motion.div>
          ))}
          <motion.div
            className="scheme-card"
            style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}
            custom={schemes.length}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div style={{ textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
              +1,589 more schemes coming
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
