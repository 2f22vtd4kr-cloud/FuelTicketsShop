import React from "react";

export function VaultScreen() {
  return (
    <div
      className="relative overflow-hidden font-sans"
      style={{
        width: "390px",
        height: "844px",
        backgroundColor: "#0A0A0A",
        color: "#ffffff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">СЕЙФ</h1>
        <span className="text-sm font-medium text-white/50 mb-1">
          3 активных
        </span>
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-3 mb-6 overflow-x-auto no-scrollbar">
        <div className="relative px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white flex items-center gap-1.5 whitespace-nowrap">
          Активные
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,1)] blur-[1px]"></div>
        </div>
        <div className="px-4 py-2 rounded-full bg-transparent text-sm font-medium text-white/40 whitespace-nowrap">
          Использованные
        </div>
        <div className="px-4 py-2 rounded-full bg-transparent text-sm font-medium text-white/40 whitespace-nowrap">
          Истёкшие
        </div>
      </div>

      {/* Vouchers List */}
      <div className="px-6 flex flex-col gap-4">
        {/* Lukoil Card */}
        <div className="relative rounded-[20px] p-5 flex flex-col gap-3 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(236,72,153,0.3)",
            boxShadow: "-10px 0 30px -15px rgba(236,72,153,0.2)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-md"></div>
          
          <div className="flex justify-between items-start">
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-semibold text-pink-500 uppercase tracking-wider">
              Лукойл
            </div>
            <div className="text-xs text-white/40 font-medium">Истекает через 67 дней</div>
          </div>
          
          <div>
            <div className="text-xl font-bold tracking-tight mb-1">АИ-95 · 40 л</div>
            <div className="text-sm text-white/60">58.90 ₽/л зафиксировано</div>
          </div>
        </div>

        {/* Gazpromneft Card */}
        <div className="relative rounded-[20px] p-5 flex flex-col gap-3 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(245,158,11,0.3)",
            boxShadow: "-10px 0 30px -15px rgba(245,158,11,0.2)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-md"></div>
          
          <div className="flex justify-between items-start">
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
              Газпромнефть
            </div>
            <div className="text-xs text-white/40 font-medium">Истекает через 12 дней</div>
          </div>
          
          <div>
            <div className="text-xl font-bold tracking-tight mb-1">АИ-92 · 60 л</div>
            <div className="text-sm text-white/60">54.20 ₽/л зафиксировано</div>
          </div>
        </div>
      </div>

      {/* Expanded Voucher Bottom Sheet Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%] z-20 flex flex-col items-center px-6 pt-3 pb-8"
        style={{
          background: "rgba(15,15,20,0.96)",
          backdropFilter: "blur(40px)",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          borderTop: "1px solid rgba(59,130,246,0.4)",
          boxShadow: "0 -10px 40px -10px rgba(59,130,246,0.15)",
        }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mb-6" />

        {/* Sheet Header */}
        <div className="flex items-center gap-3 w-full mb-8">
          <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-500 uppercase tracking-wider">
            Роснефть
          </div>
          <div className="text-xl font-bold">АИ-98 · 30 л</div>
        </div>

        {/* QR Code Container */}
        <div className="relative p-6 rounded-[24px] mb-4 flex items-center justify-center bg-white/5"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 0 20px rgba(59,130,246,0.1), 0 0 30px rgba(59,130,246,0.2)",
          }}
        >
          <div className="absolute inset-0 rounded-[24px] border border-[#3B82F6] opacity-30 blur-[2px]"></div>
          
          {/* Simulated QR Code via SVG */}
          <svg width="180" height="180" viewBox="0 0 100 100" fill="white" className="opacity-90">
            <rect x="10" y="10" width="20" height="20" />
            <rect x="15" y="15" width="10" height="10" fill="black" />
            <rect x="17.5" y="17.5" width="5" height="5" />

            <rect x="70" y="10" width="20" height="20" />
            <rect x="75" y="15" width="10" height="10" fill="black" />
            <rect x="77.5" y="17.5" width="5" height="5" />

            <rect x="10" y="70" width="20" height="20" />
            <rect x="15" y="75" width="10" height="10" fill="black" />
            <rect x="17.5" y="77.5" width="5" height="5" />

            <rect x="40" y="10" width="5" height="5" />
            <rect x="50" y="10" width="10" height="5" />
            <rect x="40" y="20" width="10" height="5" />
            <rect x="55" y="20" width="5" height="5" />
            
            <rect x="35" y="35" width="5" height="5" />
            <rect x="45" y="35" width="20" height="5" />
            <rect x="70" y="35" width="10" height="5" />
            
            <rect x="10" y="45" width="5" height="5" />
            <rect x="20" y="45" width="15" height="5" />
            <rect x="40" y="45" width="5" height="15" />
            <rect x="50" y="45" width="20" height="5" />
            
            <rect x="10" y="55" width="10" height="5" />
            <rect x="25" y="55" width="5" height="10" />
            
            <rect x="40" y="70" width="15" height="5" />
            <rect x="60" y="70" width="5" height="15" />
            <rect x="70" y="70" width="10" height="5" />
            
            <rect x="40" y="80" width="5" height="10" />
            <rect x="50" y="80" width="5" height="5" />
            <rect x="70" y="80" width="5" height="10" />
            <rect x="80" y="80" width="10" height="5" />
            
            <rect x="35" y="90" width="20" height="5" />
            <rect x="65" y="90" width="25" height="5" />
            
            <rect x="80" y="50" width="10" height="10" />
            <rect x="82.5" y="52.5" width="5" height="5" fill="black" />
          </svg>
        </div>

        {/* Voucher Code */}
        <div className="font-mono text-lg tracking-[0.2em] text-white/60 mb-6 font-semibold">
          TOPLIVO-A7B3C9
        </div>

        {/* Info Row */}
        <div className="w-full flex justify-between items-center mb-5 text-sm">
          <div className="text-white/80 font-medium">65.10 ₽/л</div>
          <div className="text-white/40">Куплено 15.06.2026</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-white/50">Истекает через 45 дней</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-1/2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full py-4 mt-6 rounded-[20px] font-semibold text-lg relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow: "0 10px 25px -5px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          Показать кассиру
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 pb-6 z-30">
        {/* Map Tab */}
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </svg>
          <span className="text-[10px] font-medium">Карта</span>
        </div>
        
        {/* Catalog Tab */}
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
            <path d="M4 10h16" />
            <path d="M10 4v16" />
          </svg>
          <span className="text-[10px] font-medium">Каталог</span>
        </div>

        {/* Vault Tab (Active) */}
        <div className="flex flex-col items-center gap-1.5 text-[#3B82F6] relative">
          <div className="absolute -top-3 w-1 h-1 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span className="text-[10px] font-medium text-white shadow-[#3B82F6]">Сейф</span>
        </div>

        {/* Profile Tab */}
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-[10px] font-medium">Профиль</span>
        </div>
      </div>
    </div>
  );
}
