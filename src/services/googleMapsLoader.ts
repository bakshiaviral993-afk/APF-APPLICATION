// Google Maps Platform JavaScript API Dynamic Loader
// Strictly complies with Google Maps Platform standards and mandatory attribution

export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyDELoWlySqWJeU7Zvwqd1ywAOW76v8EfIw';

export const MANDATORY_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

let mapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }

  // Already loaded
  if (typeof window.google?.maps?.importLibrary === 'function') {
    return Promise.resolve(window.google);
  }

  if (mapsPromise) {
    return mapsPromise;
  }

  mapsPromise = new Promise<typeof google>((resolve, reject) => {
    // Check if script element is already present
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      if (window.google?.maps) {
        resolve(window.google);
        return;
      }
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const callbackName = `__gmp_callback_${Date.now()}`;
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve(window.google);
    };

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      v: 'weekly',
      libraries: 'maps,marker',
      callback: callbackName,
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      delete (window as any)[callbackName];
      reject(new Error(`Failed to load Google Maps script: ${err}`));
    };

    document.head.appendChild(script);
  });

  return mapsPromise;
}
