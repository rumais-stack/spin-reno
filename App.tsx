
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Trophy, Star, Instagram, ExternalLink, ArrowRight } from 'lucide-react';
import Wheel from './components/Wheel';
import { WheelOption, SpinResult } from './types';

/**
 * 📢 HOW TO CHANGE YOUR INSTAGRAM:
 * Replace the URL below with your actual Instagram profile link.
 */
const INSTAGRAM_URL = "https://www.instagram.com/renovadesign.official";

const COLORS = [
  '#cc9933', // Gold/Yellow
  '#ffffff', // White
  '#4a6d5c', // Renova Green
  '#b3862b', // Darker Gold
  '#e5e7eb', // Grey/Platinum
  '#1e332a', // Dark Green
];

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', label: '50% DISCOUNT', color: COLORS[0], weight: 4 },
  { id: '2', label: '20% DISCOUNT', color: COLORS[1], weight: 7 },
  { id: '3', label: 'BETTER LUCK NEXT TIME', color: COLORS[2], weight: 70 },
  { id: '4', label: '100% DISCOUNT', color: COLORS[3], weight: 2 },
  { id: '5', label: '100 RS CASHBACK', color: COLORS[4], weight: 3 },
  { id: '6', label: '50 RS CASHBACK', color: COLORS[5], weight: 14 },
];

const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => (
  <div className="flex flex-col items-center select-none">
    <div className="relative">
      <div className={`${size === 'lg' ? 'text-[80px]' : 'text-[50px]'} leading-[0.8] font-black text-[#cc9933] italic tracking-tighter`}>re</div>
      <div className={`${size === 'lg' ? 'text-[60px]' : 'text-[40px]'} leading-[0.8] font-black text-white -mt-1 tracking-tight`}>nova</div>
    </div>
    <div className={`${size === 'lg' ? 'text-[14px]' : 'text-[10px]'} font-bold tracking-[0.5em] text-[#cc9933] mt-2 uppercase pl-2`}>
      DESIGN
    </div>
  </div>
);

const App: React.FC = () => {
  const [options] = useState<WheelOption[]>(DEFAULT_OPTIONS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [targetRotation, setTargetRotation] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  
  const currentRotationRef = useRef(0);

  useEffect(() => {
    const unlocked = localStorage.getItem('renova_unlocked');
    if (unlocked === 'true') setIsUnlocked(true);
  }, []);

  const handleUnlock = () => {
    localStorage.setItem('renova_unlocked', 'true');
    setIsUnlocked(true);
  };

  const triggerConfetti = (tier: number) => {
    // @ts-ignore
    const confetti = window.confetti;
    if (!confetti) return;

    if (tier === 0) return;

    if (tier === 1) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#cc9933', '#ffffff'] });
    } else if (tier === 2) {
      const duration = 2 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#cc9933', '#ffffff'] });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#cc9933', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    } else if (tier === 3) {
      const count = 200;
      const defaults = { origin: { y: 0.7 }, colors: ['#cc9933', '#ffffff', '#b3862b'] };
      const fire = (particleRatio: number, opts: any) => confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else if (tier === 4) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  };

  const handleSpin = () => {
    if (isSpinning || options.length < 2) return;
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = Math.random() * totalWeight;
    let winningIndex = 0;
    for (let i = 0; i < options.length; i++) {
      if (random < options[i].weight) { winningIndex = i; break; }
      random -= options[i].weight;
    }
    const sliceAngle = (2 * Math.PI) / options.length;
    const targetPointerPos = winningIndex * sliceAngle + sliceAngle / 2;
    const finalRotationNormalized = (2 * Math.PI - targetPointerPos) % (2 * Math.PI);
    const currentRotNormalized = currentRotationRef.current % (2 * Math.PI);
    let rotationDelta = finalRotationNormalized - currentRotNormalized;
    if (rotationDelta <= 0) rotationDelta += 2 * Math.PI;
    const extraSpins = 8 * 2 * Math.PI;
    const totalDelta = extraSpins + rotationDelta;
    setTargetRotation(totalDelta);
    setIsSpinning(true);
    setLastResult(null);
  };

  const onSpinComplete = useCallback((winner: WheelOption) => {
    const result: SpinResult = { option: winner, timestamp: Date.now() };
    currentRotationRef.current += targetRotation;
    setLastResult(result);
    setIsSpinning(false);
    let tier = 0;
    if (winner.label === '100% DISCOUNT') tier = 4;
    else if (winner.weight <= 4) tier = 3;
    else if (winner.weight <= 7) tier = 2;
    else if (winner.weight <= 14) tier = 1;
    triggerConfetti(tier);
  }, [targetRotation]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#2d4a3e] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(204,153,51,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-md w-full glass p-10 rounded-[40px] border-2 border-white/10 text-center relative z-10 shadow-2xl">
          <div className="mb-8 rotate-[-2deg]"><Logo size="sm" /></div>
          <h1 className="text-3xl font-black mb-4 tracking-tight uppercase">Access Granted</h1>
          <p className="text-white/60 mb-10 leading-relaxed font-medium">
            To unlock the Renova Rewards wheel, please follow us on Instagram.
          </p>
          
          <div className="space-y-6">
            {/* 🎯 REFINED FOLLOW BUTTON */}
            <a 
              href={INSTAGRAM_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setHasClickedFollow(true)}
              className="group relative flex items-center justify-center w-full py-5 bg-[#cc9933] text-[#2d4a3e] rounded-full font-black text-lg hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_15px_35px_rgba(204,153,51,0.4)] overflow-hidden"
            >
              <div className="absolute left-6 group-hover:scale-110 transition-transform">
                <Instagram size={24} />
              </div>
              <span className="tracking-widest uppercase">Follow Us</span>
              <div className="absolute right-6 opacity-40 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={18} />
              </div>
            </a>

            {hasClickedFollow && (
              <button
                onClick={handleUnlock}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-white/80 rounded-full font-bold text-sm hover:bg-white/10 hover:text-white transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                I'VE FOLLOWED <ArrowRight size={16} />
              </button>
            )}
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-3 text-white/10">
            <Sparkles size={14} />
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Premium Verification Required</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d4a3e] text-white selection:bg-[#cc9933]/40 flex flex-col items-center justify-center overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(204,153,51,0.05)_0%,transparent_70%)]"></div>
      </div>

      <main className="relative z-10 w-full max-w-7xl px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32">
        <section className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="animate-float">
            <Logo />
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 hidden lg:flex items-center gap-4 text-white/30">
            <Sparkles size={16} />
            <span className="text-xs tracking-widest uppercase font-bold">Premium Rewards Engine</span>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center w-full lg:w-auto">
          <div className="relative mb-12">
            <div className="absolute -inset-8 bg-[#cc9933]/10 blur-[100px] rounded-full"></div>
            <Wheel options={options} isSpinning={isSpinning} onSpinComplete={onSpinComplete} targetRotation={targetRotation} />
            
            {lastResult && !isSpinning && (
              <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-700 pointer-events-none">
                <div className={`
                  ${lastResult.option.label === '100% DISCOUNT' ? 'bg-gradient-to-br from-[#cc9933] to-[#b3862b] text-white scale-110 shadow-[0_0_80px_rgba(204,153,51,0.8)]' : 'bg-[#cc9933] text-[#2d4a3e] shadow-[0_0_50px_rgba(204,153,51,0.5)]'}
                  px-12 py-8 rounded-[40px] text-center transform -rotate-2 border-4 border-white/30 relative
                `}>
                  {lastResult.option.label === '100% DISCOUNT' && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2">
                       <Star className="text-white fill-white animate-bounce" />
                       <Trophy size={48} className="text-white fill-white animate-pulse" />
                       <Star className="text-white fill-white animate-bounce delay-100" />
                    </div>
                  )}
                  <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60 mb-2">
                    {lastResult.option.label.includes('LUCK') ? 'Session Result' : 'Exclusive Reward'}
                  </p>
                  <h2 className="text-4xl md:text-5xl font-black whitespace-nowrap tracking-tight leading-tight">
                    {lastResult.option.label}
                  </h2>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full py-6 bg-white text-[#2d4a3e] hover:bg-[#cc9933] hover:text-[#2d4a3e] disabled:opacity-30 disabled:cursor-not-allowed rounded-full font-black text-2xl tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all transform hover:scale-105 active:scale-95 uppercase border-b-8 border-slate-200 hover:border-[#b3862b]"
            >
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-3">
             {options.map(opt => (
               <div key={opt.id} className="group relative flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 transition-all hover:bg-white/10 hover:text-white">
                 <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: opt.color }}></div>
                 {opt.label}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                   {opt.weight}% Chance
                 </div>
               </div>
             ))}
          </div>
        </section>
      </main>

      <footer className="w-full py-8 text-center text-white/20 text-[10px] tracking-[0.4em] uppercase font-medium">
        &copy; {new Date().getFullYear()} RenovaDesign &bull; Premium Rewards Portal
      </footer>
    </div>
  );
};

export default App;
