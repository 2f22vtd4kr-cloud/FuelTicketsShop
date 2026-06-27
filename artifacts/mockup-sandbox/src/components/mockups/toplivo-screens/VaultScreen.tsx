import React, { useState } from 'react';
import { Map, Grid, BarChart3, Lock, X } from 'lucide-react';

const QRCodeSVG = () => {
  // Generate a deterministic 21x21 QR code pattern
  const size = 21;
  const grid = Array(size).fill(0).map(() => Array(size).fill(0));

  // Helper to draw a finder pattern
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
        const isInner = (y >= 2 && y <= 4) && (x >= 2 && x <= 4);
        if (isOuter || isInner) {
          grid[startY + y][startX + x] = 1;
        }
      }
    }
  };

  // Draw 3 finder patterns
  drawFinder(0, 0); // Top-left
  drawFinder(14, 0); // Top-right
  drawFinder(0, 14); // Bottom-left

  // Fill remaining cells with pseudo-random data (deterministic)
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip finder areas
      if ((x < 8 && y < 8) || (x > 13 && y < 8) || (x < 8 && y > 13)) {
        continue;
      }
      // 60% fill probability for data cells
      if (random() < 0.6) {
        grid[y][x] = 1;
      }
    }
  }

  const rects = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000000" />);
      }
    }
  }

  return (
    <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="#FFFFFF" />
      {rects}
    </svg>
  );
};

export function VaultScreen() {
  const [activeTab, setActiveTab] = useState('active');
  const [sheetOpen, setSheetOpen] = useState(true);

  return (
    <div 
      className="relative w-full max-w-[390px] h-[844px] overflow-hidden mx-auto font-sans"
      style={{
        backgroundColor: '#0A0A0F',
        color: 'white',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .vault-container * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="vault-container relative w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="px-6 pt-14 pb-4 flex items-center justify-between z-10">
          <h1 className="text-[18px] font-bold tracking-[2px]">СЕЙФ</h1>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>3 активных</span>
        </div>

        {/* Filters */}
        <div className="px-6 pb-6 flex gap-3 overflow-x-auto no-scrollbar z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button 
            onClick={() => setActiveTab('active')}
            className="whitespace-nowrap rounded-full transition-all duration-300"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: activeTab === 'active' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === 'active' ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === 'active' ? '#60A5FA' : 'rgba(255,255,255,0.35)',
              boxShadow: activeTab === 'active' ? '0 0 16px rgba(59,130,246,0.15)' : 'none'
            }}
          >
            Активные
          </button>
          <button 
            onClick={() => setActiveTab('used')}
            className="whitespace-nowrap rounded-full transition-all duration-300"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: activeTab === 'used' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === 'used' ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === 'used' ? '#60A5FA' : 'rgba(255,255,255,0.35)',
            }}
          >
            Использованные
          </button>
          <button 
            onClick={() => setActiveTab('expired')}
            className="whitespace-nowrap rounded-full transition-all duration-300"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: activeTab === 'expired' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === 'expired' ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === 'expired' ? '#60A5FA' : 'rgba(255,255,255,0.35)',
            }}
          >
            Истёкшие
          </button>
        </div>

        {/* Voucher List */}
        <div 
          className="flex-1 px-6 flex flex-col gap-4 overflow-y-auto transition-all duration-500"
          style={{
            filter: sheetOpen ? 'blur(6px) brightness(0.5)' : 'none',
            transform: sheetOpen ? 'scale(0.96) translateY(-10px)' : 'none',
            paddingBottom: '100px' // Space for bottom nav
          }}
        >
          {/* Card 1 */}
          <div 
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setSheetOpen(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 18px',
              borderColor: 'rgba(220,38,38,0.15)',
              boxShadow: 'inset 0 0 20px rgba(220,38,38,0.06)'
            }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: '#DC2626', borderRadius: '2px' }}
            />
            <div className="flex justify-between items-center mb-3">
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[1.2px]"
                style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#FCA5A5' }}
              >
                ЛУКОЙЛ
              </span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>67 дн.</span>
            </div>
            <div className="text-[16px] font-semibold mb-1">АИ-95 · 40 л</div>
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>58.90 ₽/л зафиксировано</div>
          </div>

          {/* Card 2 */}
          <div 
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setSheetOpen(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 18px',
              borderColor: 'rgba(245,158,11,0.15)',
              boxShadow: 'inset 0 0 20px rgba(245,158,11,0.06)'
            }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: '#F59E0B', borderRadius: '2px' }}
            />
            <div className="flex justify-between items-center mb-3">
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[1.2px]"
                style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#FCD34D' }}
              >
                ГАЗПРОМНЕФТЬ
              </span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>31 дн.</span>
            </div>
            <div className="text-[16px] font-semibold mb-1">АИ-92 · 60 л</div>
            <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>51.20 ₽/л зафиксировано</div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div 
          className="absolute bottom-0 w-full flex items-center justify-around z-10"
          style={{
            height: '72px',
            backgroundColor: 'rgba(10,10,15,0.9)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div className="flex flex-col items-center gap-1 opacity-40">
            <Map size={20} />
            <span className="text-[10px]">Карта</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <Grid size={20} />
            <span className="text-[10px]">Каталог</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <BarChart3 size={20} />
            <span className="text-[10px]">Аналитика</span>
          </div>
          <div className="flex flex-col items-center gap-1 relative" style={{ color: '#60A5FA' }}>
            <div className="absolute -top-3 w-1 h-1 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
            <Lock size={20} />
            <span className="text-[10px]">Сейф</span>
          </div>
        </div>

        {/* Overlay for Bottom Sheet */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: sheetOpen ? 1 : 0
          }}
        />

        {/* Expanded Voucher Bottom Sheet */}
        <div 
          className="absolute bottom-0 w-full z-30 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            height: '62%',
            backgroundColor: 'rgba(10,10,15,0.95)',
            backdropFilter: 'blur(48px)',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            borderTop: '1px solid rgba(59,130,246,0.2)',
            transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
          }}
        >
          <div className="flex flex-col items-center h-full px-6 py-4">
            {/* Drag Handle & Close */}
            <div className="w-full flex justify-center relative mb-6">
              <div 
                className="w-[40px] h-[4px] rounded-full cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                onClick={() => setSheetOpen(false)}
              />
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-50 hover:opacity-100"
                onClick={() => setSheetOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Header Row */}
            <div className="w-full flex justify-between items-center mb-8">
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[1.2px]"
                style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}
              >
                РОСНЕФТЬ
              </span>
              <span className="text-[16px] font-semibold text-white">АИ-98 · 30 л</span>
            </div>

            {/* QR Code Centrepiece */}
            <div 
              className="relative rounded-[20px] p-[16px] mb-6 flex items-center justify-center"
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 0 0 1px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.2), 0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <QRCodeSVG />
            </div>

            {/* Voucher Code */}
            <div 
              className="mb-8 text-center text-[12px] tracking-[3px]"
              style={{
                fontFamily: '"Courier New", Courier, monospace',
                color: 'rgba(255,255,255,0.3)'
              }}
            >
              TOPLIVO · A7B3C9
            </div>

            {/* Info Strip */}
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[14px] font-semibold" style={{ color: '#60A5FA' }}>65.10 ₽/л</span>
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>15.06.2026</span>
            </div>

            {/* Expiry Bar */}
            <div className="w-full mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Истекает через 45 дней</span>
                <span className="text-[12px]" style={{ color: '#60A5FA' }}>50%</span>
              </div>
              <div 
                className="w-full h-[4px] rounded-full relative overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[50%] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                    boxShadow: '0 0 8px rgba(59,130,246,0.5)'
                  }}
                />
              </div>
            </div>

            {/* CTA */}
            <button 
              className="w-full h-[56px] rounded-[18px] text-white font-semibold text-[16px] transition-transform active:scale-95 mt-auto"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                boxShadow: '0 12px 40px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.2)'
              }}
            >
              Показать кассиру
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
