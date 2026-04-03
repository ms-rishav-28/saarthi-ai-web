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
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const techCategories = [
  {
    category: 'Agent Orchestration',
    items: ['LangGraph (multi-agent)', 'Gemini 2.0 Flash (reasoning)', 'Vertex AI (Google Cloud)']
  },
  {
    category: 'IndiaStack Integration',
    items: ['DigiLocker Document API', 'ABDM Health ID', 'Aadhaar eKYC (UIDAI)']
  },
  {
    category: 'Language & Vision',
    items: ['Gemini Vision (OCR/forms)', 'Sarvam AI (Indic TTS/STT)', '22 scheduled languages']
  },
  {
    category: 'Communication & Data',
    items: ['WhatsApp Business API', 'Supabase (data + auth)', 'DPDP 2023 compliant']
  },
];

export default function TechStack() {
  return (
    <motion.section
      className="section"
      id="tech"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      <div className="container">
        <div className="section-label">Infrastructure</div>
        <h2 className="section-title">
          Built on IndiaStack.<br />Powered by Gemini.
        </h2>
        <p className="section-body">
          Every component is privacy-first and DPDP 2023 compliant. Documents never leave India's cloud infrastructure.
        </p>
        <div className="tech-grid">
          {techCategories.map((cat, i) => (
            <motion.div
              key={cat.category}
              className="tech-card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="tech-category">{cat.category}</div>
              <div className="tech-items">
                {cat.items.map(item => (
                  <div className="tech-item" key={item}>
                    <span className="tech-dot"></span>{item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
