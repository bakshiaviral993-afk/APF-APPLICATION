import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  OctagonAlert,
  BellRing,
  Compass,
  Navigation,
  Crosshair,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { loadGoogleMaps, MANDATORY_ATTRIBUTION_ID } from '../../services/googleMapsLoader';
import { APFCase, ProjectMaster } from '../../types/apfTransaction';

interface InteractiveSiteMapViewProps {
  caseData: APFCase;
  project?: ProjectMaster;
  onOpenPinModal?: () => void;
  canPin?: boolean;
}

export const InteractiveSiteMapView: React.FC<InteractiveSiteMapViewProps> = ({
  caseData,
  project,
  onOpenPinModal,
  canPin = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const defaultProjectLat = project?.latLong?.lat ?? 18.5593;
  const defaultProjectLng = project?.latLong?.lng ?? 73.7845;

  const pinnedLocation = caseData.valuerAssignment?.pinnedLocation;
  const valuerLat = pinnedLocation?.lat ?? defaultProjectLat + 0.0008;
  const valuerLng = pinnedLocation?.lng ?? defaultProjectLng + 0.0006;
  const isPinned = Boolean(pinnedLocation);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setLoadError(null);
        await loadGoogleMaps();
        if (!isMounted || !mapContainerRef.current) return;

        const mapsLib = (await window.google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
        const markerLib = (await window.google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: { lat: isPinned ? valuerLat : defaultProjectLat, lng: isPinned ? valuerLng : defaultProjectLng },
          zoom: 16,
          mapId: 'DEMO_MAP_ID',
          internalUsageAttributionIds: [MANDATORY_ATTRIBUTION_ID],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        // Project Center Marker
        const projectPinElement = new markerLib.PinElement({
          background: '#0c3148',
          borderColor: '#19638c',
          glyphColor: '#ffffff',
          scale: 1.0,
        });

        new markerLib.AdvancedMarkerElement({
          map,
          position: { lat: defaultProjectLat, lng: defaultProjectLng },
          title: `Project: ${project?.projectName || 'Project Master'}`,
          content: projectPinElement.element,
        });

        // 500m Geofence
        new window.google.maps.Circle({
          strokeColor: '#0284c7',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          map,
          center: { lat: defaultProjectLat, lng: defaultProjectLng },
          radius: 500,
        });

        // Valuer Pinned Location Marker if available
        if (isPinned) {
          const valuerPinElement = new markerLib.PinElement({
            background: '#16a34a',
            borderColor: '#14532d',
            glyphColor: '#ffffff',
            scale: 1.2,
          });

          new markerLib.AdvancedMarkerElement({
            map,
            position: { lat: valuerLat, lng: valuerLng },
            title: `Valuer Pinned Location: ${pinnedLocation?.address || 'Site Inspection'}`,
            content: valuerPinElement.element,
          });
        }

        // Add additional site evidence markers if any
        if (caseData.siteVisitEvidence && caseData.siteVisitEvidence.length > 0) {
          caseData.siteVisitEvidence.forEach((ev) => {
            if (ev.deviceSessionId !== 'GMP-VALUER-PIN-SESSION') {
              const evPin = new markerLib.PinElement({
                background: '#ea580c',
                borderColor: '#c2410c',
                glyphColor: '#ffffff',
                scale: 0.85,
              });

              new markerLib.AdvancedMarkerElement({
                map,
                position: { lat: ev.lat, lng: ev.lng },
                title: `${ev.category}: ${ev.title}`,
                content: evPin.element,
              });
            }
          });
        }

        // Blocked Geofence Breach Pin if active
        if (caseData.latestGeofenceBreach && caseData.latestGeofenceBreach.status === 'ACTIVE_ALERT') {
          const breachPin = new markerLib.PinElement({
            background: '#e11d48',
            borderColor: '#9f1239',
            glyphColor: '#ffffff',
            scale: 1.1,
          });

          new markerLib.AdvancedMarkerElement({
            map,
            position: {
              lat: caseData.latestGeofenceBreach.attemptedLat,
              lng: caseData.latestGeofenceBreach.attemptedLng,
            },
            title: `BLOCKED GEOFENCE BREACH: ${caseData.latestGeofenceBreach.distanceFromProjectMeters}m off-site`,
            content: breachPin.element,
          });
        }

        setMapLoaded(true);
      } catch (e: any) {
        console.error('InteractiveSiteMapView load failed:', e);
        if (isMounted) setLoadError(e?.message || 'Failed to load map');
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [caseData, project, isPinned, valuerLat, valuerLng, defaultProjectLat, defaultProjectLng]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      {/* Header bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-800 border border-sky-200">
            <MapPin className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Google Maps Geofence & Physical Appraisal Location</span>
              {isPinned ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  GPS Pin Locked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  Pending Valuer Pin
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Project Coordinates: {defaultProjectLat.toFixed(5)}, {defaultProjectLng.toFixed(5)} • 500m Sanctioned Boundary
            </p>
          </div>
        </div>

        {canPin && onOpenPinModal && (
          <button
            type="button"
            onClick={onOpenPinModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <MapPin className="w-4 h-4" />
            <span>{isPinned ? 'Update Pinned Location on Map' : 'Pin My Location on Google Maps'}</span>
          </button>
        )}
      </div>

      {/* Active Geofence Breach Warning Banner */}
      {caseData.latestGeofenceBreach && caseData.latestGeofenceBreach.status === 'ACTIVE_ALERT' && (
        <div className="p-3.5 bg-rose-50 border-b border-rose-300 text-xs text-rose-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-rose-900">
                🚨 Off-Site Pin Attempt Rejected & Dispatched to Approving Authorities
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-mono text-[10px] font-black uppercase">
                {caseData.latestGeofenceBreach.distanceFromProjectMeters}m Deviation
              </span>
            </div>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Valuer <strong>{caseData.latestGeofenceBreach.attemptedBy}</strong> attempted to pin coordinates outside the sanctioned site perimeter. Pin was strictly blocked. High-severity alerts dispatched to <strong>CPA, COM, ACOM & Approving Authorities</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Map display */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {loadError && (
          <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center p-4 text-white text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-xs font-semibold">Google Maps SDK loading in progress or needs manual reload.</p>
            {canPin && onOpenPinModal && (
              <button
                type="button"
                onClick={onOpenPinModal}
                className="mt-3 px-3 py-1.5 bg-emerald-600 rounded-lg text-xs font-bold text-white"
              >
                Launch Pin Modal
              </button>
            )}
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md text-[10px] flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3148] border border-sky-400 inline-block" />
            <span>Project Center</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-300 inline-block" />
            <span>Valuer Pin</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-sky-800">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400/30 border border-sky-500 inline-block" />
            <span>500m Geofence</span>
          </div>
          {caseData.latestGeofenceBreach && caseData.latestGeofenceBreach.status === 'ACTIVE_ALERT' && (
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-300 inline-block animate-ping" />
              <span>Blocked Off-Site Pin ({caseData.latestGeofenceBreach.distanceFromProjectMeters}m)</span>
            </div>
          )}
        </div>
      </div>

      {/* Pinned details summary footer */}
      {isPinned && pinnedLocation && (
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">Pinned Spot:</span>
            <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              {pinnedLocation.lat.toFixed(6)}, {pinnedLocation.lng.toFixed(6)}
            </span>
            <span className="text-slate-600 truncate max-w-sm font-medium">
              {pinnedLocation.address || 'Project Location'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
            <span>Pinned by: <strong className="text-slate-700">{pinnedLocation.pinnedBy}</strong></span>
            <span>Accuracy: <strong className="text-emerald-700">±{pinnedLocation.accuracyMeters.toFixed(1)}m</strong></span>
          </div>
        </div>
      )}

      {/* Mandatory Attribution */}
      <div className="px-4 py-1.5 bg-white border-t border-slate-100 text-[10px] text-slate-400">
        Google Maps
      </div>
    </div>
  );
};
