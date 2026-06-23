import L from 'leaflet';

function createDivIcon(colorClass: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div class="flex h-8 w-8 items-center justify-center rounded-full ${colorClass} border-2 border-white text-sm shadow-lg">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export const userLocationIcon = createDivIcon('bg-blue-600', '📍');
export const wasteReportIcon = createDivIcon('bg-orange-500', '🗑️');
export const recyclingHubIcon = createDivIcon('bg-emerald-600', '♻️');
