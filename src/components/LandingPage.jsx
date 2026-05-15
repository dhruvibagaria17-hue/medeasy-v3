import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';
import AuthModal from './AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import medeasyLogo from './About Us_extracted/Medeasy.png';

const LogoMark = ({ className = '' }) => {
  const uid = useId();
  const filterId = `${uid}-maskFilter`;
  const maskId = `${uid}-mask`;
  const gradId = `${uid}-grad`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 768 768"
      className={className}
      aria-label="Medeasy"
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00563B" />
          <stop offset="1" stopColor="#2F7D6B" />
        </linearGradient>

        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0      0      0      1 0
            "
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="1.1" exponent="1.6" offset="0" />
            <feFuncG type="gamma" amplitude="1.1" exponent="1.6" offset="0" />
            <feFuncB type="gamma" amplitude="1.1" exponent="1.6" offset="0" />
          </feComponentTransfer>
          <feMorphology operator="dilate" radius="2" />
        </filter>

        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="768" height="768">
          <rect width="768" height="768" fill="black" />
          <image href={medeasyLogo} width="768" height="768" filter={`url(#${filterId})`} />
        </mask>
      </defs>

      <rect width="768" height="768" fill={`url(#${gradId})`} mask={`url(#${maskId})`} />
    </svg>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogoClick = () => {
    navigate('/search');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-slate-50 overflow-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 right-0 p-4 sm:p-8 z-[100] flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-textPrimary font-bold text-sm sm:text-base">Hi {user.name}</span>
              <button 
                onClick={logout}
                className="text-xs text-textSecondary hover:text-accent2 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-accent1/20 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all text-textPrimary font-bold text-sm sm:text-base"
          >
            <LogIn className="w-5 h-5 text-primary" />
            Sign In / Sign Up
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Dynamic Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/16 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/18 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-vibrantBlue/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      {/* Artsy Image with Blend Mode */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.25 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 z-0 mix-blend-multiply"
        style={{
          backgroundImage: `url('/src/data/New folder (2)/yellow-pink-cute-playful-small-pattern-fresh-background-poster_2754703.jpg!bw700')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.1) brightness(1.1)',
        }}
      />
      
      {/* Professional Overlay */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-10" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-20 text-center flex flex-col items-center group px-4 sm:px-6"
        onClick={handleLogoClick}
      >
        <div className="relative mb-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 bg-gradient-to-tr from-primary via-secondary to-vibrantBlue rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
          />
          <div className="relative w-32 h-32 sm:w-56 sm:h-56 bg-transparent rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-700">
            <div className="w-full h-full rounded-full bg-white/85 backdrop-blur-md border border-white/70 flex items-center justify-center shadow-2xl">
              <div className="w-full h-full">
                <LogoMark className="w-full h-full scale-110" />
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Medeasy
        </h1>
        <p className="text-textSecondary text-lg sm:text-2xl font-medium opacity-80 mb-10 sm:mb-12 tracking-wide px-2">
          Your Intelligent Healthcare Companion
        </p>

        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.95 }}
          className="relative px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-xl text-white overflow-hidden group/btn w-full sm:w-auto max-w-xs"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 group-hover/btn:scale-110" />
          <span className="relative flex items-center gap-3">
            <span>Get started!</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
