import { useState, useEffect } from "react";
import { useListStations } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import type { Station } from "@workspace/api-client-react/src/generated/api.schemas";
import "leaflet/dist/leaflet.css";

const NETWORK_COLORS: Record<string, string> = {
  "Лукойл": "#DC2626",
  "Газпром": "#3B82F6",
  "Роснефть": "#991B1B",
  "Shell": "#F59E0B",
  "Татнефть": "#10B981",
};

const ALL_NETWORKS = Object.keys(NETWORK_COLORS);
const ALL_FUELS = ["АИ-92", "АИ-95", "АИ-98", "ДТ"];

function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  return (
    <button
      className="absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white shadow-lg"
      onClick={() => map.setView([lat, lng], 12)}
    >
      <Navigation className="w-4 h-4" />
    </button>
  );
}

export default function MapPage() {
  const { data: stations, isLoading } = useListStations();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeNetworks, setActiveNetworks] = useState<Set<string>>(new Set(ALL_NETWORKS));
  const [activeFuels, setActiveFuels] = useState<Set<string>>(new Set(ALL_FUELS));

  const getStationColor = (network?: string) =>
    network ? NETWORK_COLORS[network] || "#FFFFFF" : "#FFFFFF";

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

  const filteredStations = stations?.filter((s) => activeNetworks.has(s.network ?? ""));

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ height: "calc(100dvh - 4rem)" }}
    >
      {/* Leaflet Map */}
      {!isLoading && stations && (
        <MapContainer
          center={[55.751, 37.617]}
          zoom={11}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {filteredStations?.map((station) => (
            <CircleMarker
              key={station.id}
              center={[station.lat ?? 55.751, station.lng ?? 37.617]}
              radius={10}
              pathOptions={{
                color: getStationColor(station.network),
                fillColor: getStationColor(station.network),
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelectedStation(station) }}
            />
          ))}
          <RecenterButton lat={55.751} lng={37.617} />
        </MapContainer>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]">
          <div className="text-white/40 text-sm">Загрузка карты…</div>
        </div>
      )}

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-[1001] flex justify-between items-center pointer-events-none">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          Карта
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="glass-panel text-white rounded-full pointer-events-auto shadow-lg"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-5 h-5" />
        </Button>
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
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getStationColor(selectedStation.network),
                      boxShadow: `0 0 10px ${getStationColor(selectedStation.network)}`,
                    }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {selectedStation.network}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedStation.name}</h2>
                <p className="text-sm text-white/40 mt-1">{selectedStation.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white/50 hover:text-white"
                onClick={() => setSelectedStation(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              {selectedStation.prices?.map((price) => (
                <div
                  key={price.fuelType}
                  className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5"
                >
                  <span className="font-medium text-white">{price.fuelType}</span>
                  <div className="flex items-baseline gap-2">
                    {price.lockedPrice && (
                      <span className="text-xs text-primary line-through opacity-70">
                        {price.lockedPrice} ₽
                      </span>
                    )}
                    <span className="text-lg font-bold text-cyan-400">
                      {price.pricePerLiter} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link href={`/catalog?station=${selectedStation.id}`}>
              <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-bold h-12 rounded-xl text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0">
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
                    {ALL_NETWORKS.map((network) => {
                      const active = activeNetworks.has(network);
                      const color = NETWORK_COLORS[network];
                      return (
                        <button
                          key={network}
                          onClick={() => toggleNetwork(network)}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 border"
                          style={{
                            borderColor: active ? color : "rgba(255,255,255,0.1)",
                            backgroundColor: active ? `${color}22` : "transparent",
                            color: active ? color : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {network}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-3">Вид топлива</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FUELS.map((type) => {
                      const active = activeFuels.has(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleFuel(type)}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 border"
                          style={{
                            borderColor: active ? "rgba(168,85,247,0.8)" : "rgba(255,255,255,0.1)",
                            backgroundColor: active ? "rgba(168,85,247,0.15)" : "transparent",
                            color: active ? "rgba(168,85,247,1)" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl"
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
