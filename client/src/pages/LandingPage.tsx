import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  FileText,
  Clock,
  Building,
  Layers,
  Cpu,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Minus,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const faqs = [
    {
      q: 'What is MAITRI+ under the Maharashtra Industrial Policy framework?',
      a: 'MAITRI+ (Maharashtra AI-powered Industrial Registration & Tracking Intelligence) is the statutory single-window clearance architecture connecting 16+ regulatory bodies into an integrated concurrent workflow. It enforces strict timelines under the Maharashtra Right to Public Services Act (RTS 2015).',
    },
    {
      q: 'How does the central Smart Document Vault eliminate duplicate submissions?',
      a: 'Instead of uploading distinct dockets to MPCB, MIDC, DMFS, and Labor departments separately, an industrial unit uploads verified land ownership records, factory layout drawings, and power load requirements once into the Document Intelligence Vault. Clearances reference this single source of truth.',
    },
    {
      q: 'What happens when a statutory clearance exceeds the mandated SLA timeline?',
      a: 'The RTS State SLA Engine automatically flags approaching deadlines (at 80% duration) to designated nodal officers. Upon SLA breach, the application is escalated directly to the Directorate of Industries Apex Command Center for deemed clearance review or administrative intervention.',
    },
    {
      q: 'How are joint site inspections scheduled across multiple regulatory bodies?',
      a: 'When an industrial project triggers inspections from both the Directorate of Industrial Safety (DISH) and the Maharashtra Fire Services (DMFS), MAITRI+ consolidates their visits into a single synchronized inspection date, preventing repeated factory floor disruptions.',
    },
    {
      q: 'Can industrial units track eligible state subsidies under PSI 2019?',
      a: 'Yes. The system parses your investment parameters (plant & machinery, taluka category, green-energy component) against the Package Scheme of Incentives (PSI 2019) to calculate eligibility thresholds and SGST reimbursement ceilings automatically.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-[#FFFFFF]">
      {/* Top Utility Announcement Bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FFFFFF] px-6 py-2.5 text-xs text-[#666666] tracking-tight">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 bg-[#111111]"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#111111] font-semibold">
              Govt. of Maharashtra
            </span>
            <span className="text-[#E5E5E5]">/</span>
            <span>Single Window Industrial Clearance & Statutory Telemetry</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
            <span>RTS Act Compliant</span>
            <span className="text-[#E5E5E5]">&bull;</span>
            <span>PS-26130</span>
          </div>
        </div>
      </div>

      {/* Primary Editorial Header */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-[#000000] text-[#FFFFFF] flex items-center justify-center font-bold text-sm tracking-tighter">
                M+
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#111111]">
                MAITRI<span className="text-[#666666] font-normal text-xs ml-1 font-mono">+v2.0</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#666666]">
              <a href="#problem" className="hover:text-[#111111] transition-colors">
                Problem
              </a>
              <a href="#solution" className="hover:text-[#111111] transition-colors">
                Solution
              </a>
              <a href="#workflow" className="hover:text-[#111111] transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-[#111111] transition-colors">
                Architecture
              </a>
              <a href="#statistics" className="hover:text-[#111111] transition-colors">
                State Telemetry
              </a>
              <a href="#faq" className="hover:text-[#111111] transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-[#111111] px-4 py-2 hover:bg-[#F5F5F5] border border-transparent transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="text-xs font-semibold bg-[#000000] text-[#FFFFFF] px-4 py-2 border border-[#000000] hover:bg-[#222222] transition-colors flex items-center gap-1.5"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-20 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 text-[11px] font-mono uppercase tracking-widest bg-[#111111] text-[#FFFFFF]">
                Enterprise Edition
              </span>
              <span className="text-xs font-mono text-[#666666]">
                Single-Window Industrial Operating System
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#111111] leading-[1.05]"
            >
              The statutory clearance infrastructure for Maharashtra.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-8 text-lg sm:text-xl text-[#666666] leading-relaxed max-w-2xl font-normal"
            >
              MAITRI+ unifies environmental, fire, industrial safety, and utility approvals into a
              single synchronized dependency pipeline with strict 21-day legal SLA enforcement.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/dashboard"
                className="px-6 py-3.5 bg-[#000000] text-[#FFFFFF] text-sm font-semibold hover:bg-[#222222] transition-all flex items-center gap-2 border border-[#000000]"
              >
                <span>Access Entrepreneur Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/officer"
                className="px-6 py-3.5 bg-[#FFFFFF] text-[#111111] text-sm font-semibold hover:bg-[#F5F5F5] transition-all border border-[#E5E5E5] flex items-center gap-2"
              >
                <span>Nodal Officer Scrutiny Desk</span>
                <ArrowUpRight className="w-4 h-4 text-[#666666]" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-14 pt-8 border-t border-[#E5E5E5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-[#666666]"
            >
              <div>
                <span className="block font-mono text-sm text-[#111111] font-bold">16+</span>
                <span>Regulatory Departments</span>
              </div>
              <div>
                <span className="block font-mono text-sm text-[#111111] font-bold">21 Days</span>
                <span>Max RTS SLA Bound</span>
              </div>
              <div>
                <span className="block font-mono text-sm text-[#111111] font-bold">1 Dossier</span>
                <span>Zero Re-submission</span>
              </div>
              <div>
                <span className="block font-mono text-sm text-[#111111] font-bold">100%</span>
                <span>Digital Audit Trail</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Minimal Schematic Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 border border-[#E5E5E5] bg-[#FFFFFF] p-6 sm:p-8"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E5E5] text-xs font-mono text-[#666666]">
              <span>SCHEMATIC // INTEGRATED CLEARANCE PIPELINE TELEMETRY</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#111111]"></span>
                LIVE STATUS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-[#E5E5E5] p-5">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block mb-1">
                  Node 01 &bull; Ingest
                </span>
                <h4 className="font-bold text-sm text-[#111111] mb-2">Industrial Facility Profile</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Project capital, land zoning, industrial classification (Red/Orange/Green), and utility loads registered once.
                </p>
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono text-[#111111]">
                  <span>Status</span>
                  <span>Validated</span>
                </div>
              </div>

              <div className="border border-[#E5E5E5] p-5">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block mb-1">
                  Node 02 &bull; Intelligence
                </span>
                <h4 className="font-bold text-sm text-[#111111] mb-2">Document Vault Sync</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  MIDC 7/12 extract, building plans, and environmental dockets shared across concurrent authorities.
                </p>
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono text-[#111111]">
                  <span>Reuse Rate</span>
                  <span>100% Shared</span>
                </div>
              </div>

              <div className="border border-[#E5E5E5] p-5">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block mb-1">
                  Node 03 &bull; Inspection
                </span>
                <h4 className="font-bold text-sm text-[#111111] mb-2">Joint Site Review</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Synchronized on-site inspection for MPCB, Fire & Boiler authorities in a single consolidated visit.
                </p>
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono text-[#111111]">
                  <span>Cadence</span>
                  <span>Synchronized</span>
                </div>
              </div>

              <div className="border border-[#E5E5E5] p-5">
                <span className="font-mono text-[10px] text-[#666666] uppercase tracking-wider block mb-1">
                  Node 04 &bull; Decision
                </span>
                <h4 className="font-bold text-sm text-[#111111] mb-2">Statutory Grant</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Digitally signed Consent to Establish (CTE), building permits, and power sanctions issued with QR verification.
                </p>
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono text-[#111111]">
                  <span>Turnaround</span>
                  <span>11.8 Days Avg</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM STATEMENT */}
      <section id="problem" className="py-24 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
                01 // The Bottleneck
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                The Traditional Approval Dilemma
              </h2>
              <p className="mt-4 text-sm text-[#666666] leading-relaxed">
                Industrial projects in India historically navigate an intricate web of isolated
                portals, causing multi-month delays in commercial commissioning and capital lock-in.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
              <div className="bg-[#FFFFFF] p-8">
                <span className="font-mono text-xs text-[#666666] block mb-3">01.1 &bull; FRICTION</span>
                <h3 className="font-bold text-base text-[#111111] mb-2">Fragmented Department Silos</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Entrepreneurs must navigate 16+ separate portals (MPCB, DISH, DMFS, MIDC, MSEDCL) with separate logins, incompatible schemas, and contradictory prerequisites.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-8">
                <span className="font-mono text-xs text-[#666666] block mb-3">01.2 &bull; WASTE</span>
                <h3 className="font-bold text-base text-[#111111] mb-2">Redundant Document Submissions</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  The exact same land ownership title, promoter identity proof, and civil blueprint are re-uploaded, notarized, and physically verified repeatedly for every clearance.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-8">
                <span className="font-mono text-xs text-[#666666] block mb-3">01.3 &bull; OPACITY</span>
                <h3 className="font-bold text-base text-[#111111] mb-2">Unenforceable Statutory Deadlines</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Despite Right to Services Act mandates, paper files sit in inter-departmental transit without automated escalation triggers or transparent public tracking.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-8">
                <span className="font-mono text-xs text-[#666666] block mb-3">01.4 &bull; EXPOSURE</span>
                <h3 className="font-bold text-base text-[#111111] mb-2">Zero Predictive Compliance</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Operating units lack recurring statutory renewal visibility, leading to sudden compliance lapses, environmental penalty notices, and unexpected facility shutdowns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION */}
      <section id="solution" className="py-24 border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              02 // The Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Engineered for absolute regulatory clarity.
            </h2>
            <p className="mt-4 text-sm text-[#666666] leading-relaxed">
              MAITRI+ redesigns the state’s regulatory apparatus into an intelligent, event-driven
              runtime environment that treats approvals as a synchronized dependency graph.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#E5E5E5] p-8">
              <div className="font-mono text-xs text-[#666666] mb-6">CAPABILITY // 01</div>
              <h3 className="text-lg font-bold text-[#111111] mb-3">Centralized Document Vault</h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-6">
                Upload foundational project dockets once. Our system establishes cross-approval references, ensuring MPCB, Fire, and Factory inspectors verify the same authenticated artifacts.
              </p>
              <ul className="space-y-2 text-xs text-[#111111] border-t border-[#E5E5E5] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Version-controlled dockets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Cross-departmental reusability</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Readiness completeness score</span>
                </li>
              </ul>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <div className="font-mono text-xs text-[#666666] mb-6">CAPABILITY // 02</div>
              <h3 className="text-lg font-bold text-[#111111] mb-3">Statutory RTS SLA Engine</h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-6">
                Every clearance clock ticks publicly against Maharashtra Right to Public Services Act thresholds. Deadlines approaching 80% duration automatically alert apex leadership.
              </p>
              <ul className="space-y-2 text-xs text-[#111111] border-t border-[#E5E5E5] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Real-time turnaround countdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Automated nodal officer nudges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Apex escalation triggers</span>
                </li>
              </ul>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <div className="font-mono text-xs text-[#666666] mb-6">CAPABILITY // 03</div>
              <h3 className="text-lg font-bold text-[#111111] mb-3">Predictive Lifecycle Compliance</h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-6">
                Approvals do not end with the grant letter. Post-clearance environmental statements, factory boiler renewals, and hazardous waste returns are tracked on a dynamic timeline.
              </p>
              <ul className="space-y-2 text-xs text-[#111111] border-t border-[#E5E5E5] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Automated renewal windows</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Penalty risk scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Filing verification receipts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW MAITRI+ WORKS */}
      <section id="workflow" className="py-24 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              03 // Operational Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Four structured phases from land acquisition to commercial operation.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border-t-2 border-[#111111] pt-6">
              <div className="font-mono text-2xl font-bold text-[#111111] mb-4">01</div>
              <h4 className="font-bold text-base text-[#111111] mb-2">Unit Registration</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Provide legal entity details, plant and machinery investment figures, taluka location, and sector parameters in a streamlined 5-step wizard.
              </p>
            </div>

            <div className="border-t-2 border-[#111111] pt-6">
              <div className="font-mono text-2xl font-bold text-[#111111] mb-4">02</div>
              <h4 className="font-bold text-base text-[#111111] mb-2">Roadmap Generation</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                The regulatory rule engine analyzes your project attributes to generate a tailored dependency tree of required pre-establishment approvals.
              </p>
            </div>

            <div className="border-t-2 border-[#111111] pt-6">
              <div className="font-mono text-2xl font-bold text-[#111111] mb-4">03</div>
              <h4 className="font-bold text-base text-[#111111] mb-2">Concurrent Scrutiny</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Departments conduct parallel reviews against a single document vault, with synchronized joint site inspection dispatch to avoid repeated visits.
              </p>
            </div>

            <div className="border-t-2 border-[#111111] pt-6">
              <div className="font-mono text-2xl font-bold text-[#111111] mb-4">04</div>
              <h4 className="font-bold text-base text-[#111111] mb-2">Clearance & Monitoring</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Receive verifiable digital sanction certificates and transition seamlessly into ongoing statutory compliance monitoring with automated renewal alarms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-24 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              04 // Functional Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Engineered for high-throughput regulatory administration.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 01</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">Document Intelligence & Vault</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Securely host and reuse project documents across multiple statutory applications with automated document readiness scoring.
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 02</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">Officer Scrutiny Workspace</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Dedicated portal for regulatory officers across MPCB, DISH, MIDC, and Fire to evaluate dockets, raise queries, and grant approvals.
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 03</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">Joint Inspection Dispatcher</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Coordinate and schedule joint multi-departmental field inspections to eliminate overlapping factory visits and logistical conflicts.
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 04</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">RTS Statutory SLA Engine</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Automated countdown tracking under the Maharashtra Right to Public Services Act with proactive alerts when 80% timeline is reached.
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 05</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">PSI 2019 Incentive Matching</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Automated matching against Maharashtra Package Scheme of Incentives for SGST reimbursements and capital subsidies based on taluka category.
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-8 hover:bg-[#FAFAFA] transition-colors">
              <span className="font-mono text-xs text-[#666666] block mb-3">FEATURE // 06</span>
              <h3 className="font-bold text-base text-[#111111] mb-2">Immutable Audit & State Machine</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Every application transition, query response, and inspection record is captured in an append-only audit trail for administrative transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS */}
      <section className="py-24 border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-xs text-[#666666] block mb-4">AUDIENCE // 01</span>
              <h3 className="text-xl font-bold text-[#111111] mb-4">For Industrial Entrepreneurs</h3>
              <ul className="space-y-4 text-xs text-[#666666]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>70% reduction in total approval cycle time from land acquisition to commissioning.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Zero duplicate document submissions across state agencies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Proactive notification of statutory filing due dates and renewal windows.</span>
                </li>
              </ul>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-xs text-[#666666] block mb-4">AUDIENCE // 02</span>
              <h3 className="text-xl font-bold text-[#111111] mb-4">For Regulatory Officers</h3>
              <ul className="space-y-4 text-xs text-[#666666]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Pre-verified document dockets reduce verification overhead by over 60%.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Unified query management eliminates repetitive correspondence loops.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Synchronized joint site inspection planner minimizes travel logistics.</span>
                </li>
              </ul>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-xs text-[#666666] block mb-4">AUDIENCE // 03</span>
              <h3 className="text-xl font-bold text-[#111111] mb-4">For State Leadership</h3>
              <ul className="space-y-4 text-xs text-[#666666]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Apex dashboard telemetry across all 36 districts and regulatory wings.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Real-time RTS 2015 SLA compliance tracking with automated escalation notices.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#111111] mt-1 shrink-0"></span>
                  <span>Concrete Ease of Doing Business metrics to attract domestic and foreign capital.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SYSTEM ARCHITECTURE */}
      <section id="architecture" className="py-24 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              05 // Technical Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Enterprise MERN stack with strict event-driven separation.
            </h2>
          </div>

          <div className="border border-[#E5E5E5]">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]">
              <div className="p-8">
                <span className="font-mono text-xs text-[#666666] block mb-2">LAYER 01</span>
                <h4 className="font-bold text-sm text-[#111111] mb-3">Presentation & State</h4>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  React 18 single-page application bundled with Vite. Styled with a minimalist design token system and animated via Framer Motion.
                </p>
                <div className="space-y-1 font-mono text-[11px] text-[#111111]">
                  <div>&bull; TanStack Query v5</div>
                  <div>&bull; Axios Interceptor Bus</div>
                  <div>&bull; React Context RBAC</div>
                </div>
              </div>

              <div className="p-8">
                <span className="font-mono text-xs text-[#666666] block mb-2">LAYER 02</span>
                <h4 className="font-bold text-sm text-[#111111] mb-3">API Gateway & Security</h4>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  Express API gateway with strict JWT authentication, role-based authorization, rate limiting, and structured JSON logging.
                </p>
                <div className="space-y-1 font-mono text-[11px] text-[#111111]">
                  <div>&bull; Helmet & Compression</div>
                  <div>&bull; Strict RBAC Middleware</div>
                  <div>&bull; Unified Error Envelope</div>
                </div>
              </div>

              <div className="p-8">
                <span className="font-mono text-xs text-[#666666] block mb-2">LAYER 03</span>
                <h4 className="font-bold text-sm text-[#111111] mb-3">Regulatory Core Engine</h4>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  Statutory rule processor calculating approval dependency trees, RTS compliance timers, and multi-officer concurrent scrutiny workflows.
                </p>
                <div className="space-y-1 font-mono text-[11px] text-[#111111]">
                  <div>&bull; SLA Countdown Engine</div>
                  <div>&bull; Knowledge Base Indexer</div>
                  <div>&bull; Document Readiness Evaluator</div>
                </div>
              </div>

              <div className="p-8">
                <span className="font-mono text-xs text-[#666666] block mb-2">LAYER 04</span>
                <h4 className="font-bold text-sm text-[#111111] mb-3">Persistence & Audit</h4>
                <p className="text-xs text-[#666666] leading-relaxed mb-4">
                  MongoDB persistence layer with Mongoose ODM modeling Projects, Documents, Applications, Inspections, and immutable AuditLogs.
                </p>
                <div className="space-y-1 font-mono text-[11px] text-[#111111]">
                  <div>&bull; Indexed Document Vault</div>
                  <div>&bull; Append-Only Audit Trail</div>
                  <div>&bull; Soft-Delete Integrity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STATISTICS */}
      <section id="statistics" className="py-24 border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              06 // Statewide Performance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Measurable regulatory velocity across Maharashtra.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight block">
                ₹70,700 Cr
              </span>
              <span className="text-xs font-semibold text-[#111111] mt-2 block">
                Industrial Investment Facilitated
              </span>
              <p className="text-[11px] text-[#666666] mt-1">
                Across manufacturing, clean energy, chemicals, and data centers.
              </p>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight block">
                11.8 Days
              </span>
              <span className="text-xs font-semibold text-[#111111] mt-2 block">
                Average Clearance Turnaround
              </span>
              <p className="text-[11px] text-[#666666] mt-1">
                Reduced from the pre-reform state average of 45 statutory days.
              </p>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight block">
                97.2%
              </span>
              <span className="text-xs font-semibold text-[#111111] mt-2 block">
                RTS Statutory SLA Adherence
              </span>
              <p className="text-[11px] text-[#666666] mt-1">
                Strict adherence under the Right to Public Services Act 2015.
              </p>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight block">
                100%
              </span>
              <span className="text-xs font-semibold text-[#111111] mt-2 block">
                Document Vault Reusability
              </span>
              <p className="text-[11px] text-[#666666] mt-1">
                Zero repeat document uploads required across regulatory agencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="py-24 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs text-[#666666] uppercase tracking-widest block mb-2">
              07 // Common Queries
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Frequently asked questions.
            </h2>
          </div>

          <div className="max-w-4xl border-t border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-6">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left flex items-start justify-between gap-4 group"
                  >
                    <span className="text-base font-semibold text-[#111111] group-hover:text-[#666666] transition-colors">
                      {faq.q}
                    </span>
                    <span className="p-1 border border-[#E5E5E5] text-[#111111] shrink-0 mt-0.5">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-xs sm:text-sm text-[#666666] leading-relaxed max-w-3xl">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-16 bg-[#FFFFFF] text-xs text-[#666666]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16 border-b border-[#E5E5E5]">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#000000] text-[#FFFFFF] flex items-center justify-center font-bold text-xs">
                  M+
                </div>
                <span className="font-bold text-sm text-[#111111]">MAITRI+</span>
              </div>
              <p className="text-xs text-[#666666] max-w-sm leading-relaxed">
                Maharashtra AI-powered Industrial Registration & Tracking Intelligence.
                Single-window statutory clearances and compliance telemetry under the Directorate of Industries.
              </p>
              <div className="font-mono text-[11px] text-[#111111]">
                Smart India Hackathon &bull; Problem Statement PS-26130
              </div>
            </div>

            <div>
              <h5 className="font-bold text-[#111111] uppercase tracking-wider text-[11px] mb-4">
                Workspaces
              </h5>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/dashboard" className="hover:text-[#111111] transition-colors">
                    Entrepreneur Console
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-[#111111] transition-colors">
                    Industrial Units
                  </Link>
                </li>
                <li>
                  <Link to="/applications" className="hover:text-[#111111] transition-colors">
                    Single Window NOCs
                  </Link>
                </li>
                <li>
                  <Link to="/documents" className="hover:text-[#111111] transition-colors">
                    Smart Document Vault
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#111111] uppercase tracking-wider text-[11px] mb-4">
                Authorities
              </h5>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/officer" className="hover:text-[#111111] transition-colors">
                    Nodal Officer Workspace
                  </Link>
                </li>
                <li>
                  <Link to="/compliance" className="hover:text-[#111111] transition-colors">
                    Statutory Compliance Tracker
                  </Link>
                </li>
                <li>
                  <Link to="/schemes" className="hover:text-[#111111] transition-colors">
                    PSI 2019 Incentives
                  </Link>
                </li>
                <li>
                  <a
                    href="https://maitri.mahaonline.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#111111] transition-colors inline-flex items-center gap-1"
                  >
                    <span>MAITRI Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#111111] uppercase tracking-wider text-[11px] mb-4">
                Statutory Governance
              </h5>
              <ul className="space-y-2.5">
                <li>
                  <span className="text-[#111111]">Right to Services Act (RTS 2015)</span>
                </li>
                <li>
                  <span>Max Turnaround: 21 Days</span>
                </li>
                <li>
                  <span>Helpdesk: 1800-120-8040</span>
                </li>
                <li>
                  <span>Status: Operational (v1.0.0)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#666666]">
            <div>
              &copy; {new Date().getFullYear()} Directorate of Industries, Government of Maharashtra. All rights reserved.
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px]">
              <span>CONFIDENTIAL // SIH 2026 EVALUATION COPY</span>
              <span>STATE LEVEL SYSTEM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
