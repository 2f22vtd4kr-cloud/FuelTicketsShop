import { useState } from "react";
import { useListVouchers, useActivateVoucher } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Wallet, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Voucher } from "@workspace/api-client-react/src/generated/api.schemas";

const NETWORK_COLORS: Record<string, string> = {
  "Лукойл":         "#DC2626",
  "Газпромнефть":   "#F59E0B",
  "Роснефть":       "#3B82F6",
  "Татнефть":       "#10B981",
  "Shell":          "#EAB308",
  "Сургутнефтегаз": "#8B5CF6",
  "ОПТИ":           "#06B6D4",
};

function networkColor(name?: string | null) {
  return name ? (NETWORK_COLORS[name] ?? "#A855F7") : "#A855F7";
}

function daysLeft(expiresAt: string) {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function urgencyColor(days: number) {
  if (days < 7)  return "#EF4444";
  if (days < 30) return "#F59E0B";
  return "#4ADE80";
}

function glassCard(accent?: string): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
    border: `1px solid ${accent ? `${accent}22` : "rgba(255,255,255,0.07)"}`,
    boxShadow: accent ? `0 0 24px ${accent}10` : "none",
  };
}

type TabKey = "active" | "used" | "expired";

export default function VaultPage() {
  const { data: vouchers, isLoading, refetch } = useListVouchers();
  const { mutate: activateVoucher, isPending: isActivating } = useActivateVoucher();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [tab, setTab] = useState<TabKey>("active");

  const handleActivate = () => {
    if (!selectedVoucher) return;
    activateVoucher({ data: { voucherId: selectedVoucher.id } }, {
      onSuccess: () => {
        toast({ title: "Успешно", description: "Талон активирован! Покажите QR-код кассиру." });
        refetch();
        setSelectedVoucher(null);
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось активировать талон", variant: "destructive" });
      }
    });
  };

  const active  = vouchers?.filter(v => v.status === "active")  ?? [];
  const used    = vouchers?.filter(v => v.status === "used")    ?? [];
  const expired = vouchers?.filter(v => v.status === "expired") ?? [];

  const TAB_LIST: { key: TabKey; label: string; count: number; accent: string }[] = [
    { key: "active",  label: "Активные",       count: active.length,  accent: "#3B82F6" },
    { key: "used",    label: "Использованные", count: used.length,    accent: "#6B7280" },
    { key: "expired", label: "Истёкшие",       count: expired.length, accent: "#6B7280" },
  ];

  const displayList = tab === "active" ? active : tab === "used" ? used : expired;

  const selectedAccent = selectedVoucher ? networkColor(selectedVoucher.stationNetwork) : "#3B82F6";

  return (
    <div style={{ width: "100%", minHeight: "100%", padding: "24px 16px 112px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "white", textTransform: "uppercase" }}>
          СЕЙФ
        </h1>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          {active.length} активных
        </span>
      </div>

      {/* Tab filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 2 }}>
        {TAB_LIST.map(({ key, label, count, accent }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flexShrink: 0, padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
                background: isActive ? `${accent}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? `${accent}55` : "rgba(255,255,255,0.08)"}`,
                color: isActive ? (key === "active" ? "#60A5FA" : "#9CA3AF") : "rgba(255,255,255,0.35)",
                boxShadow: isActive && key === "active" ? `0 0 16px ${accent}20` : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 96, borderRadius: 20, ...glassCard(), animation: "pulse 2s infinite" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && active.length === 0 && used.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, textAlign: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%", background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 0 30px rgba(168,85,247,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
          }}>
            <Wallet style={{ width: 40, height: 40, color: "#A855F7", opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>У вас пока нет талонов</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, maxWidth: 240 }}>
            Купите первый талон и заморозьте цену на топливо на 90 дней.
          </p>
          <button
            onClick={() => setLocation("/catalog")}
            style={{
              padding: "14px 32px", borderRadius: 18, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #A855F7, #7C3AED)",
              boxShadow: "0 12px 40px rgba(168,85,247,0.4)",
              color: "white", fontWeight: 600, fontSize: 15,
            }}
          >
            Перейти в каталог
          </button>
        </div>
      )}

      {/* Voucher list */}
      {!isLoading && (active.length > 0 || used.length > 0 || expired.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayList.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "40px 0" }}>
              Нет талонов в этой категории
            </p>
          )}
          {displayList.map((voucher, i) => {
            const accent = networkColor(voucher.stationNetwork);
            const days = daysLeft(voucher.expiresAt);
            const pct = Math.round((days / 90) * 100);
            const isActive = voucher.status === "active";

            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => isActive && setSelectedVoucher(voucher)}
                style={{
                  ...glassCard(accent),
                  borderRadius: 20, display: "flex", overflow: "hidden",
                  cursor: isActive ? "pointer" : "default",
                  opacity: isActive ? 1 : 0.5,
                  position: "relative",
                }}
              >
                {/* Left network color bar */}
                <div style={{ width: 3, background: accent, flexShrink: 0 }} />

                <div style={{ flex: 1, padding: "16px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      {/* Network badge */}
                      <span style={{
                        display: "inline-block", padding: "3px 9px", borderRadius: 100,
                        background: `${accent}22`, border: `1px solid ${accent}44`,
                        color: accent, fontSize: 10, fontWeight: 600, letterSpacing: 1,
                        textTransform: "uppercase", marginBottom: 8,
                      }}>
                        {voucher.stationNetwork ?? "АЗС"}
                      </span>
                      <p style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
                        {voucher.fuelType} · {voucher.liters} л
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                        {Number(voucher.pricePerLiter).toFixed(2)} ₽/л зафиксировано
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {isActive ? (
                        <div style={{ padding: "6px 8px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <QrCode style={{ width: 22, height: 22, opacity: 0.5 }} />
                        </div>
                      ) : (
                        <span style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 100,
                          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.4)",
                        }}>
                          {voucher.status === "used" ? "Использован" : "Истёк"}
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: 12, color: urgencyColor(days) }}>{days} дн.</span>
                      )}
                    </div>
                  </div>

                  {/* Expiry bar */}
                  {isActive && (
                    <div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 2,
                          background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                          boxShadow: `0 0 8px ${accent}55`,
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Voucher detail bottom sheet */}
      <AnimatePresence>
        {selectedVoucher && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 40 }}
              onClick={() => setSelectedVoucher(null)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
                background: "rgba(10,10,15,0.95)", backdropFilter: "blur(48px)",
                borderRadius: "28px 28px 0 0",
                borderTop: `1px solid ${selectedAccent}33`,
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                padding: "0 0 36px",
                maxHeight: "90dvh",
                overflowY: "auto",
              }}
            >
              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
              </div>

              <div style={{ padding: "0 20px" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 100,
                      background: `${selectedAccent}22`, border: `1px solid ${selectedAccent}44`,
                      color: selectedAccent, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                    }}>
                      {selectedVoucher.stationNetwork ?? "АЗС"}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "white" }}>
                      {selectedVoucher.fuelType} · {selectedVoucher.liters} л
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>

                {/* QR code */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
                  <div style={{
                    background: "rgba(255,255,255,0.97)", borderRadius: 20, padding: 16,
                    boxShadow: `0 0 0 1px ${selectedAccent}44, 0 0 40px ${selectedAccent}33, 0 20px 60px rgba(0,0,0,0.5)`,
                  }}>
                    {selectedVoucher.qrCode ? (
                      <QRCodeSVG value={selectedVoucher.qrCode} size={180} level="M" includeMargin={false} />
                    ) : (
                      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <QrCode style={{ width: 72, height: 72, color: "rgba(0,0,0,0.2)" }} />
                      </div>
                    )}
                  </div>
                  {selectedVoucher.qrCode && (
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginTop: 12 }}>
                      TOPLIVO · {selectedVoucher.id.toString().padStart(6, "0").toUpperCase()}
                    </p>
                  )}
                </div>

                {/* Info strip */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: selectedAccent }}>
                    {Number(selectedVoucher.pricePerLiter).toFixed(2)} ₽/л
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                    {new Date(selectedVoucher.lockedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>

                {/* Expiry bar */}
                {(() => {
                  const days = daysLeft(selectedVoucher.expiresAt);
                  const pct = Math.round((days / 90) * 100);
                  const uColor = urgencyColor(days);
                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          Истекает через {days} {days === 1 ? "день" : days < 5 ? "дня" : "дней"}
                        </span>
                        <span style={{ fontSize: 12, color: selectedAccent, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 2,
                          background: `linear-gradient(90deg, ${selectedAccent}, ${selectedAccent}99)`,
                          boxShadow: `0 0 8px ${selectedAccent}66`,
                        }} />
                      </div>
                    </div>
                  );
                })()}

                {/* Station details */}
                <div style={{ ...glassCard(), borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Станция</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "white", textAlign: "right", maxWidth: "55%" }}>
                      {selectedVoucher.stationName}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Действует до</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: urgencyColor(daysLeft(selectedVoucher.expiresAt)) }}>
                      {new Date(selectedVoucher.expiresAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  {selectedVoucher.savingsAmount && (
                    <>
                      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: "#4ADE80" }}>Сэкономлено</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#4ADE80" }}>{selectedVoucher.savingsAmount} ₽</span>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handleActivate}
                  disabled={isActivating}
                  style={{
                    width: "100%", height: 56, borderRadius: 18, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${selectedAccent}, ${selectedAccent}bb)`,
                    boxShadow: `0 12px 40px ${selectedAccent}44, 0 0 0 1px ${selectedAccent}33`,
                    color: "white", fontWeight: 600, fontSize: 16,
                    opacity: isActivating ? 0.7 : 1, transition: "opacity 0.15s",
                  }}
                >
                  {isActivating ? "Активация…" : "Показать кассиру"}
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
                  Нажмите только когда кассир готов отсканировать код
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
