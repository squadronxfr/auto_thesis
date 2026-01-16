import { Github, Layers } from 'lucide-react';

export function Footer() {
    return (
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
                        <a 
                            href="https://github.com/squadronxfr/auto_thesis" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#126FFF] hover:text-white transition-colors"
                        >
                            <Github size={20} />
                        </a>
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
                        <li>
                            <a 
                                href="https://github.com/squadronxfr/auto_thesis" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="hover:text-[#126FFF] transition-colors"
                            >
                                GitHub
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Auto Thesis. All rights reserved.</p>
            </div>
        </footer>
    );
}
