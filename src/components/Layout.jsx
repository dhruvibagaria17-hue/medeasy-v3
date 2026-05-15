import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { User, LogIn, Menu, X, ChevronDown, History, Search, Info, Bookmark, Bell, LogOut } from 'lucide-react';
import { subscribeUserFolders } from '../db/folders.js';
import medeasyLogo from './About Us_extracted/Medeasy.png';

const LogoMark = ({ size = 28, className = '' }) => {
  const uid = useId();
  const filterId = `${uid}-maskFilter`;
  const maskId = `${uid}-mask`;
  const gradId = `${uid}-grad`;

  return (
    <svg
      width={size}
      height={size}
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

const Layout = () => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFoldersMenuOpen, setIsFoldersMenuOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showGoTop, setShowGoTop] = useState(false);
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const foldersMenuRef = useRef(null);

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
    setIsFoldersMenuOpen(false);

    const hash = location.hash?.replace('#', '');
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 160;
      setShowGoTop(nearBottom);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setFolders([]);
      return;
    }
    const unsub = subscribeUserFolders(
      user.uid,
      (data) => setFolders(Array.isArray(data) ? data : []),
      () => setFolders([])
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const onDown = (e) => {
      const t = e.target;
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(t)) {
        setIsProfileMenuOpen(false);
      }
      if (isFoldersMenuOpen && foldersMenuRef.current && !foldersMenuRef.current.contains(t)) {
        setIsFoldersMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isProfileMenuOpen, isFoldersMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-background font-sans overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <div className="bg-amber-50/90 backdrop-blur-md border-b border-amber-200/50 py-2 px-4 sm:px-8 text-center">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.15em]">
            Disclaimer: This website is for informative purposes only. Always consult a healthcare professional before making any changes to your medication.
          </p>
        </div>

        <header className="bg-white/50 backdrop-blur-md border-b border-accent1/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/70 transition-colors"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5 text-textPrimary" /> : <Menu className="w-5 h-5 text-textPrimary" />}
            </button>

            <Link to="/search" className="inline-flex items-center gap-2 font-black text-textPrimary tracking-tight text-lg">
              <LogoMark size={40} className="shrink-0" />
              <span>Medeasy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 ml-4">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                About us
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                Search medicine
              </NavLink>
              <NavLink
                to="/recent"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                Recent history
              </NavLink>

              <div ref={foldersMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) setIsAuthModalOpen(true);
                    else setIsFoldersMenuOpen((v) => !v);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-textSecondary hover:bg-white/70 hover:text-textPrimary transition-colors"
                >
                  Saved folders
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div
                  className={`absolute left-0 mt-2 w-72 rounded-2xl border border-accent1/20 bg-white/90 backdrop-blur-md shadow-xl p-2 transition-all origin-top-left ${
                    isFoldersMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                    >
                      Sign in to view folders
                    </button>
                  ) : folders.length === 0 ? (
                    <div className="px-3 py-3 text-sm font-bold text-textSecondary">No folders yet.</div>
                  ) : (
                    <div className="max-h-72 overflow-auto">
                      {folders.map((f) => (
                        <Link
                          key={f.id}
                          to="/saved"
                          state={{ openFolderId: f.id }}
                          onClick={() => setIsFoldersMenuOpen(false)}
                          className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                        >
                          <span className="truncate">{f.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {user && folders.length > 0 && (
                    <>
                      <div className="my-2 border-t border-accent1/15" />
                      <Link
                        to="/saved"
                        onClick={() => setIsFoldersMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                      >
                        <Bookmark className="w-4 h-4 text-primary" />
                        All folders
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 hover:bg-white transition-colors border border-white/60 shadow-sm"
                  aria-label="Open profile menu"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-black text-textPrimary">{user.name}</span>
                    <span className="text-[10px] font-bold text-textSecondary">Profile</span>
                  </div>
                  <ChevronDown className="hidden sm:block w-4 h-4 text-textSecondary" />
                </button>

                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border border-accent1/20 bg-white/90 backdrop-blur-md shadow-xl p-2 transition-all origin-top-right ${
                    isProfileMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <Link
                    to="/profile/contact"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Contact details
                  </Link>
                  <Link
                    to="/profile/reminders"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                  >
                    <Bell className="w-4 h-4 text-primary" />
                    Reminders
                  </Link>
                  <Link
                    to="/profile/history"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textPrimary"
                  >
                    <History className="w-4 h-4 text-primary" />
                    Medicine history
                  </Link>

                  <div className="my-2 border-t border-accent1/15" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors font-bold text-sm text-textSecondary hover:text-accent2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 hover:bg-white transition-colors border border-white/60 shadow-sm"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-black text-textPrimary">Profile</span>
                    <span className="text-[10px] font-bold text-textSecondary">Sign in</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {isMobileNavOpen && (
          <div className="md:hidden border-t border-accent1/20 bg-white/70 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 grid gap-2">
              <NavLink
                to="/about"
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                <span className="inline-flex items-center gap-3">
                  <Info className="w-4 h-4 text-primary" />
                  About us
                </span>
              </NavLink>
              <NavLink
                to="/search"
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                <span className="inline-flex items-center gap-3">
                  <Search className="w-4 h-4 text-primary" />
                  Search medicine
                </span>
              </NavLink>
              <NavLink
                to="/recent"
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                <span className="inline-flex items-center gap-3">
                  <History className="w-4 h-4 text-primary" />
                  Recent history
                </span>
              </NavLink>
              <NavLink
                to="/profile/contact"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  if (!user) setIsAuthModalOpen(true);
                }}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                <span className="inline-flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" />
                  Profile
                </span>
              </NavLink>

              <NavLink
                to="/saved"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  if (!user) setIsAuthModalOpen(true);
                }}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-primary text-white' : 'text-textSecondary hover:bg-white/70 hover:text-textPrimary'}`
                }
              >
                <span className="inline-flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-primary" />
                  Saved folders
                </span>
              </NavLink>
            </div>
          </div>
        )}
        </header>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main className="relative overflow-hidden">
        {/* Artistic Background Image */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] mix-blend-multiply"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1532187863486-abf9d3971207?auto=format&fit=crop&q=80&w=2070')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.1) brightness(1.05)',
          }}
        />

        {/* Soft Decorative Blurs */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="relative z-10 p-4 sm:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>

        <footer className="relative z-10 border-t border-accent1/20 bg-white/50 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 font-black text-textPrimary tracking-tight">
                  <LogoMark size={26} />
                  <span>Medeasy</span>
                </div>
                <div className="text-xs text-textSecondary mt-1">Informative purposes only.</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">
                  Contact us
                </Link>
                <Link to="/sources" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">
                  Data sources
                </Link>
                <Link to="/security" className="text-sm font-bold text-textSecondary hover:text-primary transition-colors">
                  Data security
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {showGoTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-opacity-90 active:scale-[0.98] transition-all"
        >
          Go to the top
        </button>
      )}
    </div>
  );
};

export default Layout;
