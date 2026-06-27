import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Navigation } from "lucide-react";
import { Link } from "wouter";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const NETWORK_COLORS: Record<string, string> = {
  "Лукойл":         "#DC2626",
  "Газпромнефть":   "#F59E0B",
  "Роснефть":       "#3B82F6",
  "Татнефть":       "#10B981",
  "Shell":          "#EAB308",
  "Сургутнефтегаз": "#8B5CF6",
  "ОПТИ":           "#06B6D4",
};
const ALL_NETWORKS = Object.keys(NETWORK_COLORS);
const ALL_FUELS = ["АИ-92", "АИ-95", "АИ-98", "ДТ"];

interface StationMarker {
  id: number;
  name: string;
  network: string;
  address: string;
  lat: number;
  lng: number;
  networkColor: string;
}

interface StationDetail extends StationMarker {
  prices?: { fuelType: string; pricePerLiter: number; lockedPrice?: number | null }[];
}

function getColor(network?: string) {
  return network ? (NETWORK_COLORS[network] || "#AAAAAA") : "#AAAAAA";
}

function ViewportLoader({ onStationsLoaded }: { onStationsLoaded: (s: StationMarker[]) => void }) {
  const fetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBounds = useCallback((bounds: LatLngBounds) => {
    if (fetchRef.current) clearTimeout(fetchRef.current);
    fetchRef.current = setTimeout(async () => {
      const params = new URLSearchParams({
        latMin: String(bounds.getSouth()),
        latMax: String(bounds.getNorth()),
        lngMin: String(bounds.getWest()),
        lngMax: String(bounds.getEast()),
        mapView: "1",
        limit: "500",
      });
      try {
        const res = await fetch(`${BASE_URL}/api/stations?${params}`);
        const data = await res.json();
        onStationsLoaded(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load stations", e);
      }
    }, 300);
  }, [onStationsLoaded]);

  const map = useMapEvents({
    moveend(e) { fetchBounds(e.target.getBounds()); },
    zoomend(e) { fetchBounds(e.target.getBounds()); },
  });

  useEffect(() => {
    fetchBounds(map.getBounds());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function RecenterButton() {
  const map = useMap();
  return (
    <button
      style={{
        position: "absolute", bottom: 16, right: 16, zIndex: 1000,
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(10,10,15,0.88)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "rgba(255,255,255,0.7)",
      }}
      onClick={() => map.setView([55.751, 37.617], 11)}
    >
      <Navigation style={{ width: 18, height: 18 }} />
    </button>
  );
}

export default function MapPage() {
  const [stations, setStations] = useState<StationMarker[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeNetworks, setActiveNetworks] = useState<Set<string>>(new Set(ALL_NETWORKS));
  const [activeFuels, setActiveFuels] = useState<Set<string>>(new Set(ALL_FUELS));

  const handleStationsLoaded = useCallback((data: StationMarker[]) => {
    setStations(data);
  }, []);

  const handleMarkerClick = async (station: StationMarker) => {
    setSelectedStation(station as StationDetail);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${BASE_URL}/api/stations/${station.id}`);
      const detail: StationDetail = await res.json();
      setSelectedStation(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleNetwork = (n: string) =>
    setActiveNetworks((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });

  const toggleFuel = (f: string) =>
    setActiveFuels((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });

  const visible = stations.filter((s) => activeNetworks.has(s.network));
  const accent = selectedStation ? getColor(selectedStation.network) : "#A855F7";

  return (
    <div style={{ width: "100%", position: "relative", overflow: "hidden", height: "calc(100dvh - 4rem)" }}>
      <MapContainer
        center={[55.751, 37.617]}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        <ViewportLoader onStationsLoaded={handleStationsLoaded} />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={50} showCoverageOnHover={false}>
          {visible.map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={7}
              pathOptions={{
                color: getColor(s.network),
                fillColor: getColor(s.network),
                fillOpacity: 0.85,
                weight: 1.5,
              }}
              eventHandlers={{ click: () => handleMarkerClick(s) }}
            />
          ))}
        </MarkerClusterGroup>

        <RecenterButton />
      </MapContainer>

      {/* Floating header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: "16px 16px",
        zIndex: 1001, display: "flex", justifyContent: "space-between", alignItems: "center",
        pointerEvents: "none",
      }}>
        <div style={{ pointerEvents: "none" }}>
          <h1 style={{
            fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "white",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}>
            КАРТА
          </h1>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            {visible.length} АЗС
          </p>
        </div>
        <button
          style={{
            pointerEvents: "all",
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(10,10,15,0.88)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.7)",
          }}
          onClick={() => setShowFilters(true)}
        >
          <Filter style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Station detail bottom sheet */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1002,
              background: "rgba(10,10,15,0.94)", backdropFilter: "blur(40px)",
              borderRadius: "28px 28px 0 0",
              borderTop: `1px solid ${accent}33`,
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              padding: "0 20px 32px",
              boxShadow: `0 -20px 60px rgba(0,0,0,0.6), 0 -1px 0 ${accent}22`,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ flex: 1, paddingRight: 12 }}>
                {/* Network badge */}
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 100, marginBottom: 8,
                  background: `${accent}22`, border: `1px solid ${accent}44`,
                  color: accent, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                }}>
                  {selectedStation.network}
                </span>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
                  {selectedStation.name}
                </h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {selectedStation.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,0.5)", flexShrink: 0,
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Fuel prices */}
            {loadingDetail ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, padding: "16px 0" }}>
                Загрузка цен…
              </div>
            ) : selectedStation.prices?.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {selectedStation.prices.map((price) => (
                  <div
                    key={price.fuelType}
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 14, padding: "10px 12px",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{price.fuelType}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>{price.pricePerLiter} ₽</span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* CTA */}
            <Link href={`/catalog?station=${selectedStation.id}`}>
              <button style={{
                width: "100%", height: 52, borderRadius: 18, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                boxShadow: `0 12px 40px ${accent}44, 0 0 0 1px ${accent}33`,
                color: "white", fontWeight: 600, fontSize: 15,
              }}>
                Купить талон
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 1003 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1004,
                background: "rgba(10,10,15,0.97)", backdropFilter: "blur(40px)",
                borderRadius: "28px 28px 0 0",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                padding: "0 20px 36px",
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>Фильтры</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Network filters */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Сеть АЗС
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALL_NETWORKS.map((n) => {
                    const isActive = activeNetworks.has(n);
                    const color = NETWORK_COLORS[n];
                    return (
                      <button
                        key={n}
                        onClick={() => toggleNetwork(n)}
                        style={{
                          padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                          cursor: "pointer", transition: "all 0.15s",
                          background: isActive ? `${color}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? `${color}55` : "rgba(255,255,255,0.08)"}`,
                          color: isActive ? color : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fuel filters */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Вид топлива
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALL_FUELS.map((f) => {
                    const isActive = activeFuels.has(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleFuel(f)}
                        style={{
                          padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                          cursor: "pointer", transition: "all 0.15s",
                          background: isActive ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? "rgba(168,85,247,0.55)" : "rgba(255,255,255,0.08)"}`,
                          color: isActive ? "#A855F7" : "rgba(255,255,255,0.4)",
                          boxShadow: isActive ? "0 0 14px rgba(168,85,247,0.2)" : "none",
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                style={{
                  width: "100%", height: 52, borderRadius: 18, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                  boxShadow: "0 12px 40px rgba(168,85,247,0.4)",
                  color: "white", fontWeight: 600, fontSize: 15,
                }}
              >
                Применить
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
