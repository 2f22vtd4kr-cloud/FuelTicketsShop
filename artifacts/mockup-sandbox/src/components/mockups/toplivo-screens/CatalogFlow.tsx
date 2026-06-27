import React, { useState } from 'react';
import { Map, Grid, PieChart, Shield } from 'lucide-react';

export function CatalogFlow() {
  const [liters, setLiters] = useState(40);
  const pricePerLiter = 58.90;
  const totalPrice = liters * pricePerLiter;
  const savings = Math.round(totalPrice * 0.08);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLiters(Number(e.target.value));
  };

  const setPreset = (val: number) => setLiters(val);

  return (
    <div
      className="relative overflow-hidden flex flex-col font-sans"
      style={{
        width: 390,
        height: 844,
        backgroundColor: '#0A0A0F',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          
          .liter-slider {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
            position: relative;
            z-index: 10;
          }
          .liter-slider:focus {
            outline: none;
          }
          .liter-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 22px;
            width: 22px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
            cursor: pointer;
            margin-top: -8px;
            position: relative;
            z-index: 20;
          }
          .liter-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            border-radius: 3px;
          }
        `}
      </style>

      {/* BACKGROUND CONTENT (Blurred behind sheet) */}
      <div className="absolute inset-0 z-0 flex flex-col p-6 pt-16">
        <div className="text-center mb-10">
          <h1 className="text-white text-[18px] font-bold tracking-widest uppercase">Каталог</h1>
          <p className="text-[12px] font-normal mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Зафиксируй цену сегодня
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Card 1 - Gazpromneft */}
          <div
            className="relative flex items-center p-5 overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.08)'
            }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] rounded-r-full" style={{ backgroundColor: '#F59E0B' }} />
            <div className="flex-1 ml-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#F59E0B]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                  Газпромнефть
                </span>
              </div>
              <div className="text-white font-bold text-lg">АИ-95</div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">58.90 ₽<span className="text-[13px] font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>/л</span></div>
            </div>
          </div>

          {/* Card 2 - Lukoil */}
          <div
            className="relative flex items-center p-5 overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              borderRadius: 22,
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] rounded-r-full" style={{ backgroundColor: '#EF4444' }} />
            <div className="flex-1 ml-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#EF4444]" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                  Лукойл
                </span>
              </div>
              <div className="text-white font-bold text-lg">АИ-95</div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">59.30 ₽<span className="text-[13px] font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>/л</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY filter */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backdropFilter: 'blur(8px) brightness(0.5)',
          backgroundColor: 'rgba(0,0,0,0.1)'
        }}
      />

      {/* BOTTOM SHEET */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{
          height: '68%',
          backgroundColor: 'rgba(10,10,15,0.94)',
          backdropFilter: 'blur(48px)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 72 // room for nav
        }}
      >
        {/* Drag Handle */}
        <div className="mt-3 rounded-full" style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.12)' }} />

        <div className="w-full px-6 flex flex-col flex-1 mt-6">
          
          {/* Progress Stepper */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              2 из 4
            </div>
            <div className="flex gap-1 w-[120px]">
              <div className="h-[2px] flex-1 rounded-[1px]" style={{ backgroundColor: '#F59E0B' }} />
              <div className="h-[2px] flex-1 rounded-[1px]" style={{ backgroundColor: '#F59E0B' }} />
              <div className="h-[2px] flex-1 rounded-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="h-[2px] flex-1 rounded-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          <h2 className="text-[26px] font-bold text-white text-center mt-6 mb-2">Сколько литров?</h2>

          {/* Giant Liter Display */}
          <div className="flex justify-center items-start mt-4 mb-8">
            <span 
              className="text-[72px] font-[800] text-white leading-none tracking-tight"
              style={{ textShadow: '0 0 40px rgba(248,159,11,0.3)' }}
            >
              {liters}
            </span>
            <span className="text-[24px] font-semibold mt-2 ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>л</span>
          </div>

          {/* Custom Slider */}
          <div className="w-full relative mt-2 mb-8 px-2">
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="1"
              value={liters}
              onChange={handleSliderChange}
              className="liter-slider absolute inset-0 w-full"
              style={{
                background: `linear-gradient(to right, #F59E0B 0%, #FBBF24 ${(liters - 10) / 90 * 100}%, rgba(255,255,255,0.08) ${(liters - 10) / 90 * 100}%, rgba(255,255,255,0.08) 100%)`
              }}
            />
          </div>

          {/* Quick Pick Pills */}
          <div className="flex justify-center gap-3 mb-auto mt-2">
            {[20, 40, 60].map(val => {
              const isActive = liters === val;
              return (
                <button
                  key={val}
                  onClick={() => setPreset(val)}
                  className="rounded-[100px] px-[22px] py-[10px] text-[14px] font-[600] transition-all"
                  style={
                    isActive 
                      ? {
                          backgroundColor: 'rgba(249,115,22,0.12)',
                          border: '1px solid rgba(249,115,22,0.4)',
                          color: '#F59E0B',
                          boxShadow: '0 0 16px rgba(249,115,22,0.2)'
                        }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)'
                        }
                  }
                >
                  {val} л
                </button>
              )
            })}
          </div>

          {/* Price Calculation Card */}
          <div 
            className="rounded-[18px] p-[16px_18px] mb-5 mt-6"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)'
            }}
          >
            <div className="flex justify-between items-end mb-1">
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Фиксированная цена</span>
              <span className="text-[18px] font-bold text-white">{totalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {pricePerLiter.toFixed(2)} ₽/л × {liters} л
              </span>
            </div>
            
            <div className="h-[1px] w-full mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
            
            <div className="flex justify-between items-start">
              <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Прогноз экономии / 90 дней
                <div className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>при росте цены на +8%</div>
              </div>
              <div className="text-[13px] font-semibold" style={{ color: '#4ADE80' }}>
                +{savings.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-[10px] pb-6">
            <button 
              className="w-full h-[56px] rounded-[18px] text-white font-[600] text-[16px] flex items-center justify-center transition-transform active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                boxShadow: '0 12px 40px rgba(249,115,22,0.4), 0 0 0 1px rgba(249,115,22,0.2)'
              }}
            >
              Далее →
            </button>
            <button 
              className="w-full h-[48px] rounded-[18px] font-[500] text-[14px] flex items-center justify-center transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)'
              }}
            >
              Назад
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2"
        style={{
          height: 72,
          backgroundColor: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <NavButton icon={<Map size={24} strokeWidth={1.5} />} label="Карта" />
        <NavButton icon={<Grid size={24} strokeWidth={1.5} />} label="Каталог" active />
        <NavButton icon={<PieChart size={24} strokeWidth={1.5} />} label="Аналитика" />
        <NavButton icon={<Shield size={24} strokeWidth={1.5} />} label="Сейф" />
      </div>
    </div>
  );
}

function NavButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1.5 w-16 relative mt-1">
      {active && (
        <div className="absolute -top-4 w-1 h-1 rounded-full" style={{ backgroundColor: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
      )}
      <div style={{ color: active ? '#F59E0B' : 'rgba(255,255,255,0.4)' }}>
        {icon}
      </div>
      <span className="text-[10px] font-medium" style={{ color: active ? '#F59E0B' : 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </button>
  );
}
