import React, { useState, useEffect } from 'react';
import { UnitMaster, TowerMaster, UserAccount } from '../../types/apfTransaction';
import { masterStore } from '../../services/masterStore';
import { X, Grid, AlertTriangle, CheckCircle2, Save, Layers, Sparkles } from 'lucide-react';

interface BulkUnitGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  tower: TowerMaster;
  onGenerated: (units: UnitMaster[]) => void;
}

export const BulkUnitGenerateModal: React.FC<BulkUnitGenerateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tower,
  onGenerated,
}) => {
  const [startFloor, setStartFloor] = useState(1);
  const [endFloor, setEndFloor] = useState(tower.floorsSanctioned || 18);
  const [unitsPerFloor, setUnitsPerFloor] = useState(tower.unitsPerFloor || 4);
  const [prefix, setPrefix] = useState(tower.wing ? `${tower.wing.replace('Wing ', '')}-` : 'T-');
  const [typology, setTypology] = useState<'1 BHK' | '2 BHK' | '3 BHK' | '4 BHK'>('2 BHK');
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState(720);
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState(936);
  const [agreementValueLakh, setAgreementValueLakh] = useState(68.5);

  // Generated preview
  const [previewUnits, setPreviewUnits] = useState<Partial<UnitMaster>[]>([]);

  useEffect(() => {
    generatePreview();
  }, [startFloor, endFloor, unitsPerFloor, prefix, typology, carpetAreaSqFt, builtUpAreaSqFt, agreementValueLakh]);

  const generatePreview = () => {
    const list: Partial<UnitMaster>[] = [];
    const sanctionedMax = tower.floorsSanctioned || 20;

    for (let floor = startFloor; floor <= endFloor; floor++) {
      const isFloorSanctioned = floor <= sanctionedMax;
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumber = `${prefix}${floor}${u.toString().padStart(2, '0')}`;
        list.push({
          unitNumber,
          floorNumber: floor,
          wing: tower.wing || 'Wing A',
          configuration: typology,
          carpetAreaSqFt: Number(carpetAreaSqFt),
          builtUpAreaSqFt: Number(builtUpAreaSqFt),
          saleableAreaSqFt: Math.round(Number(carpetAreaSqFt) * 1.45),
          agreementValueLakh: Number(agreementValueLakh),
          status: 'Available',
          apfDisbursementStatus: isFloorSanctioned ? 'Eligible' : 'Ineligible',
          floorSanctioned: isFloorSanctioned,
          violationFlag: !isFloorSanctioned,
          violationRemarks: !isFloorSanctioned ? `Sanctioned up to Floor ${sanctionedMax}. Floor ${floor} unsanctioned.` : undefined,
        });
      }
    }
    setPreviewUnits(list);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (previewUnits.length === 0) return;
    const created = masterStore.bulkGenerateUnits(tower.id, previewUnits, currentUser);
    onGenerated(created);
    onClose();
  };

  const hasViolations = previewUnits.some((u) => u.violationFlag);

  return (
    <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0c3148] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-900/60 text-[#8bb3cb]">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Bulk Unit Generator & Sanction Validator</h3>
              <p className="text-xs text-[#8bb3cb]">
                Tower: <span className="font-semibold text-white">{tower.towerName}</span> • Sanctioned Slabs:{' '}
                <span className="font-bold text-amber-300">{tower.floorsSanctioned} Floors</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generator Controls */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Floor</label>
              <input
                type="number"
                min={1}
                value={startFloor}
                onChange={(e) => setStartFloor(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Floor</label>
              <input
                type="number"
                value={endFloor}
                onChange={(e) => setEndFloor(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Units per Floor</label>
              <input
                type="number"
                min={1}
                max={12}
                value={unitsPerFloor}
                onChange={(e) => setUnitsPerFloor(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="E-"
                className="w-full p-2 rounded border border-slate-300 bg-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Typology</label>
              <select
                value={typology}
                onChange={(e: any) => setTypology(e.target.value)}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Carpet (SqFt)</label>
              <input
                type="number"
                value={carpetAreaSqFt}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCarpetAreaSqFt(val);
                  setBuiltUpAreaSqFt(Math.round(val * 1.3));
                }}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Built-Up (SqFt)</label>
              <input
                type="number"
                value={builtUpAreaSqFt}
                onChange={(e) => setBuiltUpAreaSqFt(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Agreement Val (₹ L)</label>
              <input
                type="number"
                step="0.5"
                value={agreementValueLakh}
                onChange={(e) => setAgreementValueLakh(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
              />
            </div>
          </div>

          {hasViolations && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">UNSANCTIONED FLOOR WARNING DETECTED:</span>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  The tower sanctioned ceiling is Floor {tower.floorsSanctioned}. Generated units above Floor{' '}
                  {tower.floorsSanctioned} are automatically tagged as{' '}
                  <span className="font-bold underline">INELIGIBLE — DISBURSEMENT BLOCKED</span> to protect bank risk.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-700">
              Live Preview: Generating <span className="text-sky-700">{previewUnits.length} Units</span>
            </span>
            <span className="text-slate-500">
              Floor {startFloor} through {endFloor}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Unit No</th>
                  <th className="p-2.5">Floor</th>
                  <th className="p-2.5">Typology</th>
                  <th className="p-2.5">Carpet (SqFt)</th>
                  <th className="p-2.5">Agreement Val</th>
                  <th className="p-2.5">Sanctioned</th>
                  <th className="p-2.5">APF Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewUnits.slice(0, 40).map((u, i) => (
                  <tr key={i} className={u.violationFlag ? 'bg-rose-50/70 text-rose-900' : 'hover:bg-slate-50'}>
                    <td className="p-2.5 font-bold font-mono">{u.unitNumber}</td>
                    <td className="p-2.5">Floor {u.floorNumber}</td>
                    <td className="p-2.5">{u.configuration}</td>
                    <td className="p-2.5 font-mono">{u.carpetAreaSqFt}</td>
                    <td className="p-2.5 font-semibold">₹{u.agreementValueLakh} L</td>
                    <td className="p-2.5">
                      {u.floorSanctioned ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          YES
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          VIOLATION
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {u.apfDisbursementStatus === 'Eligible' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Ineligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewUnits.length > 40 && (
              <div className="p-2 bg-slate-50 text-center text-slate-500 text-[11px] border-t border-slate-200">
                ...and {previewUnits.length - 40} more units
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Total to save: <span className="font-bold text-slate-900">{previewUnits.length} Units</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#0c3148] hover:bg-[#15496b] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Generate & Save {previewUnits.length} Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
