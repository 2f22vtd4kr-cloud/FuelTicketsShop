import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  "Лукойл": "#DC2626",
  "Газпромнефть": "#3B82F6",
  "Роснефть": "#991B1B",
  "Татнефть": "#10B981",
  "Shell": "#F59E0B",
  "Сургутнефтегаз": "#8B5CF6",
  "ОПТИ": "#06B6D4",
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

// Fetches stations in the current viewport
function ViewportLoader({
  onStationsLoaded,
}: {
  onStationsLoaded: (s: StationMarker[]) => void;
}) {
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
        const data: StationMarker[] = await res.json();
        onStationsLoaded(data);
      } catch (e) {
        console.error("Failed to load stations", e);
      }
    }, 300);
  }, [onStationsLoaded]);

  const map = useMapEvents({
    moveend(e) { fetchBounds(e.target.getBounds()); },
    zoomend(e) { fetchBounds(e.target.getBounds()); },
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchBounds(map.getBounds());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function RecenterButton() {
  const map = useMap();
  return (
    <button
      className="absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white shadow-lg"
      onClick={() => map.setView([55.751, 37.617], 11)}
    >
      <Navigation className="w-4 h-4" />
    </button>
  );
}

function MapInit({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMapEvents({
    load() { onReady(map); },
  });
  // trigger initial load
  useState(() => { setTimeout(() => onReady(map), 200); });
  return null;
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

  return (
    <div className="w-full relative overflow-hidden" style={{ height: "calc(100dvh - 4rem)" }}>
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

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
        >
          {visible.map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={8}
              pathOptions={{
                color: getColor(s.network),
                fillColor: getColor(s.network),
                fillOpacity: 0.9,
                weight: 1.5,
              }}
              eventHandlers={{ click: () => handleMarkerClick(s) }}
            />
          ))}
        </MarkerClusterGroup>

        <RecenterButton />
      </MapContainer>

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-[1001] flex justify-between items-center pointer-events-none">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
          Карта
        </h1>
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-xs text-white/50 bg-black/50 px-2 py-1 rounded-full">
            {visible.length} АЗС
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="glass-panel text-white rounded-full shadow-lg"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Station Detail Slide-up */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 glass-panel rounded-t-3xl p-6 z-[1002] border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getColor(selectedStation.network),
                      boxShadow: `0 0 8px ${getColor(selectedStation.network)}`,
                    }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {selectedStation.network}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedStation.name}</h2>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{selectedStation.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white/50 hover:text-white flex-shrink-0"
                onClick={() => setSelectedStation(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {loadingDetail ? (
              <div className="text-center text-white/40 text-sm py-4">Загрузка цен…</div>
            ) : (
              <div className="space-y-2 mb-5">
                {selectedStation.prices?.map((price) => (
                  <div
                    key={price.fuelType}
                    className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5"
                  >
                    <span className="font-medium text-white text-sm">{price.fuelType}</span>
                    <span className="text-base font-bold text-cyan-400">
                      {price.pricePerLiter} ₽/л
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link href={`/catalog?station=${selectedStation.id}`}>
              <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 text-white font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0">
                Купить талон
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Slide-up */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1003]"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-white/10 rounded-t-3xl p-6 z-[1004]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Фильтры</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-3">Сеть АЗС</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_NETWORKS.map((n) => {
                      const active = activeNetworks.has(n);
                      const color = NETWORK_COLORS[n];
                      return (
                        <button
                          key={n}
                          onClick={() => toggleNetwork(n)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 border"
                          style={{
                            borderColor: active ? color : "rgba(255,255,255,0.1)",
                            backgroundColor: active ? `${color}22` : "transparent",
                            color: active ? color : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-3">Вид топлива</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FUELS.map((f) => {
                      const active = activeFuels.has(f);
                      return (
                        <button
                          key={f}
                          onClick={() => toggleFuel(f)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 border"
                          style={{
                            borderColor: active ? "rgba(168,85,247,0.8)" : "rgba(255,255,255,0.1)",
                            backgroundColor: active ? "rgba(168,85,247,0.15)" : "transparent",
                            color: active ? "rgba(168,85,247,1)" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-white/90 font-bold h-11 rounded-xl"
                  onClick={() => setShowFilters(false)}
                >
                  Применить
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
