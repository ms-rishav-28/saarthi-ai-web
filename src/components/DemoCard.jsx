import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, FileText, Send, Radio, MessageSquare } from 'lucide-react';

const agentSteps = [
  {
    icon: <Search size={20} />, iconClass: 'step-green', name: 'Eligibility Scout',
    desc: 'Found 6 schemes you qualify for based on your profile, state, and life event.',
    tags: ['PM Matru Vandana (₹5,000)', 'PM Kisan (₹6,000/yr)', 'PM-JAY Health Cover']
  },
  {
    icon: <FileText size={20} />, iconClass: 'step-blue', name: 'Document Orchestrator',
    desc: 'Pulled Aadhaar, land records & bank passbook from DigiLocker. Auto-filled 4 of 5 forms. One document missing: birth certificate.',
    tags: ['DigiLocker ✓', '1 doc needed']
  },
  {
    icon: <Send size={20} />, iconClass: 'step-orange', name: 'Submission Agent',
    desc: 'Submitted 3 applications to central portal. Booked CSC appointment in Nashik for remaining 2 (physical signature required).',
    tags: ['3 submitted', 'CSC appt: Apr 7']
  },
  {
    icon: <Radio size={20} />, iconClass: 'step-purple', name: 'Tracker Agent',
    desc: 'Monitoring all 3 applications weekly. Will alert if SLA is breached and auto-draft grievance to CPGRAMS.',
    tags: ['Auto-follow-up', 'CPGRAMS ready']
  },
  {
    icon: <MessageSquare size={20} />, iconClass: 'step-teal', name: 'Communication Agent',
    desc: 'Sending all updates on WhatsApp in Hindi. Estimated ₹11,000 in total benefits in next 90 days.',
    tags: ['WhatsApp • Hindi', '₹11,000 expected']
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

export default function DemoCard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="demo-section">
      <div className="container">
        <motion.div
          className="demo-card"
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="demo-header">
            <div className="demo-dot"></div>
            <div className="demo-dot"></div>
            <div className="demo-dot"></div>
            <div className="demo-url">saarthi.ai — Agent Workflow Demo</div>
          </div>
          <div className="demo-body">
            <div className="demo-prompt">
              <strong>You said:</strong> "मैं महाराष्ट्र का किसान हूँ। पिछले महीने मेरी पत्नी ने बच्चे को जन्म दिया।"
              <br />
              <span style={{ color: 'var(--color-text-faint)', fontSize: '0.85em' }}>
                (I'm a farmer in Maharashtra. My wife gave birth last month.)
              </span>
            </div>
            <div className="agent-steps">
              {agentSteps.map((step, i) => (
                <motion.div
                  key={step.name}
                  className="agent-step"
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                >
                  <div className={`agent-step-icon ${step.iconClass}`}>{step.icon}</div>
                  <div className="agent-step-content">
                    <div className="agent-step-name">{step.name}</div>
                    <div className="agent-step-desc">{step.desc}</div>
                    <div className="agent-step-tags">
                      {step.tags.map(tag => (
                        <span className="tag" key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
