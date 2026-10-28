import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRequests } from '../../context/RequestContext';

interface AdminPasswordGateProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({
  onSuccess,
  onBackToSite,
}) => {
  const { loginAdmin } = useRequests();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the administrative master passcode.');
      return;
    }

    const isSuccess = loginAdmin(password);
    if (isSuccess) {
      setError(null);
      onSuccess();
    } else {
      setError('Invalid security passcode. Access denied.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-neutral-950 text-white">
      <div
        className={`w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-8 transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-black border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restricted Staff Operations</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal Access</h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            This administrative area is hidden from the public. Please enter the master access passcode to unlock requests and approvals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wider">
              Staff Passcode
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className="w-full pl-4 pr-11 py-3.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Authenticate &amp; Enter</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onBackToSite}
            className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center text-[10px] text-neutral-500">
          Ray White Prestige Real Estate • Internal Operations Protocol
        </div>
      </div>
    </div>
  );
};
