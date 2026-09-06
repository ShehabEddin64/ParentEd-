import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
export type MarkerKind = "event" | "family" | "tutor";
export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  kind: MarkerKind;
  count?: number;
};
const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const glyph: Record<MarkerKind, string> = {
  event:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  family:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
  tutor:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v4c3 2 9 2 12 0v-4"/></svg>',
};
export const quebecCenter: [number, number] = [45.75, -73.3];
/**
 * Interactive map on OpenStreetMap tiles (no account, no key). Markers use HTML pins so no image assets are needed.
 * `onPick` turns the map into a location picker: clicking places a single pin and reports its coordinates.
 */
export function MapView({
  markers,
  selectedId,
  onSelect,
  onPick,
  pick,
  height = 440,
  fit = true,
}: {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
  pick?: { lat: number; lng: number } | null;
  height?: number;
  fit?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pickLayer = useRef<L.Marker | null>(null);
  const fitted = useRef(false);
  const pickRef = useRef(onPick);
  const selectRef = useRef(onSelect);
  pickRef.current = onPick;
  selectRef.current = onSelect;
  useEffect(() => {
    if (!container.current) return;
    const m = L.map(container.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    }).setView(quebecCenter, 8);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => {
      pickRef.current?.(
        Math.round(e.latlng.lat * 10000) / 10000,
        Math.round(e.latlng.lng * 10000) / 10000,
      );
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    const group = layer.current;
    if (!m || !group) return;
    group.clearLayers();
    for (const mk of markers) {
      const selected = mk.id === selectedId;
      const html = `<div class="map-pin ${mk.kind}${selected ? " selected" : ""}" title="${escape(mk.title)}">${
        mk.count && mk.count > 1
          ? `<strong>${mk.count}</strong>`
          : glyph[mk.kind]
      }</div>`;
      const marker = L.marker([mk.lat, mk.lng], {
        icon: L.divIcon({
          className: "map-pin-wrap",
          html,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        }),
        keyboard: true,
        alt: mk.title,
        zIndexOffset: selected ? 1000 : 0,
      });
      marker.bindTooltip(
        `<strong>${escape(mk.title)}</strong>${mk.subtitle ? `<br>${escape(mk.subtitle)}` : ""}`,
        { direction: "top", offset: [0, -34] },
      );
      marker.on("click", () => selectRef.current?.(mk.id));
      marker.addTo(group);
    }
    if (fit && markers.length && !fitted.current) {
      m.fitBounds(L.latLngBounds(markers.map((x) => [x.lat, x.lng])), {
        padding: [40, 40],
        maxZoom: 12,
      });
      fitted.current = true;
    }
  }, [markers, selectedId, fit]);
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (pickLayer.current) {
      pickLayer.current.remove();
      pickLayer.current = null;
    }
    if (pick) {
      pickLayer.current = L.marker([pick.lat, pick.lng], {
        icon: L.divIcon({
          className: "map-pin-wrap",
          html: '<div class="map-pin pick">✓</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        }),
      }).addTo(m);
      if (!fitted.current) {
        m.setView([pick.lat, pick.lng], 12);
        fitted.current = true;
      }
    }
  }, [pick]);
  return (
    <div
      ref={container}
      className={`map-view ${onPick ? "pickable" : ""}`}
      style={{ height }}
      role="region"
      aria-label="Carte interactive"
    />
  );
}
