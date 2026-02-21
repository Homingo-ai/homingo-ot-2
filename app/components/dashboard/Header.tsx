'use client';

import React from 'react';
import { Search, Bell, User, PlusCircle, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';

interface HeaderProps {
    user: { name: string; role: string } | null;
    onOpenWizard: () => void;
    onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenWizard, onSearch }) => {
    return (
        <header className="min-h-16 md:h-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 sticky top-0 z-[100] border-b border-[var(--glass-border)] bg-white">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <img
                    src="/homingo-logo.png"
                    alt="Homingo"
                    className="h-9 sm:h-[45px] cursor-pointer"
                />
            </div>

            <div className="flex-1 min-w-0 order-last md:order-none w-full md:w-auto md:max-w-[500px] md:mx-4 lg:mx-10">
                <div className="relative">
                    <Search size={18} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-text-dim shrink-0" />
                    <input
                        type="text"
                        placeholder="Search address, ID or client..."
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="w-full py-2.5 md:py-3 px-3 md:px-4 pl-10 md:pl-12 rounded-lg md:rounded-xl text-text-main text-sm outline-none border border-gray-200 bg-white/80 backdrop-blur"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
                <button
                    onClick={onOpenWizard}
                    className="py-2 px-3 sm:px-4 rounded-lg md:rounded-[10px] flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all border border-gray-200 cursor-pointer bg-white/80 backdrop-blur hover:border-primary hover:bg-primary-light"
                >
                    <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" />
                    <span className="hidden sm:inline">New Assessment</span>
                    <span className="sm:hidden">New</span>
                </button>
                <Bell size={18} className="sm:w-5 sm:h-5 text-slate-400 cursor-pointer shrink-0" />
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden lg:block">
                        <div className="text-[13px] font-extrabold text-slate-900 truncate max-w-[120px]">{user?.name || 'User'}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{user?.role || 'OT'}</div>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg md:rounded-xl bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-extrabold cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.3)] shrink-0">
                        {user?.name ? user.name.charAt(0) : <User size={18} className="sm:w-5 sm:h-5" />}
                    </div>
                    <button
                        onClick={() => signOut()}
                        title="Sign Out"
                        className="bg-transparent border-none cursor-pointer text-slate-400 flex items-center p-1 shrink-0"
                    >
                        <LogOut size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
