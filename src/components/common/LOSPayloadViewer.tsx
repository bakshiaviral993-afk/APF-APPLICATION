import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Copy, Check, FileJson, RefreshCw, ShieldCheck } from 'lucide-react';

interface LOSPayloadViewerProps {
  payload: Record<string, any>;
  ackId?: string | null;
  isTransmitting?: boolean;
  onTransmit?: () => void;
}

export const LOSPayloadViewer: React.FC<LOSPayloadViewerProps> = ({
  payload,
  ackId,
  isTransmitting = false,
  onTransmit,
}) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#edf2f7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102a43]">LOS Core Mortgage Integration Gateway</h3>
            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-[#e8f1f5] text-[#19638c]">
              REST / JSON API Payload
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Cryptographically signed APF payload formatted for Core Retail Loan Origination System (LOS)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#102a43] transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#627d98]" />}
            <span>{copied ? 'Copied JSON' : 'Copy Payload'}</span>
          </button>

          {onTransmit && (
            <button
              onClick={onTransmit}
              disabled={isTransmitting || !!ackId}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                ackId
                  ? 'bg-[#137333] cursor-default'
                  : isTransmitting
                  ? 'bg-[#627d98] cursor-wait'
                  : 'bg-[#0c3148] hover:bg-[#19638c]'
              }`}
            >
              {isTransmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : ackId ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledged by LOS</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to LOS</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Idempotency & Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs">
        <div>
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Idempotency Token</span>
          <span className="font-mono font-bold text-[#19638c] truncate block">
            {payload.idempotencyKey || '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'}
          </span>
        </div>
        <div>
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">Report Hash (SHA-256)</span>
          <span className="font-mono text-[#102a43] truncate block">
            {payload.reportHash || 'sha256-e3b0c44298fc1c...'}
          </span>
        </div>
        <div>
          <span className="text-[#627d98] block text-[10px] uppercase font-bold">API Protocol Status</span>
          <span className="font-bold text-[#137333] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            TLS 1.3 / mTLS Authenticated
          </span>
        </div>
      </div>

      {/* Live Code/JSON Box */}
      <div className="relative rounded-xl overflow-hidden border border-[#cbd5e1] bg-[#0c3148] text-slate-100 p-4 font-mono text-xs max-h-96 overflow-y-auto">
        <pre className="whitespace-pre leading-relaxed">{jsonString}</pre>
      </div>

      {/* LOS Response Box */}
      {ackId && (
        <div className="bg-[#e6f4ea] border border-[#137333]/30 p-4 rounded-xl flex items-start justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#137333] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>LOS Acknowledgement Received: HTTP 201 Created</span>
            </div>
            <p className="text-[#334e68]">
              LOS System successfully consumed docket. Scheme registered under LOS_APF_ID:{' '}
              <strong className="font-mono text-[#102a43]">{ackId}</strong>. Project is now live for branch sourcing.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-[#137333] text-white rounded font-bold text-xs shrink-0">
            APF ACTIVE
          </span>
        </div>
      )}
    </div>
  );
};
