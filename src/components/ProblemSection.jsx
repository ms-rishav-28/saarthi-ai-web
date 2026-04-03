import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const problems = [
  { num: '₹2.5L Cr', title: 'Benefits go unclaimed every year', desc: 'Allocated government welfare budgets remain unspent because eligible citizens never apply.' },
  { num: '4.2 hrs', title: 'Average time per application', desc: 'A single PM-JAY pre-authorization takes hours of manual form-filling and document collection.' },
  { num: '28+', title: 'Separate portals for central schemes', desc: 'UMANG, DigiLocker, PM-JAY, PM Kisan, PM Awas — each with different logins, documents, and SLAs.' },
  { num: '87%', title: 'Citizens unaware of their eligibility', desc: 'Most rural and semi-urban Indians are unaware of which national schemes they qualify for.' },
];

export default function ProblemSection() {
  return (
    <motion.section
      className="section"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      <div className="container">
        <div className="section-label">The Problem</div>
        <h2 className="section-title">
          India's welfare system is broken<br />— not by design, but by complexity.
        </h2>
        <p className="section-body">
          There are 1,600+ central schemes and thousands of state-level programs. Most citizens don't know they exist, let alone how to apply. The ones who try face a maze of portals, documents, and offices — all in English.
        </p>
        <div className="problem-grid">
          {problems.map((p, i) => (
            <motion.div
              key={p.num}
              className="problem-card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
            >
              <div className="problem-card-num">{p.num}</div>
              <div className="problem-card-title">{p.title}</div>
              <div className="problem-card-desc">{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
