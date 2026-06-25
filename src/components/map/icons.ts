import L from 'leaflet';

const PIN_SIZE = 32;
const PIN_PATH = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z';

function buildPinIcon(color: string, emoji: string) {
  const html = `
    <div style="position:relative;width:${PIN_SIZE}px;height:${PIN_SIZE}px;">
      <svg width="${PIN_SIZE}" height="${PIN_SIZE}" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,0.45));">
        <path d="${PIN_PATH}" fill="${color}" stroke="white" stroke-width="1" />
        <circle cx="12" cy="9" r="4.3" fill="white" />
      </svg>
      <span style="position:absolute;top:6px;left:0;width:100%;text-align:center;font-size:13px;line-height:1;">${emoji}</span>
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, 29],
    popupAnchor: [0, -26],
  });
}

export const userLocationIcon = buildPinIcon('#2563eb', '📍');
export const wasteReportIcon = buildPinIcon('#f97316', '🗑️');
export const recyclingHubIcon = buildPinIcon('#059669', '♻️');
export const truckDispatchedIcon = buildPinIcon('#9333ea', '🚚');
