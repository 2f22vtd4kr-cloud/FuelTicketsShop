import { useState } from "react";
import { useListStations } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Station } from "@workspace/api-client-react/src/generated/api.schemas";

// Mock coordinates for our stylized map
const MOCK_MAP_STATIONS = [
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 70, y: 15 },
  { id: 3, x: 45, y: 50 },
  { id: 4, x: 80, y: 80 },
  { id: 5, x: 15, y: 75 },
  { id: 6, x: 55, y: 85 },
];

const NETWORK_COLORS: Record<string, string> = {
  Lukoil: "#DC2626",
  Gazprom: "#3B82F6",
  Rosneft: "#991B1B",
  Shell: "#F59E0B",
  Tatneft: "#10B981",
};

export default function MapPage() {
  const { data: stations, isLoading } = useListStations();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getStationColor = (network?: string) => {
    return network ? NETWORK_COLORS[network] || "#FFFFFF" : "#FFFFFF";
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-[#0A0A0F] overflow-hidden">
      {/* Background Stylized Map */}
      <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Abstract routes */}
          <path d="M 0 50 Q 50 20 100 80 T 200 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <path d="M 50 0 Q 80 50 20 100 T 60 200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        </svg>

        {/* Station Markers */}
        {!isLoading && stations && stations.map((station, i) => {
          const coords = MOCK_MAP_STATIONS[i % MOCK_MAP_STATIONS.length];
          const color = getStationColor(station.network);
          return (
            <motion.button
              key={station.id}
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center z-10 focus:outline-none"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedStation(station)}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`,
                }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center pointer-events-none">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          Карта
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="glass-panel text-white rounded-full pointer-events-auto"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Slide-up Modal for Station Details */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 glass-panel rounded-t-3xl p-6 z-30 border-b-0 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
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
                <div key={price.fuelType} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
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

      {/* Slide-up Filters */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-white/10 rounded-t-3xl p-6 z-50 pb-safe"
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
                    {Object.entries(NETWORK_COLORS).map(([network, color]) => (
                      <button
                        key={network}
                        className="px-4 py-2 rounded-full glass-panel text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
                      >
                        {network}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-3">Вид топлива</h4>
                  <div className="flex flex-wrap gap-2">
                    {["АИ-92", "АИ-95", "АИ-98", "ДТ"].map((type) => (
                      <button
                        key={type}
                        className="px-4 py-2 rounded-full glass-panel text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 rounded-xl mt-4">
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
