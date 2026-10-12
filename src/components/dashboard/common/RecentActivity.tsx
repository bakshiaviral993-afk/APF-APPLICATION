import React from 'react';
import { Clock, CheckCircle2, FileText, Send, UserCheck, MessageSquare } from 'lucide-react';

export interface ActivityEvent {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  timestamp: string;
  type?: 'status' | 'approval' | 'query' | 'report' | 'dispatch';
}

interface RecentActivityProps {
  events: ActivityEvent[];
  title?: string;
  maxItems?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  events,
  title = 'Recent Portfolio Activity',
  maxItems = 6,
}) => {
  const visible = events.slice(0, maxItems);

  const getIcon = (type?: ActivityEvent['type']) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'query':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600" />;
      case 'dispatch':
        return <Send className="w-3.5 h-3.5 text-purple-600" />;
      case 'report':
        return <FileText className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] text-slate-400">Audit Stream</span>
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">No recent activity recorded today.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded-full bg-slate-100 mt-0.5 shrink-0">
                {getIcon(ev.type)}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="text-slate-800">
                  <strong className="font-bold text-slate-900">{ev.actor}</strong>{' '}
                  <span className="text-slate-500 text-[11px]">({ev.actorRole})</span>{' '}
                  <span className="font-medium">{ev.action}</span>{' '}
                  <strong className="font-semibold text-slate-900">{ev.target}</strong>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
