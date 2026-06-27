import { BottomNav } from "./bottom-nav";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0A0A0F] text-white flex flex-col relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth relative z-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
