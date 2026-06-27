import React, { useState } from 'react';

export function MapScreen() {
  const [sheetOpen, setSheetOpen] = useState(true);

  return (
    <div className="relative w-[390px] h-[844px] overflow-hidden bg-[#0A0A0A] font-['Inter',system-ui,sans-serif] text-white">
      {/* Map Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #1a1a24 0%, #0a0a0a 100%)',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            radial-gradient(circle at 50% 40%, #1a1a24 0%, #0A0A0A 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%',
          backgroundPosition: 'center center'
        }}
      >
        {/* Markers */}
        <div className="absolute top-[25%] left-[20%] w-3 h-3 rounded-full bg-[#E74C3C] shadow-[0_0_12px_#E74C3C]" />
        <div className="absolute top-[35%] left-[60%] w-3 h-3 rounded-full bg-[#F39C12] shadow-[0_0_12px_#F39C12]" />
        <div className="absolute top-[45%] left-[30%] w-3 h-3 rounded-full bg-[#3498DB] shadow-[0_0_12px_#3498DB]" />
        <div className="absolute top-[20%] left-[80%] w-3 h-3 rounded-full bg-[#F1C40F] shadow-[0_0_12px_#F1C40F]" />
        
        {/* Selected Marker */}
        <div className="absolute top-[40%] left-[45%] w-4 h-4 rounded-full bg-[#C0392B] shadow-[0_0_20px_4px_#C0392B] border-2 border-white" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 pt-14 pb-4 px-6 flex justify-between items-center z-10"
           style={{
             background: 'linear-gradient(180deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0) 100%)'
           }}>
        <h1 className="text-xl font-bold tracking-wider">КАРТА</h1>
        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-[20px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>
      </div>

      {/* Map overlay behind bottom sheet */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 z-20 pointer-events-none"
        style={{ opacity: sheetOpen ? 1 : 0 }}
      />

      {/* Bottom Sheet */}
      <div 
        className="absolute bottom-0 inset-x-0 bg-white/[0.06] backdrop-blur-[20px] border-t border-white/[0.08] rounded-t-[28px] p-6 z-30 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pb-[100px]"
        style={{
          transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setSheetOpen(!sheetOpen)} />

        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-[#E74C3C]/20 border border-[#E74C3C]/30 text-[#E74C3C] text-sm font-medium shadow-[0_0_15px_rgba(231,76,60,0.3)]">
            Лукойл
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">АЗС Лукойл #47</h2>
        <p className="text-white/50 text-sm mb-6">ул. Тверская, 14</p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-white/5 border border-[#E74C3C]/20 shadow-[inset_0_0_10px_rgba(231,76,60,0.1)] flex justify-between items-center">
            <span className="text-white/60 font-medium text-sm">АИ-92</span>
            <span className="font-semibold">54.20₽</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-[#E74C3C]/40 shadow-[inset_0_0_15px_rgba(231,76,60,0.2)] flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E74C3C]/10 to-transparent pointer-events-none" />
            <span className="text-[#E74C3C] font-bold text-sm z-10">АИ-95</span>
            <span className="font-semibold z-10">58.90₽</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-[#E74C3C]/20 shadow-[inset_0_0_10px_rgba(231,76,60,0.1)] flex justify-between items-center">
            <span className="text-white/60 font-medium text-sm">АИ-98</span>
            <span className="font-semibold">65.10₽</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-[#E74C3C]/20 shadow-[inset_0_0_10px_rgba(231,76,60,0.1)] flex justify-between items-center">
            <span className="text-white/60 font-medium text-sm">ДТ</span>
            <span className="font-semibold">62.50₽</span>
          </div>
        </div>

        <button className="w-full py-4 rounded-[24px] bg-gradient-to-r from-[#C0392B] to-[#E74C3C] font-semibold text-lg shadow-[0_8px_24px_rgba(231,76,60,0.4)] transition-transform active:scale-95">
          Купить талон
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 inset-x-0 h-[88px] bg-[#0A0A0A]/80 backdrop-blur-[20px] border-t border-white/[0.08] z-40 flex justify-around items-center px-4 pb-4">
        <div className="flex flex-col items-center gap-1 text-[#E74C3C] cursor-pointer" onClick={() => setSheetOpen(true)}>
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E74C3C] shadow-[0_0_8px_#E74C3C]" />
          </div>
          <span className="text-[10px] font-medium">Карта</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer" onClick={() => setSheetOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="text-[10px] font-medium">Каталог</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span className="text-[10px] font-medium">Аналитика</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span className="text-[10px] font-medium">Сейф</span>
        </div>
      </div>
    </div>
  );
}
