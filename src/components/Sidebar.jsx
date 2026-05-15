import { Link, useLocation } from 'react-router-dom';
import { Info, Search, Database, Mail, Pill, History, Bookmark, ShieldCheck, X } from 'lucide-react';

const Sidebar = ({ isMobileOpen = false, onMobileClose = () => {} }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Info, label: 'About us', path: '/about' },
    { icon: Search, label: 'Search for a drug', path: '/search' },
    { icon: History, label: 'Recent searches', path: '/recent' },
    { icon: Bookmark, label: 'Saved medicines', path: '/saved' },
    { icon: Database, label: 'Data sources', path: '/sources' },
    { icon: ShieldCheck, label: 'Data security', path: '/security' },
    { icon: Mail, label: 'Contact us', path: '/contact' },
  ];

  const NavLinks = ({ onItemClick, collapseAtLg }) => (
    <nav className="flex-1 space-y-2">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center rounded-xl transition-all duration-300 group
              ${collapseAtLg ? 'justify-center xl:justify-start px-3 xl:px-4 gap-0 xl:gap-4' : 'gap-4 px-4'}
              py-3
              ${isActive 
                ? 'bg-primary text-white font-semibold shadow-sm' 
                : 'text-textSecondary hover:bg-background hover:text-textPrimary'
              }`}
          >
            <item.icon
              className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 
                ${isActive ? 'text-white' : 'text-textSecondary group-hover:text-primary'}`}
            />
            <span className={`${collapseAtLg ? 'hidden xl:inline text-sm' : 'text-sm'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-[200] ${isMobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onMobileClose}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r border-accent1/30 flex flex-col p-6 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-textPrimary">Medeasy</span>
            </div>
            <button
              type="button"
              onClick={onMobileClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-background transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-textSecondary" />
            </button>
          </div>

          <NavLinks onItemClick={onMobileClose} collapseAtLg={false} />

          <div className="mt-auto p-4 bg-background rounded-xl">
            <p className="text-xs text-textSecondary font-medium">Your Health Partner</p>
            <p className="text-[10px] text-textSecondary/60 mt-1">Version 0.0.1</p>
          </div>
        </div>
      </div>

      {/* Desktop sidebar (collapsed on lg, expanded on xl) */}
      <aside className="hidden lg:flex h-screen bg-white border-r border-accent1/30 flex-col fixed left-0 top-0 z-50 w-20 xl:w-64 p-4 xl:p-6 transition-[width,padding] duration-300">
        <div className="flex items-center gap-3 mb-10 px-2 justify-center xl:justify-start">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <span className="hidden xl:block text-xl font-bold text-textPrimary">Medeasy</span>
        </div>

        <NavLinks onItemClick={() => {}} collapseAtLg={true} />

        <div className="mt-auto p-3 xl:p-4 bg-background rounded-xl">
          <p className="hidden xl:block text-xs text-textSecondary font-medium">Your Health Partner</p>
          <p className="hidden xl:block text-[10px] text-textSecondary/60 mt-1">Version 0.0.1</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
