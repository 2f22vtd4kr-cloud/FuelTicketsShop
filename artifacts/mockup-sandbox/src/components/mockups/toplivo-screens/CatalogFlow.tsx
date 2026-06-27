import React from "react";
import { 
  Menu, 
  Search, 
  MapPin, 
  Droplet, 
  Wallet, 
  User,
  ChevronRight,
  TrendingUp,
  CreditCard,
  History,
  Settings,
  ChevronLeft
} from "lucide-react";

export function CatalogFlow() {
  return (
    <div className="relative w-[390px] h-[844px] bg-[#0A0A0A] overflow-hidden font-sans text-white border border-white/10 shadow-2xl mx-auto flex flex-col">
      {/* BACKGROUND CONTENT (Blurred) */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Header */}
        <div className="px-6 pt-14 pb-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            КАТАЛОГ
          </h1>
          <p className="text-white/50 text-sm mt-1">Зафиксируй цену сегодня</p>
        </div>

        {/* Cards Grid */}
        <div className="px-6 grid gap-4">
          {/* Card 1: Gazpromneft */}
          <div className="relative p-5 rounded-[24px] bg-white/5 border border-[#F59E0B]/30 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">Газпромнефть</h3>
                <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30">
                  <span className="text-[#F59E0B] text-xs font-medium">АИ-95</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">58.90<span className="text-lg text-white/60">₽</span></div>
                <div className="text-xs text-white/40 mt-1">за литр</div>
              </div>
            </div>
          </div>

          {/* Card 2: Lukoil */}
          <div className="relative p-5 rounded-[24px] bg-white/5 border border-[#E11D48]/30 overflow-hidden shadow-[0_0_30px_rgba(225,29,72,0.15)] backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">Лукойл</h3>
                <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-[#E11D48]/20 border border-[#E11D48]/30">
                  <span className="text-[#E11D48] text-xs font-medium">АИ-92</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">54.20<span className="text-lg text-white/60">₽</span></div>
                <div className="text-xs text-white/40 mt-1">за литр</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav (Blurred) */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#0A0A0A]/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 pb-6">
          <div className="flex flex-col items-center gap-1 opacity-50">
            <MapPin size={24} className="text-white" />
            <span className="text-[10px]">Карта</span>
          </div>
          <div className="flex flex-col items-center gap-1 relative">
            <div className="absolute -top-1 right-2 w-1.5 h-1.5 bg-[#F59E0B] rounded-full shadow-[0_0_8px_#F59E0B]" />
            <Droplet size={24} className="text-[#F59E0B]" />
            <span className="text-[10px] text-[#F59E0B]">Каталог</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <Wallet size={24} className="text-white" />
            <span className="text-[10px]">Талоны</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <User size={24} className="text-white" />
            <span className="text-[10px]">Профиль</span>
          </div>
        </div>
      </div>

      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[12px] z-10" />

      {/* BOTTOM SHEET */}
      <div className="absolute bottom-0 left-0 right-0 h-[600px] bg-[rgba(18,18,18,0.95)] backdrop-blur-[20px] border border-white/10 rounded-t-[28px] z-20 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-4">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="px-6 flex-1 flex flex-col">
          {/* Step Badge */}
          <div className="flex justify-center mb-6">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70">
              2 из 4
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">Сколько литров?</h2>

          {/* Large Number */}
          <div className="text-center mb-10">
            <div className="text-[64px] font-bold leading-none tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-end justify-center gap-2">
              40 <span className="text-3xl text-white/50 mb-2">л</span>
            </div>
          </div>

          {/* Slider */}
          <div className="relative h-2 bg-white/10 rounded-full mb-12">
            <div className="absolute left-0 top-0 bottom-0 w-[40%] bg-gradient-to-r from-[#D97706] to-[#F59E0B] rounded-full shadow-[0_0_15px_#F59E0B]" />
            <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            </div>
          </div>

          {/* Quick Picks */}
          <div className="flex gap-3 mb-10">
            <button className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium transition-all">
              20 л
            </button>
            <button className="flex-1 py-3 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] text-white text-sm font-medium transition-all">
              40 л
            </button>
            <button className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium transition-all">
              60 л
            </button>
          </div>

          {/* Price Calculation Card */}
          <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 mb-8 space-y-3 backdrop-blur-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">Фиксированная цена</span>
              <span className="text-white font-medium text-base">2 356 ₽</span>
            </div>
            <div className="text-xs text-white/40 flex justify-between">
              <span>58.90 ₽/л × 40 л</span>
            </div>
            <div className="h-px w-full bg-white/10 my-1" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#10B981]" />
                Прогноз экономии
              </span>
              <span className="text-[#10B981] font-medium text-base">+189 ₽</span>
            </div>
            <div className="text-xs text-white/40 flex justify-between">
              <span>~+8% за 90 дней</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-auto pb-8 space-y-3">
            <button className="w-full py-4 rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] flex justify-center items-center gap-2">
              Далее <ChevronRight size={20} />
            </button>
            <button className="w-full py-4 rounded-full bg-transparent border border-white/10 text-white/60 font-medium flex justify-center items-center">
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
