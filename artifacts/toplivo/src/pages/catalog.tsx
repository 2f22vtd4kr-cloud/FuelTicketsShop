import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { useGetLivePrices, useListStations, useCreatePaymentOrder, useGetPaymentOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useUser } from "@/lib/context/user";

type PaymentStep =
  | { type: "idle" }
  | { type: "waiting_payment"; orderId: number; method: "stars" | "crypto"; invoiceUrl: string; webInvoiceUrl?: string | null; starsAmount?: number | null }
  | { type: "confirming"; orderId: number }
  | { type: "done"; voucherId: number };

const FUEL_CONFIG = [
  { id: "ai92",   name: "АИ-92",  accent: "#F59E0B", label: "92"  },
  { id: "ai95",   name: "АИ-95",  accent: "#3B82F6", label: "95"  },
  { id: "ai98",   name: "АИ-98",  accent: "#A855F7", label: "98"  },
  { id: "diesel", name: "Дизель", accent: "#10B981", label: "ДТ"  },
];

const QUICK_LITERS = [20, 40, 60];

function glassCard(accent?: string) {
  return {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
    border: `1px solid ${accent ? `${accent}22` : "rgba(255,255,255,0.07)"}`,
    borderRadius: 20,
    boxShadow: accent ? `0 0 24px ${accent}12` : "none",
  } as React.CSSProperties;
}

export default function CatalogPage() {
  const { data: livePrices, isLoading: isLoadingPrices } = useGetLivePrices();
  const { data: stations } = useListStations();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreatePaymentOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [expandedFuel, setExpandedFuel] = useState<string | null>(null);
  const [liters, setLiters] = useState<number>(40);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stars" | "crypto">("stars");
  const [step, setStep] = useState<PaymentStep>({ type: "idle" });

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderId = step.type === "waiting_payment" || step.type === "confirming" ? step.orderId : null;

  const { data: orderStatus } = useGetPaymentOrder(
    orderId ?? 0,
    { query: { enabled: orderId !== null, refetchInterval: 2000 } }
  );

  useEffect(() => {
    if (!orderStatus) return;
    if (orderStatus.status === "paid" && orderStatus.voucherId) {
      setStep({ type: "done", voucherId: orderStatus.voucherId });
      toast({ title: "Оплата прошла!", description: "Ваш талон создан" });
      setTimeout(() => setLocation("/vault"), 1500);
    }
  }, [orderStatus]);

  useEffect(() => {
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, []);

  const handlePurchase = () => {
    if (!selectedStation) {
      toast({ title: "Ошибка", description: "Выберите станцию", variant: "destructive" });
      return;
    }
    if (!expandedFuel) return;

    createOrder(
      { data: { stationId: selectedStation, fuelType: expandedFuel, liters, paymentMethod } },
      {
        onSuccess: (order) => {
          setStep({
            type: "waiting_payment",
            orderId: order.orderId,
            method: order.method as "stars" | "crypto",
            invoiceUrl: order.invoiceUrl,
            webInvoiceUrl: order.webInvoiceUrl ?? null,
            starsAmount: order.starsAmount ?? null,
          });
          if (order.method === "stars") {
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.openInvoice) {
              tg.openInvoice(order.invoiceUrl, (status: string) => {
                if (status === "paid") setStep({ type: "confirming", orderId: order.orderId });
                else if (status === "failed" || status === "cancelled") {
                  toast({ title: "Оплата отменена", variant: "destructive" });
                  setStep({ type: "idle" });
                }
              });
            } else {
              window.open(order.invoiceUrl, "_blank");
            }
          } else {
            const tg = (window as any).Telegram?.WebApp;
            const url = tg ? order.invoiceUrl : (order.webInvoiceUrl ?? order.invoiceUrl);
            if (tg?.openLink) tg.openLink(url);
            else window.open(url, "_blank");
          }
        },
        onError: () => {
          toast({ title: "Ошибка", description: "Не удалось создать счёт", variant: "destructive" });
        },
      }
    );
  };

  const activeFuelConfig = FUEL_CONFIG.find(f => f.id === expandedFuel);
  const price = expandedFuel ? livePrices?.[expandedFuel as keyof typeof livePrices] ?? null : null;
  const totalRub = price ? (Number(price) * liters) : null;
  const savings90 = totalRub ? Math.round(totalRub * 0.08) : null;

  // Payment waiting overlay
  if (step.type === "waiting_payment" || step.type === "confirming" || step.type === "done") {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center p-6 gap-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ ...glassCard("#A855F7"), borderRadius: 28, padding: "2rem", width: "100%", maxWidth: 360 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {step.type === "done" ? (
            <>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,211,238,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 style={{ width: 36, height: 36, color: "#22D3EE" }} />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-1">Готово!</h2>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>Переходим в Сейф…</p>
              </div>
            </>
          ) : step.type === "confirming" ? (
            <>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 style={{ width: 36, height: 36, color: "#A855F7" }} className="animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-black mb-1">Подтверждаем…</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Дожидаемся подтверждения сети</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(168,85,247,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {step.method === "stars" ? "⭐️" : "💎"}
              </div>
              <div>
                <h2 className="text-xl font-black mb-1">
                  {step.method === "stars" ? "Оплата Telegram Stars" : "Оплата CryptoBot"}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  {step.method === "stars"
                    ? "Оплатите в окне Telegram. После оплаты талон будет создан автоматически."
                    : "Перейдите по ссылке и оплатите счёт. Талон будет создан автоматически."}
                </p>
              </div>
              {step.method === "stars" && step.starsAmount && (
                <div style={{ ...glassCard("#A855F7"), padding: "12px 24px", borderRadius: 16, textAlign: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#A855F7" }}>⭐️ {step.starsAmount}</span>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Telegram Stars</p>
                </div>
              )}
              {step.method === "crypto" && (
                <a
                  href={step.webInvoiceUrl ?? step.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, color: "#22D3EE", fontSize: 14, fontWeight: 500 }}
                >
                  Открыть счёт в браузере <ExternalLink style={{ width: 14, height: 14 }} />
                </a>
              )}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Ожидаем подтверждения платежа…</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "#A855F7" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                </div>
              </div>
              <button
                style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setStep({ type: "idle" })}
              >
                Отменить
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full pb-28" style={{ padding: "24px 16px 112px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "white", textTransform: "uppercase" }}>
          КАТАЛОГ
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          Зафиксируй цену сегодня
        </p>
      </motion.div>

      {/* Live price widget */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}
      >
        <div style={{ ...glassCard(), padding: "14px 16px", borderRadius: 16 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Рынок (АИ-95)</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
            {livePrices?.ai95 ? (Number(livePrices.ai95) + 1.2).toFixed(2) : "—"} ₽
          </p>
          <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>↑ Ожидается рост</p>
        </div>
        <div style={{ ...glassCard("#22D3EE"), padding: "14px 16px", borderRadius: 16 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Ваша цена</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#22D3EE" }}>
            {livePrices?.ai95 ? Number(livePrices.ai95).toFixed(2) : "—"} ₽
          </p>
          <p style={{ fontSize: 11, color: "#22D3EE", marginTop: 4 }}>✓ Заморожена</p>
        </div>
      </motion.div>

      {/* Fuel type cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          Выберите топливо
        </h3>

        {FUEL_CONFIG.map((fuel, idx) => {
          const isOpen = expandedFuel === fuel.id;
          const fuelPrice = livePrices ? livePrices[fuel.id as keyof typeof livePrices] : null;

          return (
            <motion.div
              key={fuel.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              style={{
                ...glassCard(isOpen ? fuel.accent : undefined),
                borderRadius: 20,
                overflow: "hidden",
                transition: "all 0.25s ease",
              }}
            >
              {/* Card header */}
              <button
                style={{ width: "100%", padding: "18px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "white" }}
                onClick={() => setExpandedFuel(isOpen ? null : fuel.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Left color bar */}
                  <div style={{ width: 3, height: 44, borderRadius: 2, background: fuel.accent, flexShrink: 0 }} />
                  {/* Icon badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${fuel.accent}18`, color: fuel.accent, fontSize: 16, fontWeight: 800,
                  }}>
                    {fuel.label}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: "white" }}>{fuel.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {fuelPrice ? `${Number(fuelPrice).toFixed(2)} ₽/л` : isLoadingPrices ? "Загрузка…" : "—"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  style={{ width: 18, height: 18, color: "rgba(255,255,255,0.35)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
              </button>

              {/* Expanded purchase UI */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

                      {/* Liter selector */}
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                          Объём
                        </p>
                        {/* Giant number display */}
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                          <span style={{ fontSize: 64, fontWeight: 800, color: "white", lineHeight: 1, textShadow: `0 0 40px ${fuel.accent}40` }}>
                            {liters}
                          </span>
                          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>л</span>
                        </div>

                        {/* Range slider */}
                        <div style={{ position: "relative", marginBottom: 16 }}>
                          <style>{`
                            .fuel-slider-${fuel.id}::-webkit-slider-thumb {
                              -webkit-appearance: none;
                              width: 22px; height: 22px; border-radius: 50%;
                              background: white;
                              box-shadow: 0 0 0 4px ${fuel.accent}44, 0 4px 12px rgba(0,0,0,0.4);
                              cursor: pointer;
                            }
                            .fuel-slider-${fuel.id}::-webkit-slider-runnable-track {
                              height: 6px; border-radius: 3px;
                              background: linear-gradient(90deg, ${fuel.accent} ${((liters - 10) / 90) * 100}%, rgba(255,255,255,0.1) ${((liters - 10) / 90) * 100}%);
                            }
                            .fuel-slider-${fuel.id} { -webkit-appearance: none; width: 100%; height: 6px; cursor: pointer; background: transparent; outline: none; }
                          `}</style>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={liters}
                            onChange={(e) => setLiters(Number(e.target.value))}
                            className={`fuel-slider-${fuel.id}`}
                          />
                        </div>

                        {/* Quick pick pills */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          {QUICK_LITERS.map((val) => {
                            const isActive = liters === val;
                            return (
                              <button
                                key={val}
                                onClick={() => setLiters(val)}
                                style={{
                                  padding: "9px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                                  background: isActive ? `${fuel.accent}18` : "rgba(255,255,255,0.05)",
                                  border: `1px solid ${isActive ? `${fuel.accent}55` : "rgba(255,255,255,0.1)"}`,
                                  color: isActive ? fuel.accent : "rgba(255,255,255,0.45)",
                                  boxShadow: isActive ? `0 0 14px ${fuel.accent}20` : "none",
                                  transition: "all 0.15s",
                                }}
                              >
                                {val} л
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Station selector */}
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                          Станция
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {stations?.slice(0, 3).map((station) => {
                            const isSel = selectedStation === station.id;
                            return (
                              <button
                                key={station.id}
                                onClick={() => setSelectedStation(station.id)}
                                style={{
                                  padding: "12px 14px", borderRadius: 14, display: "flex", alignItems: "center",
                                  justifyContent: "space-between", textAlign: "left", cursor: "pointer",
                                  background: isSel ? `${fuel.accent}12` : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${isSel ? `${fuel.accent}44` : "rgba(255,255,255,0.08)"}`,
                                  transition: "all 0.15s",
                                }}
                              >
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{station.name}</p>
                                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{station.address}</p>
                                </div>
                                {isSel && <CheckCircle2 style={{ width: 16, height: 16, color: fuel.accent, flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payment method */}
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                          Оплата
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          {(["stars", "crypto"] as const).map((method) => {
                            const isSel = paymentMethod === method;
                            return (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                style={{
                                  flex: 1, padding: "12px", borderRadius: 14, display: "flex", flexDirection: "column",
                                  alignItems: "center", gap: 6, cursor: "pointer",
                                  background: isSel ? `${fuel.accent}15` : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${isSel ? `${fuel.accent}44` : "rgba(255,255,255,0.08)"}`,
                                  transition: "all 0.15s",
                                }}
                              >
                                <span style={{ fontSize: 22 }}>{method === "stars" ? "⭐️" : "💎"}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: isSel ? fuel.accent : "rgba(255,255,255,0.45)" }}>
                                  {method === "stars" ? "Telegram Stars" : "TON / CryptoBot"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price summary card */}
                      {fuelPrice && (
                        <div style={{ ...glassCard(), borderRadius: 16, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Фиксированная цена</p>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                                {Number(fuelPrice).toFixed(2)} ₽/л × {liters} л
                              </p>
                            </div>
                            <p style={{ fontSize: 22, fontWeight: 800, color: "white" }}>
                              {totalRub ? totalRub.toFixed(0) : "—"} ₽
                            </p>
                          </div>
                          {savings90 && (
                            <>
                              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Прогноз экономии / 90 дней</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: "#4ADE80" }}>+{savings90} ₽</p>
                              </div>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2, textAlign: "right" }}>при росте на +8%</p>
                            </>
                          )}
                          {paymentMethod === "stars" && fuelPrice && (
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8, textAlign: "right" }}>
                              ≈ ⭐️ {Math.max(1, Math.ceil((Number(fuelPrice) * liters) / 2))} Stars
                            </p>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        onClick={handlePurchase}
                        disabled={isCreatingOrder || !selectedStation}
                        style={{
                          width: "100%", height: 56, borderRadius: 18, border: "none", cursor: "pointer",
                          background: `linear-gradient(135deg, ${fuel.accent}, ${fuel.accent}cc)`,
                          boxShadow: `0 12px 40px ${fuel.accent}44, 0 0 0 1px ${fuel.accent}33`,
                          color: "white", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 8, opacity: isCreatingOrder || !selectedStation ? 0.6 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {isCreatingOrder ? (
                          <><Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> Создаём счёт…</>
                        ) : (
                          "Заморозить цену"
                        )}
                      </button>
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
