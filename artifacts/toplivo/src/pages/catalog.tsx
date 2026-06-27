import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, TrendingUp, ShieldCheck, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetLivePrices, useListStations, useCreateVoucher } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useUser } from "@/lib/context/user";

export default function CatalogPage() {
  const { data: livePrices, isLoading: isLoadingPrices } = useGetLivePrices();
  const { data: stations } = useListStations();
  const { mutate: createVoucher, isPending: isCreating } = useCreateVoucher();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [expandedFuel, setExpandedFuel] = useState<string | null>(null);
  const [liters, setLiters] = useState<number>(30);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stars" | "crypto">("stars");

  const fuelTypes = [
    { id: "ai92", name: "АИ-92", color: "#F59E0B" },
    { id: "ai95", name: "АИ-95", color: "#3B82F6" },
    { id: "ai98", name: "АИ-98", color: "#A855F7" },
    { id: "diesel", name: "Дизель", color: "#10B981" },
  ];

  const handlePurchase = () => {
    if (!selectedStation) {
      toast({ title: "Ошибка", description: "Выберите станцию", variant: "destructive" });
      return;
    }
    if (!expandedFuel) return;

    createVoucher({
      data: {
        stationId: selectedStation,
        fuelType: expandedFuel,
        liters,
        paymentMethod,
        telegramUserId: user?.telegramId,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Успешно", description: "Талон приобретен" });
        setLocation("/vault");
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось приобрести талон", variant: "destructive" });
      }
    });
  };

  return (
    <div className="w-full min-h-full p-4 pt-6 pb-24 flex flex-col gap-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 blur-2xl rounded-full -ml-10 -mb-10" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Защита от инфляции</span>
          </div>
          <h2 className="text-2xl font-black leading-tight mb-2">
            Цена заморожена<br />на 90 дней.
          </h2>
          <p className="text-white/60 text-sm">
            Покупайте топливо сейчас, заправляйтесь потом. Зафиксируйте цену и забудьте о подорожании.
          </p>
        </div>
      </motion.div>

      {/* Live Market Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-xs text-white/50 mb-1">Рынок (АИ-95)</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{livePrices?.ai95 ? (livePrices.ai95 + 1.2).toFixed(2) : "--"} ₽</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[10px] text-red-500 mt-1">Ожидается рост</span>
        </div>
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-center border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <span className="text-xs text-white/50 mb-1">Ваша цена</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-cyan-400">{livePrices?.ai95 ? livePrices.ai95.toFixed(2) : "--"} ₽</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-cyan-400 mt-1">Заморожена</span>
        </div>
      </motion.div>

      {/* Fuel Type Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1">Выберите топливо</h3>
        
        {fuelTypes.map((fuel, index) => {
          const isExpanded = expandedFuel === fuel.id;
          const price = livePrices ? livePrices[fuel.id as keyof typeof livePrices] : null;
          
          return (
            <motion.div 
              key={fuel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.05) }}
              className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded ? "border-white/30" : ""
              }`}
              style={{
                boxShadow: isExpanded ? `0 0 20px ${fuel.color}20` : "none"
              }}
            >
              <button 
                className="w-full p-5 flex items-center justify-between"
                onClick={() => setExpandedFuel(isExpanded ? null : fuel.id)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black"
                    style={{ backgroundColor: `${fuel.color}20`, color: fuel.color }}
                  >
                    {fuel.name.split("-")[1] || "ДТ"}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">{fuel.name}</div>
                    <div className="text-sm text-white/50">От {price || "--"} ₽/л</div>
                  </div>
                </div>
                
                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-5 space-y-5 bg-black/20">
                      {/* Liters Selection */}
                      <div>
                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2 block">
                          Объем (литры)
                        </label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            value={liters} 
                            onChange={(e) => setLiters(Number(e.target.value))}
                            className="bg-white/5 border-white/10 h-12 text-lg text-center"
                          />
                          <div className="flex gap-2">
                            {[20, 30, 40, 50].map(val => (
                              <Button
                                key={val}
                                variant="outline"
                                size="sm"
                                onClick={() => setLiters(val)}
                                className={`h-12 w-12 rounded-xl border-white/10 bg-transparent ${liters === val ? 'bg-white/10 text-white' : 'text-white/50'}`}
                              >
                                {val}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Station Selection */}
                      <div>
                        <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2 block">
                          Станция для заморозки
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {stations?.slice(0, 3).map(station => (
                            <button
                              key={station.id}
                              onClick={() => setSelectedStation(station.id)}
                              className={`p-3 rounded-xl flex items-center justify-between text-left transition-all border ${
                                selectedStation === station.id 
                                  ? "border-cyan-400/50 bg-cyan-400/10" 
                                  : "border-white/10 bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <div>
                                <div className="font-medium text-sm">{station.name}</div>
                                <div className="text-xs text-white/50">{station.address}</div>
                              </div>
                              {selectedStation === station.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                         <label className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2 block">
                          Оплата
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPaymentMethod("stars")}
                            className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                              paymentMethod === "stars" ? "border-primary/50 bg-primary/20" : "border-white/10 bg-white/5"
                            }`}
                          >
                            <span className="text-xl">⭐️</span>
                            <span className="text-xs font-medium">Telegram Stars</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("crypto")}
                            className={`flex-1 p-3 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                              paymentMethod === "crypto" ? "border-primary/50 bg-primary/20" : "border-white/10 bg-white/5"
                            }`}
                          >
                            <span className="text-xl">💎</span>
                            <span className="text-xs font-medium">CryptoBot</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white/60">К оплате:</span>
                          <span className="text-2xl font-bold">
                            {price ? (Number(price) * liters).toFixed(2) : "--"} ₽
                          </span>
                        </div>
                        <Button 
                          onClick={handlePurchase}
                          disabled={isCreating}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-bold border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                          {isCreating ? "Обработка..." : "Заморозить цену"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
