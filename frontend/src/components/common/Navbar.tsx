import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, LogOut, ShieldCheck, User as UserIcon, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedDepartment, onDepartmentChange }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              PCCOE<span className="text-brand-400">Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 font-semibold uppercase">
                Autonomous
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium -mt-0.5">
              Pimpri Chinchwad College of Engineering, Pune
            </div>
          </div>
        </Link>
      </div>

      {/* Center / Department Filter */}
      {onDepartmentChange && (
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-400 font-medium">Department:</span>
          <select
            value={selectedDepartment || 'All Departments'}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="All Departments" className="bg-slate-900 text-white">All Departments</option>
            <option value="Computer Engineering" className="bg-slate-900 text-white">Computer Engineering</option>
            <option value="Information Technology" className="bg-slate-900 text-white">Information Technology</option>
            <option value="Artificial Intelligence & Machine Learning" className="bg-slate-900 text-white">AI & Machine Learning</option>
            <option value="Electronics & Telecommunication" className="bg-slate-900 text-white">Electronics & Telecommunication</option>
            <option value="Mechanical Engineering" className="bg-slate-900 text-white">Mechanical Engineering</option>
            <option value="Civil Engineering" className="bg-slate-900 text-white">Civil Engineering</option>
            <option value="Applied Sciences & Humanities (First Year)" className="bg-slate-900 text-white">First Year Engineering (FE)</option>
            <option value="Master of Computer Applications (MCA)" className="bg-slate-900 text-white">MCA</option>
          </select>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/chat"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
            >
              Chat Assistant
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize flex items-center justify-end gap-1">
                  {user.role === 'admin' ? (
                    <span className="text-amber-400 font-bold">Admin</span>
                  ) : (
                    <span>PCCOE Student</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-brand-600/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
