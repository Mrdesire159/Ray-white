import React, { useEffect } from 'react';
import { Mail, Inbox, X, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { useRequests } from '../context/RequestContext';

interface VisitorNotificationToastProps {
  onOpenInbox: () => void;
}

export const VisitorNotificationToast: React.FC<VisitorNotificationToastProps> = ({ onOpenInbox }) => {
  const { latestVisitorNotification, dismissVisitorNotification, selectInboxRequest } = useRequests();

  // Auto-dismiss after 12 seconds if not clicked
  useEffect(() => {
    if (!latestVisitorNotification) return;
    const timer = setTimeout(() => {
      dismissVisitorNotification();
    }, 12000);
    return () => clearTimeout(timer);
  }, [latestVisitorNotification, dismissVisitorNotification]);

  if (!latestVisitorNotification) return null;

  const handleOpen = () => {
    selectInboxRequest(latestVisitorNotification.requestId);
    dismissVisitorNotification();
    onOpenInbox();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-4 sm:right-6 sm:bottom-6 z-50 max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-neutral-950/95 backdrop-blur-md text-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-blue-500/80 ring-4 ring-blue-500/20 relative overflow-hidden">
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-blue-500 to-[#FFD200]" />

        {/* Close Button */}
        <button
          onClick={dismissVisitorNotification}
          className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-neutral-800"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Animated Notification Bell/Mail Badge */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Inbox className="w-5 h-5 text-white animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD200] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFD200]" />
            </span>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD200] flex items-center gap-1">
                <Bell className="w-3 h-3 fill-[#FFD200]" />
                <span>New Reply in Inbox</span>
              </span>
              <span className="text-neutral-500 text-[10px]">• Just now</span>
            </div>

            <h4 className="text-sm font-black text-white leading-tight truncate">
              {latestVisitorNotification.senderName} ({latestVisitorNotification.senderEmail})
            </h4>

            <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
              "{latestVisitorNotification.message}"
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpen}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400 active:scale-95"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Open Inbox to Read</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={dismissVisitorNotification}
                className="px-2.5 py-1.5 text-neutral-400 hover:text-neutral-200 text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
