import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const stepItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const nodeVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const steps = [
  { num: 1, title: 'You describe your situation', desc: 'In any Indian language — text or voice. Tell Saarthi about a life event: a new baby, job loss, crop damage, illness, or anything else.' },
  { num: 2, title: 'Eligibility Scout maps your benefits', desc: 'Checks your profile against 1,600+ central and state schemes in seconds. Only shows you what you actually qualify for.' },
  { num: 3, title: 'Document Orchestrator gathers & fills', desc: 'Pulls documents from DigiLocker via ABDM. Auto-fills all form fields using Gemini Vision OCR. Flags only what\'s genuinely missing.' },
  { num: 4, title: 'Submission Agent files on your behalf', desc: 'Submits to the right government portal with zero copy-paste. Books CSC appointments when physical presence is required.' },
  { num: 5, title: 'Tracker keeps you updated forever', desc: 'Monitors status weekly, sends WhatsApp alerts in your language, and auto-files grievances if deadlines are missed.' },
];

const agentNodes = [
  { icon: '🧭', iconClass: 'step-green', label: 'Saarthi Planner Agent', sub: 'Orchestrator' },
  { icon: '🔍', iconClass: 'step-blue', label: 'Eligibility Scout', sub: null },
  { icon: '📄', iconClass: '', bgStyle: { background: '#EEF5EE' }, label: 'Document Orchestrator', sub: null },
  { icon: '📤', iconClass: 'step-orange', label: 'Submission Agent', sub: null },
  { icon: '📡', iconClass: 'step-purple', label: 'Tracker Agent', sub: null },
  { icon: '💬', iconClass: 'step-teal', label: 'Communication Agent (22 langs)', sub: null },
];

export default function HowItWorks() {
  return (
    <motion.section
      className="section"
      id="how-it-works"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -40px 0px' }}
    >
      <div className="container">
        <div className="section-label">The Solution</div>
        <h2 className="section-title">
          Five specialised AI agents,<br />working together for you.
        </h2>
        <div className="steps-layout">
          <div className="steps-list">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="step-item"
                custom={i}
                variants={stepItemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="step-num">{step.num}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="steps-visual"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="visual-title">Agent Orchestration</div>
            {agentNodes.map((node, i) => (
              <motion.div
                key={node.label}
                custom={i}
                variants={nodeVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {i > 0 && <div className="connector"></div>}
                <div className="agent-node">
                  <div
                    className={`agent-node-icon ${node.iconClass}`}
                    style={node.bgStyle || {}}
                  >
                    {node.icon}
                  </div>
                  <div>
                    {node.sub && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '2px' }}>
                        {node.sub}
                      </div>
                    )}
                    <div>{node.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
