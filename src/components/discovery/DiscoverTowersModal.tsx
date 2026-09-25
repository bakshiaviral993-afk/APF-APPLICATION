import React, { useState, useEffect } from 'react';
import {
  Layers,
  Building,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowRight,
  Database,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react';
import { DiscoveredPhaseData, DiscoveredTowerData, FetchJob } from '../../types/discoveryTypes';
import { ProjectMaster, TowerMaster, UserAccount } from '../../types/apfTransaction';
import { discoveryService } from '../../services/discoveryService';
import { masterStore } from '../../services/masterStore';
import { canAccessExposureReport } from '../../utils/exposurePermissions';

interface DiscoverTowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectMaster;
  currentUser: UserAccount;
  onTowersCommitted: (savedTowers: TowerMaster[], startApf?: boolean) => void;
  onNavigateToExposure?: (builderId: string) => void;
}

export const DiscoverTowersModal: React.FC<DiscoverTowersModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onTowersCommitted,
  onNavigateToExposure,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [currentJob, setCurrentJob] = useState<FetchJob | null>(null);
  const [phases, setPhases] = useState<DiscoveredPhaseData[]>([]);
  const [towers, setTowers] = useState<DiscoveredTowerData[]>([]);
  const [generatedUnitsCount, setGeneratedUnitsCount] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && project) {
      handleFetchTowers();
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleFetchTowers = async () => {
    setIsFetching(true);
    setPhases([]);
    setTowers([]);
    setGeneratedUnitsCount(null);

    try {
      const result = await discoveryService.discoverTowersForProject(
        project.id,
        project.projectName,
        (job) => setCurrentJob({ ...job })
      );
      setPhases(result.phases);
      setTowers(result.towers);
    } catch (err) {
      console.error('Tower discovery error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleGeneratePocUnits = () => {
    // Generate POC inventory for each tower
    let totalGenerated = 0;
    towers.forEach((t) => {
      // Add units marked SIMULATED_POC_UNIT
      const sampleCount = Math.min(t.totalUnits || 40, 24);
      for (let floor = 1; floor <= 4; floor++) {
        for (let unitIdx = 1; unitIdx <= 6; unitIdx++) {
          const unitNumber = `${floor}0${unitIdx}`;
          masterStore.addUnit(
            {
              id: `UNT-${t.towerId}-${unitNumber}`,
              towerId: t.towerId,
              unitNumber,
              floorNumber: floor,
              configuration: unitIdx % 2 === 0 ? '3 BHK' : '2 BHK',
              typology: unitIdx % 2 === 0 ? '3 BHK' : '2 BHK',
              carpetAreaSqFt: unitIdx % 2 === 0 ? 1120 : 840,
              agreementValueLakh: unitIdx % 2 === 0 ? 95 : 72,
              status: unitIdx === 1 ? 'Funded' : unitIdx === 2 ? 'Booked' : 'Available',
              mortgageStatus: unitIdx === 1 ? 'Mortgaged to Proval Bank' : 'Clean',
              apfDisbursementStatus: 'Eligible',
              isSimulatedPocUnit: true,
              floorSanctioned: true,
              isActive: true,
              approvalStatus: 'APPROVED',
              version: 1,
            },
            currentUser
          );
          totalGenerated++;
        }
      }
    });

    setGeneratedUnitsCount(totalGenerated);
  };

  const handleSaveTowers = (startApf: boolean = false) => {
    const saved = discoveryService.commitDiscoveredTowers(towers, project.id, currentUser);
    onTowersCommitted(saved, startApf);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Project Phase & Tower Discovery
                </h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono">
                  {project.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Project: <strong className="text-slate-200">{project.projectName}</strong> (RERA: {project.reraNumbers?.join(', ')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Action and status bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {isFetching ? 'Inspecting MahaRERA Forms & Building Drawings...' : `Discovered ${towers.length} Sanctioned Towers across ${phases.length} Phases`}
                </div>
                <div className="text-xs text-slate-500">
                  Evidence strictly populated from approved Municipal Drawings & MahaRERA Quarterly Filings
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleGeneratePocUnits}
                disabled={towers.length === 0 || generatedUnitsCount !== null}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-purple-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {generatedUnitsCount !== null
                    ? `✓ ${generatedUnitsCount} POC UNITS GENERATED`
                    : 'GENERATE POC UNITS'}
                </span>
              </button>

              <button
                onClick={handleFetchTowers}
                disabled={isFetching}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>REFETCH</span>
              </button>
            </div>
          </div>

          {generatedUnitsCount !== null && (
            <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Generated <strong>{generatedUnitsCount} POC units</strong> marked with{' '}
                <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold">
                  SIMULATED_POC_UNIT = true
                </code>{' '}
                for live APF unit-level mortgage verification and valuer inspection testing.
              </span>
            </div>
          )}

          {/* Towers Table */}
          {towers.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Sanctioned Wings / Towers</span>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded font-semibold">
                    {towers.length} Discovered
                  </span>
                </h3>
                <span className="text-xs text-slate-500">
                  Only evidence-backed structural fields populated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">Tower / Wing</th>
                      <th className="py-2.5 px-4 text-center">Floors</th>
                      <th className="py-2.5 px-4 text-center">Units</th>
                      <th className="py-2.5 px-4">Configuration</th>
                      <th className="py-2.5 px-4">Construction Progress</th>
                      <th className="py-2.5 px-4">OC Status</th>
                      <th className="py-2.5 px-4">Possession / Expiry</th>
                      <th className="py-2.5 px-4">Evidence Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {towers.map((tower) => (
                      <tr key={tower.towerId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <span>{tower.towerName}</span>
                            {tower.isPartiallyAvailable && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                                PARTIALLY AVAILABLE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-normal text-slate-400 font-mono">
                            ID: {tower.towerId}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <span className="font-bold text-slate-800">{tower.floorsConstructed}</span>
                          <span className="text-slate-400"> / {tower.floorsSanctioned}</span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                          {tower.totalUnits}
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {tower.configuration}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${tower.physicalProgressPct}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-800">
                              {tower.physicalProgressPct}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {tower.constructionStage}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                            tower.ocStatus === 'Full OC Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tower.ocStatus === 'Part OC Received'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tower.ocStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {tower.expectedCompletion}
                        </td>

                        <td className="py-3 px-4 text-[10px] text-slate-500 max-w-[200px] truncate" title={tower.sourceRef}>
                          {tower.sourceRef}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            CLOSE
          </button>

          <div className="flex items-center space-x-3">
            {onNavigateToExposure && canAccessExposureReport(currentUser?.role) && (
              <button
                onClick={() => {
                  handleSaveTowers(false);
                  onNavigateToExposure(project.builderId);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <span>SAVE & OPEN EXPOSURE 360</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => handleSaveTowers(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <span>SAVE & START APF TRANSACTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
