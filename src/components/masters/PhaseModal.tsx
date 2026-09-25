import React, { useState, useEffect } from 'react';
import { PhaseMaster, UserAccount, ProjectMaster } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { X, Layers, Save } from 'lucide-react';

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  projectId: string;
  editPhase?: PhaseMaster | null;
  onSaved: (phase: PhaseMaster) => void;
}

export const PhaseModal: React.FC<PhaseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  projectId,
  editPhase,
  onSaved,
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('Phase 1');
  const [reraNumber, setReraNumber] = useState('');
  const [sanctionDate, setSanctionDate] = useState(new Date().toISOString().substring(0, 10));
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2028-12-31');
  const [phaseStatus, setPhaseStatus] = useState<'Planning' | 'Under Construction' | 'Nearing Completion' | 'Ready with OC'>('Under Construction');
  const [phaseAreaSqFt, setPhaseAreaSqFt] = useState(250000);
  const [numberOfTowers, setNumberOfTowers] = useState(2);
  const [numberOfUnits, setNumberOfUnits] = useState(120);
  const [currentProgressPct, setCurrentProgressPct] = useState(65);
  const [remarks, setRemarks] = useState('');
  const [editReason, setEditReason] = useState('');

  const project = masterStore.getProjectById(projectId);

  useEffect(() => {
    if (editPhase) {
      setPhaseName(editPhase.phaseName);
      setPhaseNumber(editPhase.phaseNumber || 'Phase 1');
      setReraNumber(editPhase.reraNumber);
      setSanctionDate(editPhase.sanctionDate);
      setExpectedCompletionDate(editPhase.expectedCompletionDate);
      setPhaseStatus(editPhase.phaseStatus || 'Under Construction');
      setPhaseAreaSqFt(editPhase.phaseAreaSqFt || 250000);
      setNumberOfTowers(editPhase.numberOfTowers || 2);
      setNumberOfUnits(editPhase.numberOfUnits || 120);
      setCurrentProgressPct(editPhase.currentProgressPct || 65);
      setRemarks(editPhase.remarks || '');
      setEditReason('Phase status and progress milestone update');
    } else {
      setPhaseName('Sector B — Phase 2');
      setPhaseNumber('Phase 2');
      setReraNumber(project?.reraNumbers[0] || 'P521000' + Math.floor(10000 + Math.random() * 90000));
      setRemarks('RCC civil frame construction underway');
    }
  }, [editPhase, isOpen, project]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseName.trim() || !reraNumber.trim()) {
      alert('Please fill Phase Name and MahaRERA Number.');
      return;
    }

    const payload: Partial<PhaseMaster> = {
      projectId,
      phaseName: phaseName.trim(),
      phaseNumber,
      reraNumber: reraNumber.trim(),
      sanctionDate,
      expectedCompletionDate,
      phaseStatus,
      phaseAreaSqFt: Number(phaseAreaSqFt) || 200000,
      numberOfTowers: Number(numberOfTowers) || 1,
      numberOfUnits: Number(numberOfUnits) || 80,
      currentProgressPct: Number(currentProgressPct) || 50,
      remarks,
    };

    if (editPhase) {
      const saved = masterStore.updatePhase(
        editPhase.id,
        payload,
        currentUser,
        editReason || 'Updated phase master parameters'
      );
      onSaved(saved);
    } else {
      const created = masterStore.addPhase(payload, currentUser);
      onSaved(created);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-900/60 text-[#8bb3cb]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">{editPhase ? 'Edit Phase' : 'Add Phase to Project'}</h3>
              <p className="text-xs text-[#8bb3cb]">Parent Project: {project?.projectName || projectId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phase Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="e.g. Phase 2 (Tower D & E)"
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phase Identifier / Number</label>
              <input
                type="text"
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(e.target.value)}
                placeholder="Phase 2"
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                MahaRERA Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reraNumber}
                onChange={(e) => setReraNumber(e.target.value.toUpperCase())}
                placeholder="P52100022199"
                className="w-full p-2 rounded-lg border border-slate-300 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phase Status</label>
              <select
                value={phaseStatus}
                onChange={(e: any) => setPhaseStatus(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Planning">Planning</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Nearing Completion">Nearing Completion</option>
                <option value="Ready with OC">Ready with OC</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Towers in Phase</label>
              <input
                type="number"
                value={numberOfTowers}
                onChange={(e) => setNumberOfTowers(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Units in Phase</label>
              <input
                type="number"
                value={numberOfUnits}
                onChange={(e) => setNumberOfUnits(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Progress %</label>
              <input
                type="number"
                value={currentProgressPct}
                onChange={(e) => setCurrentProgressPct(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 font-bold text-sky-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sanction Date</label>
              <input
                type="date"
                value={sanctionDate}
                onChange={(e) => setSanctionDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Completion Date</label>
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks / Progress Notes</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Slabs cast up to 14th floor"
              className="w-full p-2 rounded-lg border border-slate-300"
            />
          </div>

          {editPhase && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reason for Update <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="State reason for audit log..."
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0c3148] hover:bg-[#15496b] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {editPhase ? 'Save Changes' : 'Create Phase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
