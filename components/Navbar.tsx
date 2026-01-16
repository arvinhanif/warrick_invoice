
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Account', path: '/customers' },
    { label: 'Product', path: '/products' },
    { label: 'Settlement', path: '/settlement' },
    { label: 'Setting', path: '/settings' },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('warrick_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}

    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, 5);
      localStorage.setItem('warrick_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveSearch(searchQuery);
      setShowHistory(false);
      inputRef.current?.blur();
      navigate('/dashboard');
    }
    if (e.key === 'Escape') {
      setShowHistory(false);
      inputRef.current?.blur();
    }
  };

  const handleRecentClick = (item: string) => {
    setSearchQuery(item);
    saveSearch(item);
    setShowHistory(false);
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 pt-10 pb-6 px-6 no-print max-w-[900px] mx-auto w-full">
      <div className="clay-card p-6 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center justify-center space-x-3 overflow-x-auto pb-1 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `tactile-btn whitespace-nowrap px-8 transition-all duration-200 !shadow-none ${
                    isActive 
                      ? 'bg-[#1A1A1A] text-white !shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] border-transparent' 
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center relative" ref={historyRef}>
          <div className="flex-1 sunken-well flex items-center p-1 pl-6 h-[54px] border border-black/5 dark:border-white/5 bg-[#E3F2FD] dark:bg-[#1E293B]">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search database..." 
              className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button 
              onClick={() => { saveSearch(searchQuery); setShowHistory(false); navigate('/dashboard'); }}
              className="w-11 h-11 rounded-full tactile-btn !p-0 flex items-center justify-center ml-2 border-none"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {showHistory && recentSearches.length > 0 && (
            <div className="absolute top-[60px] left-0 right-0 z-10 clay-card p-2 shadow-2xl border border-black/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Recent Searches</p>
              {recentSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(item)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item}
                </button>
              ))}
              <button 
                onClick={() => { setRecentSearches([]); localStorage.removeItem('warrick_recent_searches'); }}
                className="w-full text-center py-2 text-[10px] font-black text-red-400 uppercase tracking-widest hover:opacity-70 mt-1"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
