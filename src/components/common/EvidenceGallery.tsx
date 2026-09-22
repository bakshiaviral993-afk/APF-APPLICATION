import React, { useState } from 'react';
import { Camera, MapPin, CheckCircle2, ShieldCheck, Clock, Eye, AlertCircle } from 'lucide-react';

export interface GeotaggedEvidenceItem {
  id: string;
  category: string;
  title: string;
  timestamp: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  geofenceValid: boolean;
  capturedBy: string;
  deviceInfo: string;
  thumbnailUrl?: string;
  description: string;
}

interface EvidenceGalleryProps {
  evidenceList?: GeotaggedEvidenceItem[];
  onSelectEvidence?: (item: GeotaggedEvidenceItem) => void;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({
  evidenceList,
  onSelectEvidence,
}) => {
  const [selectedItem, setSelectedItem] = useState<GeotaggedEvidenceItem | null>(null);

  const defaultEvidence: GeotaggedEvidenceItem[] = evidenceList || [
    {
      id: 'EV-01',
      category: 'Entrance & Boundary',
      title: 'Grand Entrance Gate & Approach Road',
      timestamp: '2026-09-19 10:14:22 IST',
      lat: 18.6186,
      lng: 73.7149,
      accuracyMeters: 2.8,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'Clear 30-meter wide DP access road connected directly to Marunji-Hinjawadi link road. Paved asphalt, operational streetlights.',
    },
    {
      id: 'EV-02',
      category: 'RERA Compliance',
      title: 'MahaRERA Project Display Board',
      timestamp: '2026-09-19 10:18:05 IST',
      lat: 18.6188,
      lng: 73.7151,
      accuracyMeters: 3.1,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'Physical display board clearly showing MahaRERA registration number P52100022154, promoter name, website URL and sanctioned layout.',
    },
    {
      id: 'EV-03',
      category: 'Towers Visited',
      title: 'Building E & G Structural Elevation',
      timestamp: '2026-09-19 10:32:41 IST',
      lat: 18.6191,
      lng: 73.7155,
      accuracyMeters: 2.4,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'Building E structure completed up to 22nd slab. External double-coat plaster and primer paint under application. Building G adjacent at 21st slab.',
    },
    {
      id: 'EV-04',
      category: 'Construction Close-up',
      title: 'Internal Flat Finishing & MEP Conduiting',
      timestamp: '2026-09-19 10:48:19 IST',
      lat: 18.6192,
      lng: 73.7154,
      accuracyMeters: 4.2,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'Typical floor unit 802 inspection. CPVC plumbing pressure test verified. Electrical wire pulling completed; modular switch boxes fitted.',
    },
    {
      id: 'EV-05',
      category: 'Infrastructure & Safety',
      title: 'Fire Fighting Ring Main & Transformer Yard',
      timestamp: '2026-09-19 11:05:30 IST',
      lat: 18.6184,
      lng: 73.7147,
      accuracyMeters: 3.5,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'Dedicated electrical substation commissioned by MSEDCL. Wet riser and external hydrant ring main laid around perimeter.',
    },
    {
      id: 'EV-06',
      category: 'Surroundings & Vicinity',
      title: 'Surrounding Land Use & Neighbouring Projects',
      timestamp: '2026-09-19 11:20:12 IST',
      lat: 18.6198,
      lng: 73.7162,
      accuracyMeters: 3.9,
      geofenceValid: true,
      capturedBy: 'Ar. Rajesh Deshpande (Valuer)',
      deviceInfo: 'Samsung Galaxy S24 Ultra (IMEI: ...8821)',
      description: 'North-facing unobstructed views towards IT park phase 1. No high-tension power lines or polluting industrial units within 2 km radius.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#edf2f7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102a43]">Geotagged Photographic & Video Evidence</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e6f4ea] text-[#137333]">
              100% Geofence Verified
            </span>
          </div>
          <p className="text-xs text-[#627d98] mt-0.5">
            Tamper-proof mobile capture with hardware GPS coordinates, accuracy circle, and valuer device signature
          </p>
        </div>

        <span className="text-xs text-[#627d98] font-mono">
          Showing {defaultEvidence.length} Captured Points
        </span>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {defaultEvidence.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              if (onSelectEvidence) onSelectEvidence(item);
            }}
            className="p-4 rounded-xl border border-[#e2e8f0] hover:border-[#19638c] bg-[#f8fafc] hover:bg-white transition-all cursor-pointer space-y-2.5 shadow-xs"
          >
            {/* Visual Header */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#e8f1f5] text-[#19638c]">
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-[#627d98]">{item.id}</span>
            </div>

            <h4 className="text-xs font-bold text-[#102a43] line-clamp-1">{item.title}</h4>

            {/* Geotag Strip */}
            <div className="bg-white p-2 rounded-lg border border-[#e2e8f0] space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-[#137333] font-medium">
                <span className="flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-[#19638c]" />
                  {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E
                </span>
                <span className="text-[10px] font-semibold bg-[#e6f4ea] px-1 rounded">±{item.accuracyMeters}m</span>
              </div>
              <div className="flex items-center justify-between text-[#627d98] text-[10px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.timestamp}
                </span>
                <span className="font-semibold text-[#137333]">GPS Lock ✓</span>
              </div>
            </div>

            <p className="text-xs text-[#486581] line-clamp-2 leading-relaxed">{item.description}</p>

            <div className="pt-1 border-t border-[#edf2f7] flex items-center justify-between text-[10px] text-[#627d98]">
              <span className="truncate max-w-[170px]">{item.capturedBy}</span>
              <span className="font-semibold text-[#19638c] flex items-center gap-1">
                <Eye className="w-3 h-3" />
                View Full
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Detail View if selected */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#cbd5e1]">
            <div className="flex items-center justify-between border-b border-[#edf2f7] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#19638c] tracking-wider">
                  {selectedItem.category} • {selectedItem.id}
                </span>
                <h3 className="text-base font-bold text-[#102a43]">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#627d98] hover:text-[#102a43] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#627d98]">Coordinates:</span>
                <span className="font-mono font-bold text-[#102a43]">{selectedItem.lat}° N, {selectedItem.lng}° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627d98]">GPS Accuracy Circle:</span>
                <span className="font-bold text-[#137333]">±{selectedItem.accuracyMeters} meters (Hardware Sensor)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627d98]">Geofence Perimeter Status:</span>
                <span className="font-bold text-[#137333]">Within RERA Registered Site Boundary (Validated)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627d98]">Captured Timestamp:</span>
                <span className="font-mono text-[#102a43]">{selectedItem.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627d98]">Valuer Device ID:</span>
                <span className="font-mono text-[#486581]">{selectedItem.deviceInfo}</span>
              </div>
            </div>

            <p className="text-xs text-[#334e68] leading-relaxed bg-[#f1f5f9] p-3 rounded-lg">
              {selectedItem.description}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#19638c] hover:bg-[#145070] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Close Evidence Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
