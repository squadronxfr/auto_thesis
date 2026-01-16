import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Github, 
  ChevronDown, 
  Zap,
  Clock,
  AlertTriangle,
  Brain,
  XCircle,
  Sparkles,
  FileCheck,
  Users,
  PenLine
} from 'lucide-react';
import { Button } from '@/components/ui';
import Galaxy from '@/components/Galaxy';
import { Navbar } from '@/components/layout';

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`py-20 px-6 md:px-12 max-w-7xl mx-auto ${className}`}>
    {children}
  </section>
);


const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#126FFF]/50 transition-colors group"
  >
    <div className="w-12 h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="text-[#126FFF] w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const StepIndicator = ({ step, title, description, isActive }: { step: number, title: string, description: string, isActive: boolean }) => (
  <div className="flex gap-6 items-start">
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold transition-all duration-500 ${isActive ? 'border-[#126FFF] bg-[#126FFF] text-white' : 'border-slate-700 text-slate-500'}`}>
        {step}
      </div>
      {step !== 4 && <div className="w-0.5 h-20 bg-slate-800" />}
    </div>
    <div className="pt-1">
      <h4 className={`text-lg font-bold mb-2 transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-500'}`}>{title}</h4>
      <p className="text-slate-400 text-sm max-w-sm">{description}</p>
    </div>
  </div>
);

const ContributorCard = ({ name, github, avatar }: { name: string, github: string, avatar: string }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0F172A] border border-white/5 hover:border-white/20 transition-all">
    <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden">
      <img src={avatar} alt={name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{name}</p>
      <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-[#126FFF] flex items-center gap-1 mt-0.5">
        <Github size={12} /> @{github}
      </a>
    </div>
  </div>
);

const Accordion = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-[#126FFF] transition-colors"
      >
        <span className="text-lg font-medium text-slate-200">{question}</span>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#126FFF]' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CONTRIBUTORS = [
  { name: "Matis ANGER", github: "MatisAgr", avatar: "https://github.com/MatisAgr.png" },
  { name: "Julien BINET", github: "JulienBNT", avatar: "https://github.com/JulienBNT.png" },
  { name: "Carl BOURGES", github: "carlbrgs", avatar: "https://github.com/carlbrgs.png" },
  { name: "Miguel KIDIMBA", github: "kiddMiguel", avatar: "https://github.com/kiddMiguel.png" },
  { name: "Sedanur OZDEMIR", github: "sedanur52", avatar: "https://github.com/sedanur52.png" },
  { name: "Kilian TROUET", github: "biholo", avatar: "https://github.com/biholo.png" },
  { name: "Soumaya JEBALI", github: "jebalisoumaya", avatar: "https://github.com/jebalisoumaya.png" },
  { name: "Carolle TIGNOKPA", github: "CarTig", avatar: "https://github.com/CarTig.png" },
  { name: "Chaimae HMAMED", github: "chaimaehmamed", avatar: "https://github.com/chaimaehmamed.png" },
  { name: "Souhir BEJI", github: "souhirbeji", avatar: "https://github.com/souhirbeji.png" },
  { name: "Medamine KORNITI", github: "MedAmine000", avatar: "https://github.com/MedAmine000.png" },
  { name: "Elyes ADDENRI", github: "Madoff77", avatar: "https://github.com/Madoff77.png" },
  { name: "Lyes AIT TAYEB", github: "lyesatb", avatar: "https://github.com/lyesatb.png" },
  { name: "Rayan DZIRI", github: "DzRayane", avatar: "https://github.com/DzRayane.png" },
  { name: "Amine CHERIF", github: "Aminechf11", avatar: "https://github.com/Aminechf11.png" }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 selection:bg-[#126FFF]/30 selection:text-[#126FFF] overflow-x-hidden">
      <Navbar />
      
      {/* HERO SECTION WITH GALAXY */}
      <section className="relative h-screen w-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Galaxy 
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1.5}
            glowIntensity={0.5}
            saturation={0.8}
            hueShift={240}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1C] z-10" />

        <div className="relative z-20 flex-1 flex items-center justify-center px-6 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-5xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#126FFF]/10 backdrop-blur-sm border border-[#126FFF]/20 text-[#126FFF] text-sm font-semibold mb-8"
            >
              <Zap size={16} className="fill-[#126FFF]" />
              Intelligence Artificielle Agentique
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              Génère un mémoire<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#126FFF] via-cyan-400 to-[#126FFF] animate-gradient">structuré</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Auto Thesis orchestre des agents IA spécialisés pour transformer vos idées en manuscrit académique rigoureux
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/register'}
                className="w-full sm:w-auto h-14 px-10 text-lg font-bold"
              >
                Commencer gratuitement <ArrowRight size={20} />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full sm:w-auto h-14 px-10 text-lg border-white/20 hover:border-white/40 backdrop-blur-sm bg-white/5"
              >
                Voir comment ça marche
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-20 pb-10 flex justify-center"
        >
          <ChevronDown size={32} className="text-white/50" />
        </motion.div>
      </section>

      {/* BENEFITS + ANIMATED MEMOIR SECTION */}
      <Section className="relative py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Benefits */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Transforme tes idées en <span className="text-[#126FFF]">mémoire professionnel</span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Notre plateforme capture l'essence de ta recherche et la transforme en un manuscrit académique structuré et rigoureux.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: PenLine,
                  title: "Rédaction Guidée",
                  desc: "Des prompts intelligents qui stimulent la réflexion et les détails précis."
                },
                {
                  icon: Sparkles,
                  title: "Raffinement IA",
                  desc: "Améliore ton style avec une qualité littéraire professionnelle."
                },
                {
                  icon: BookOpen,
                  title: "Qualité Académique",
                  desc: "Structure ton travail en chapitres prêts pour la publication."
                },
                {
                  icon: CheckCircle2,
                  title: "Confidentialité Totale",
                  desc: "Tes recherches sont sécurisées avec un chiffrement enterprise."
                }
              ].map((benefit, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#126FFF]/30 hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#126FFF]/10 flex items-center justify-center group-hover:bg-[#126FFF]/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-[#126FFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-1">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Animated Memoir Pages */}
          <div className="relative h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#126FFF]/10 to-transparent rounded-3xl -rotate-2" />
            
            {/* Decorative Stacks */}
            <motion.div 
              animate={{ rotate: [-1, 2, -1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[340px] h-[440px] bg-white/5 border border-white/10 rounded-sm shadow-sm rotate-3 translate-x-4 translate-y-2" 
            />
            <motion.div 
              animate={{ rotate: [2, -2, 2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[340px] h-[440px] bg-white/5 border border-white/10 rounded-sm shadow-md -rotate-2 -translate-x-2" 
            />

            {/* Active Typing Page */}
            <motion.div 
              className="relative w-[340px] h-[440px] bg-[#0F172A] border border-white/20 rounded-sm shadow-2xl p-8 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {/* Paper Header */}
              <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
                <div className="h-2 w-24 bg-white/10 rounded" />
                <div className="h-2 w-8 bg-white/10 rounded" />
              </div>

              {/* Typing Lines */}
              <div className="space-y-4">
                {[0, 1, 2, 3, 4, 5, 6].map((line) => (
                  <div key={line} className="relative h-2 w-full">
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileInView={{ width: line === 6 ? "60%" : "100%" }}
                      transition={{ 
                        duration: 1.5, 
                        delay: 0.5 + (line * 0.4),
                        ease: "easeInOut" 
                      }}
                      className="absolute inset-0 bg-white/20 rounded"
                    />
                    {line % 3 === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 1, 0] }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: Infinity,
                          delay: 0.5 + (line * 0.4) 
                        }}
                        className="absolute -right-1 top-0 w-0.5 h-full bg-[#126FFF]"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Floating Pen Icon */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-12 opacity-10"
              >
                <PenLine size={80} className="text-white" />
              </motion.div>

              {/* Page Footer */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#126FFF]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* PROBLEM → SOLUTION WITH ICONS */}
      <Section className="grid md:grid-cols-2 gap-12 border-y border-white/5 bg-[#0F172A]/30 rounded-3xl p-8 md:p-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-[0.2em]">Problèmes</div>
            <h3 className="text-2xl font-bold text-white">Les défis de la rédaction académique</h3>
          </div>
          <ul className="space-y-5">
            {[
              { icon: Clock, text: "Écrire un mémoire prend énormément de temps et d'énergie", color: "text-red-400", bg: "bg-red-500/10" },
              { icon: AlertTriangle, text: "Manque de structure méthodologique claire", color: "text-red-400", bg: "bg-red-500/10" },
              { icon: Brain, text: "IA classiques peu adaptées aux exigences académiques", color: "text-red-400", bg: "bg-red-500/10" },
              { icon: XCircle, text: "Risque de contenu incohérent ou non exploitable", color: "text-red-400", bg: "bg-red-500/10" }
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 group transition-all duration-300 hover:translate-x-1">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors pt-2 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-[#126FFF]/10 text-[#126FFF] text-[10px] font-bold uppercase tracking-[0.2em]">Solution</div>
            <h3 className="text-2xl font-bold text-white">Une approche agentique rigoureuse</h3>
          </div>
          <ul className="space-y-5">
            {[
              { icon: CheckCircle2, text: "Génération guidée par étapes académiques validées", color: "text-[#126FFF]", bg: "bg-[#126FFF]/10" },
              { icon: Sparkles, text: "Agents spécialisés (recherche, structure, rédaction, cohérence)", color: "text-[#126FFF]", bg: "bg-[#126FFF]/10" },
              { icon: FileCheck, text: "Production d'un contenu compréhensible et structuré", color: "text-[#126FFF]", bg: "bg-[#126FFF]/10" },
              { icon: Users, text: "Outil pensé pour accompagner, pas remplacer l'étudiant", color: "text-[#126FFF]", bg: "bg-[#126FFF]/10" }
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 group transition-all duration-300 hover:translate-x-1">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors pt-2 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* PRICING BETA SECTION */}
      <section id="features" className="relative py-24 px-6 overflow-hidden bg-[#0A0F1C]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#126FFF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-[#126FFF]/40 to-transparent">
              <div className="bg-[#0F172A] rounded-[2.3rem] p-8 md:p-16 border border-white/5 backdrop-blur-xl">
                <div className="flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#126FFF]/10 border border-[#126FFF]/30 mb-8"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#126FFF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#126FFF]"></span>
                    </span>
                    <span className="text-[#126FFF] text-xs font-bold tracking-widest uppercase">Beta Gratuite</span>
                  </motion.div>

                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    L'excellence est à vous, <br />
                    <span className="text-[#126FFF]">sans compromis financier.</span>
                  </h2>
                  
                  <p className="text-slate-400 text-lg max-w-2xl mb-12 leading-relaxed">
                    Nous finalisons notre infrastructure d'élite. En échange de vos retours constructifs, 
                    profitez de l'intégralité de nos fonctionnalités premium <span className="text-white font-medium italic">gratuitement pour le moment</span>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 text-left">
                    {[
                      { icon: Sparkles, title: "Accès Illimité", desc: "Aucune restriction sur les outils" },
                      { icon: CheckCircle2, title: "Zéro Frais", desc: "Aucune carte bancaire requise" },
                      { icon: Clock, title: "Support Prioritaire", desc: "Assistance dédiée 24/7" }
                    ].map((item, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#126FFF]/30 transition-colors">
                        <item.icon className="w-6 h-6 text-[#126FFF] mb-4" />
                        <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button
                      onClick={() => window.location.href = '/register'}
                      variant="primary"
                      className="px-8 py-4 text-base font-bold shadow-[0_0_20px_rgba(18,111,255,0.3)]"
                    >
                      Rejoindre la Beta Maintenant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      Places limitées pour cette phase
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <Section id="workflow" className="bg-[#0F172A]/50 border-y border-white/5 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Le Workflow Agentique</h2>
            <div className="space-y-4">
              <StepIndicator 
                step={1}
                title="Définition du cadre"
                description="Vous précisez votre sujet, votre problématique et vos contraintes spécifiques."
                isActive={true}
              />
              <StepIndicator 
                step={2}
                title="Analyse & Structuration"
                description="L'agent architecte élabore un plan détaillé cohérent avec les enjeux académiques."
                isActive={true}
              />
              <StepIndicator 
                step={3}
                title="Génération Guidée"
                description="Le contenu est rédigé bloc par bloc, validé en temps réel par l'agent critique."
                isActive={true}
              />
              <StepIndicator 
                step={4}
                title="Raffinement & Export"
                description="Vous ajustez les nuances, intégrez vos sources et exportez le manuscrit final."
                isActive={false}
              />
            </div>
          </div>
          <div className="relative">
             <div className="aspect-video bg-[#0A0F1C] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#126FFF]/20 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 ml-4 tracking-widest uppercase">system_output.log</div>
                </div>
                <div className="p-6 font-mono text-sm space-y-3">
                  <div className="text-[#126FFF]">{'>'} initializing_research_agent...</div>
                  <div className="text-slate-500">{'>'} analysis starting on: "Impact of AI in Education"</div>
                  <div className="text-green-400">{'>'} structure_validated: 100%</div>
                  <div className="text-white animate-pulse">{'>'} generating_chapter_1_introduction...</div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-[#126FFF]" 
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </Section>

      {/* CONTRIBUTORS */}
      <Section id="team">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">L'équipe Auto Thesis</h2>
            <p className="text-slate-400 text-lg">Un projet open-source développé par une équipe passionnée d'IA et d'éducation.</p>
          </div>
          <a 
            href="https://github.com/squadronxfr/auto_thesis" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white font-mono text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
          >
            <Github size={18} /> Voir sur GitHub
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CONTRIBUTORS.map((c, i) => (
            <ContributorCard key={i} {...c} />
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="max-w-3xl">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Questions fréquentes</h2>
        <div className="space-y-2">
          <Accordion 
            question="Est-ce que le contenu est modifiable ?" 
            answer="Absolument. Auto Thesis génère une base structurée que vous pouvez éditer, reformuler et enrichir à tout moment via notre éditeur en ligne ou après exportation." 
          />
          <Accordion 
            question="Est-ce du plagiat ?" 
            answer="Non. L'outil génère du contenu original basé sur vos instructions. Cependant, nous recommandons toujours de passer votre travail final dans un détecteur de plagiat universitaire pour garantir une intégrité totale vis-à-vis de vos sources." 
          />
          <Accordion 
            question="L'outil respecte-t-il les attentes universitaires ?" 
            answer="Oui, nos agents sont programmés pour suivre les conventions de rédaction scientifique : neutralité, précision, structure argumentative et citations rigoureuses." 
          />
          <Accordion 
            question="Puis-je utiliser mes propres sources ?" 
            answer="Oui, vous pouvez importer vos documents de référence pour que l'IA s'appuie spécifiquement sur vos lectures et données." 
          />
          <Accordion 
            question="Mes données sont-elles sauvegardées ?" 
            answer="Toutes vos sessions sont sauvegardées de manière sécurisée et chiffrée. Vous seul avez accès à votre travail et à vos sources." 
          />
        </div>
      </Section>

      {/* TECH CTA */}
      <Section className="text-center py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#126FFF08_1px,transparent_1px),linear-gradient(to_bottom,#126FFF08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#126FFF]/20 bg-[#126FFF]/5 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/50 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#126FFF] font-bold uppercase">System: Ready</span>
          </div>

          <div className="font-mono text-sm md:text-base mb-8 text-[#126FFF]/60">
            <span className="mr-3 select-none">❯</span>
            <span className="text-slate-300">initialize_thesis.sh --mode=expert</span>
            <span className="inline-block w-2 h-4 ml-2 bg-[#126FFF] animate-pulse align-middle" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Commence ton mémoire dès maintenant
          </h2>

          <p className="text-slate-400 mb-12 text-lg max-w-xl mx-auto font-mono leading-relaxed">
            Rejoins les milliers d'étudiants qui utilisent l'IA agentique pour structurer leurs recherches avec précision.
          </p>

          <div className="flex flex-col items-center gap-6">
            <Button
              className="px-12 py-7 text-lg font-mono bg-[#126FFF] hover:bg-[#126FFF]/90 border-none shadow-[0_0_30px_rgba(18,111,255,0.35)] transition-all hover:scale-105 active:scale-95 text-white"
              onClick={() => window.location.href = '/register'}
            >
              RUN_INSTALLATION
            </Button>
            <div className="flex items-center gap-5 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              <span>v1.0.4-stable</span>
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              <span>Free tier enabled</span>
              <span className="w-1 h-1 rounded-full bg-slate-800" />
              <span>No CC required</span>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-20 bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#126FFF] rounded-lg flex items-center justify-center">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">AUTO THESIS</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-8">
              Engineering the next generation of autonomous intelligence. Open source, deterministic, and built for scale.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/squadronxfr/auto_thesis" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#126FFF] hover:text-white transition-colors"><Github size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Navigation</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="/login" className="hover:text-[#126FFF] transition-colors">Connexion</a></li>
              <li><a href="/register" className="hover:text-[#126FFF] transition-colors">Inscription</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Communauté</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="https://github.com/squadronxfr/auto_thesis" target="_blank" rel="noreferrer" className="hover:text-[#126FFF] transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Auto Thesis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
