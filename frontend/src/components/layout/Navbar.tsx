import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Layers } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    console.log(isAuthenticated)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Fonctionnalités", href: "#features" },
    { name: "Workflow", href: "#workflow" },
    { name: "Équipe", href: "#team" },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#0A0F1C]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg shadow-black/20" 
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${scrolled ? 'bg-white/10 border border-white/20' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#126FFF] transition-colors">
              Auto Thesis
            </span>
          </a>

          {/* Desktop Nav - Only show on landing page */}
          {isLandingPage && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className="text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ?
              <button 
              onClick={() => window.location.href = '/login'}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Connexion
              </button>
              :
              <button 
              onClick={() => window.location.href = '/upload'}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Upload
              </button>
            }
            <button 
              onClick={() => window.location.href = '/register'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#126FFF] hover:bg-[#126FFF]/90 text-sm font-semibold text-white transition-all shadow-lg shadow-[#126FFF]/20"
            >
              Démarrer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A0F1C]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {isLandingPage && navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className="block px-3 py-4 text-base font-medium text-slate-300 hover:text-white border-b border-white/5 last:border-0 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-slate-200 font-medium hover:bg-white/10 transition-colors"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#126FFF] text-white font-medium hover:bg-[#126FFF]/90 transition-colors"
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
