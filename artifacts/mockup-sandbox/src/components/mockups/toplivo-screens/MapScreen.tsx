import React, { useState } from 'react';

export function MapScreen() {
  const [sheetOpen, setSheetOpen] = useState(true);

  return (
    <div 
      className="relative overflow-hidden selection:bg-purple-500/30"
      style={{
        width: '390px',
        height: '844px',
        backgroundColor: '#0A0A0F',
        fontFamily: '"Inter", sans-serif',
        color: '#FFFFFF'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .map-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        
        .glass-panel {
          background: rgba(10, 10, 15, 0.92);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }
      `}} />

      {/* Map Area */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-in-out map-grid"
        style={{
          filter: sheetOpen ? 'blur(4px) brightness(0.6)' : 'none',
          transform: sheetOpen ? 'scale(0.98)' : 'scale(1)',
          transformOrigin: 'top center'
        }}
      >
        {/* Abstract Roads */}
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/[0.06] -rotate-12 transform origin-left"></div>
        <div className="absolute top-1/3 right-0 w-full h-[1px] bg-white/[0.06] rotate-45 transform origin-right"></div>
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white/[0.06] rotate-12 transform origin-top"></div>

        {/* Markers */}
        {/* Gazpromneft */}
        <div className="absolute top-[20%] left-[60%] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#F59E0B', boxShadow: '0 0 12px 2px rgba(245, 158, 11, 0.4)' }}></div>
        {/* Rosneft */}
        <div className="absolute top-[35%] left-[25%] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#3B82F6', boxShadow: '0 0 12px 2px rgba(59, 130, 246, 0.4)' }}></div>
        {/* Shell */}
        <div className="absolute top-[15%] left-[30%] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#EAB308', boxShadow: '0 0 12px 2px rgba(234, 179, 8, 0.4)' }}></div>
        {/* Lukoil 1 */}
        <div className="absolute top-[45%] left-[75%] w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#DC2626', boxShadow: '0 0 12px 2px rgba(220, 38, 38, 0.4)' }}></div>
        
        {/* Lukoil (Selected) */}
        <div className="absolute top-[38%] left-[48%] flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div className="w-[14px] h-[14px] rounded-full relative z-10" style={{ backgroundColor: '#DC2626', boxShadow: '0 0 16px 4px rgba(220, 38, 38, 0.6)' }}></div>
          <div className="w-[24px] h-[24px] rounded-full absolute border border-[#DC2626]/40 animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>
      </div>

      {/* Top Bar */}
      <div 
        className="absolute top-12 left-4 right-4 flex justify-between items-center z-10 transition-opacity duration-300"
        style={{
          background: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 16px'
        }}
      >
        <span className="text-[16px] font-semibold tracking-wide text-white">КАРТА</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3H13M3 7H11M5 11H9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Info Sheet */}
      <div 
        className="absolute bottom-0 left-0 w-full glass-panel z-20 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)"
        style={{
          height: '56%',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 72px))'
        }}
        onClick={() => !sheetOpen && setSheetOpen(true)}
      >
        <div className="w-full h-full relative px-6 pt-3 pb-[90px] flex flex-col">
          {/* Drag Handle */}
          <div 
            className="w-[36px] h-[4px] rounded-full mx-auto cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            onClick={(e) => { e.stopPropagation(); setSheetOpen(!sheetOpen); }}
          ></div>

          <div className="mt-8 flex flex-col">
            {/* Network Badge */}
            <div 
              className="self-start px-3 py-1 rounded-full font-semibold"
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#DC2626',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}
            >
              ЛУКОЙЛ
            </div>

            {/* Header */}
            <h2 className="text-[22px] font-bold text-white mt-4 tracking-tight">АЗС Лукойл #47</h2>
            <p className="text-[13px] mt-1.5" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>ул. Тверская, 14</p>
          </div>

          {/* Separator */}
          <div className="w-full h-[1px] my-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}></div>

          {/* Fuel Grid */}
          <div className="grid grid-cols-2 gap-2 mb-auto">
            {/* Active Cell */}
            <div 
              className="flex justify-between items-center"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 0 12px rgba(220, 38, 38, 0.15)'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>АИ-95</span>
              <span className="text-[18px] font-bold text-white">55.90</span>
            </div>

            {/* Inactive Cells */}
            <div 
              className="flex justify-between items-center"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>АИ-92</span>
              <span className="text-[18px] font-bold text-white">50.40</span>
            </div>
            
            <div 
              className="flex justify-between items-center"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>АИ-100</span>
              <span className="text-[18px] font-bold text-white">68.10</span>
            </div>
            
            <div 
              className="flex justify-between items-center"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>ДТ</span>
              <span className="text-[18px] font-bold text-white">62.30</span>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="w-full flex items-center justify-center mt-6 transition-transform active:scale-[0.98]"
            style={{
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.35), 0 0 0 1px rgba(220, 38, 38, 0.2)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Купить талон →
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div 
        className="absolute bottom-0 left-0 w-full z-30 flex justify-around items-center px-2 pb-4 pt-2"
        style={{
          height: '72px',
          background: 'rgba(10, 10, 15, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Nav Item: Карта (Active) */}
        <div className="flex flex-col items-center justify-center relative cursor-pointer w-16 h-full">
          <div className="absolute top-0 w-1 h-1 rounded-full" style={{ backgroundColor: '#A855F7', boxShadow: '0 0 8px 1px rgba(168, 85, 247, 0.6)' }}></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
            <path d="M9 4L3 7.5V20.5L9 17L15 20.5L21 17V4L15 7.5L9 4Z" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 4V17" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 7.5V20.5" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] mt-1 font-medium" style={{ color: '#A855F7' }}>Карта</span>
        </div>

        {/* Nav Item: Каталог */}
        <div className="flex flex-col items-center justify-center cursor-pointer w-16 h-full opacity-40 hover:opacity-100 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2"/>
          </svg>
          <span className="text-[10px] mt-1 font-medium text-white">Каталог</span>
        </div>

        {/* Nav Item: Аналитика */}
        <div className="flex flex-col items-center justify-center cursor-pointer w-16 h-full opacity-40 hover:opacity-100 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
            <path d="M3 3V21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 9L14 14L10 10L3 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] mt-1 font-medium text-white">Аналитика</span>
        </div>

        {/* Nav Item: Сейф */}
        <div className="flex flex-col items-center justify-center cursor-pointer w-16 h-full opacity-40 hover:opacity-100 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-1">
            <rect x="3" y="11" width="18" height="10" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] mt-1 font-medium text-white">Сейф</span>
        </div>
      </div>
    </div>
  );
}
