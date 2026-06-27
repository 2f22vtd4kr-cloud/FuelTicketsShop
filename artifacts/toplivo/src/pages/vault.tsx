import { useState } from "react";
import { useListVouchers, useActivateVoucher } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Clock, ShieldCheck, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Voucher } from "@workspace/api-client-react/src/generated/api.schemas";

export default function VaultPage() {
  const { data: vouchers, isLoading, refetch } = useListVouchers();
  const { mutate: activateVoucher, isPending: isActivating } = useActivateVoucher();
  const { toast } = useToast();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

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

  const getUrgencyColor = (expiresAt: string) => {
    const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 7) return "text-red-400";
    if (days < 30) return "text-yellow-400";
    return "text-green-400";
  };

  const activeVouchers = vouchers?.filter(v => v.status === "active") || [];
  const usedVouchers = vouchers?.filter(v => v.status !== "active") || [];

  return (
    <div className="w-full min-h-full p-4 pt-6 pb-24 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сейф</h1>
        <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">{activeVouchers.length} активно</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl glass-panel animate-pulse bg-white/5" />
          ))}
        </div>
      ) : activeVouchers.length === 0 && usedVouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-32 h-32 mb-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Wallet className="w-12 h-12 text-primary opacity-80" />
          </div>
          <h2 className="text-xl font-bold mb-2">У вас пока нет талонов</h2>
          <p className="text-white/50 mb-8 max-w-[250px]">
            Купите первый талон и заморозьте цену на топливо на 90 дней.
          </p>
          <Button className="bg-primary text-white font-bold rounded-xl px-8 h-12">
            Перейти в каталог
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeVouchers.map((voucher, i) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-5 cursor-pointer relative overflow-hidden group"
              onClick={() => setSelectedVoucher(voucher)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-10 -mt-10" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{voucher.fuelType}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/60">{voucher.stationNetwork}</span>
                  </div>
                  <div className="text-2xl font-black text-cyan-400">
                    {voucher.liters} л
                  </div>
                </div>
                <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                  <QrCode className="w-8 h-8 opacity-70" />
                </div>
              </div>

              <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/10">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Заморожено по</div>
                  <div className="font-medium">{voucher.pricePerLiter} ₽/л</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Действует до</div>
                  <div className={`font-medium text-sm flex items-center gap-1 ${getUrgencyColor(voucher.expiresAt)}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(voucher.expiresAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {usedVouchers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-white/50 mb-4 px-1 uppercase tracking-wider">История</h3>
              <div className="flex flex-col gap-3">
                {usedVouchers.map((voucher) => (
                  <div key={voucher.id} className="glass-panel rounded-xl p-4 opacity-50 flex justify-between items-center grayscale">
                    <div>
                      <div className="font-medium">{voucher.fuelType} • {voucher.liters}л</div>
                      <div className="text-xs mt-1">{new Date(voucher.lockedAt).toLocaleDateString("ru-RU")}</div>
                    </div>
                    <div className="text-sm border border-white/20 px-2 py-1 rounded">
                      {voucher.status === "used" ? "Использован" : "Истек"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Voucher Modal with real scannable QR code */}
      <AnimatePresence>
        {selectedVoucher && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              onClick={() => setSelectedVoucher(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-20 bottom-safe-32 z-50 glass-panel rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="p-6 pb-0 flex justify-between items-center">
                <h2 className="text-xl font-bold">Детали талона</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedVoucher(null)}>
                  ✕
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <div className="w-full text-center mb-6">
                  <div className="text-sm text-white/50 mb-1">{selectedVoucher.stationNetwork}</div>
                  <div className="text-4xl font-black mb-2">{selectedVoucher.fuelType}</div>
                  <div className="text-2xl font-bold text-cyan-400">{selectedVoucher.liters} литров</div>
                </div>

                {/* Real scannable QR code */}
                <div className="bg-white rounded-2xl p-5 mb-6 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                  {selectedVoucher.qrCode ? (
                    <QRCodeSVG
                      value={selectedVoucher.qrCode}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-black/30" />
                    </div>
                  )}
                </div>

                {selectedVoucher.qrCode && (
                  <p className="text-[10px] text-white/30 mb-6 font-mono tracking-wider">
                    {selectedVoucher.qrCode}
                  </p>
                )}

                <div className="w-full space-y-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/50">Станция</span>
                    <span className="font-medium text-right max-w-[55%] text-sm">{selectedVoucher.stationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Цена фиксации</span>
                    <span className="font-medium">{selectedVoucher.pricePerLiter} ₽/л</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Действует до</span>
                    <span className={`font-medium ${getUrgencyColor(selectedVoucher.expiresAt)}`}>
                      {new Date(selectedVoucher.expiresAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  {selectedVoucher.savingsAmount && (
                    <div className="flex justify-between pt-3 border-t border-white/10">
                      <span className="text-cyan-400">Сэкономлено</span>
                      <span className="font-bold text-cyan-400">{selectedVoucher.savingsAmount} ₽</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 mt-auto bg-black/20">
                <Button
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg mt-4 shadow-[0_0_20px_rgba(34,211,238,0.4)] border-0"
                >
                  {isActivating ? "Активация..." : "Активировать на кассе"}
                </Button>
                <p className="text-center text-xs text-white/40 mt-3">
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
