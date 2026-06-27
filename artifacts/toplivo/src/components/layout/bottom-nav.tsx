import { Link, useLocation } from "wouter";
import { Map, List, LineChart, Wallet, Shield } from "lucide-react";
import { useUser } from "@/lib/context/user";

const NAV_ACCENT: Record<string, string> = {
  "/":          "#A855F7",
  "/catalog":   "#F59E0B",
  "/analytics": "#22D3EE",
  "/vault":     "#3B82F6",
  "/admin":     "#EF4444",
};

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useUser();

  const navItems = [
    { href: "/",          icon: Map,       label: "Карта"     },
    { href: "/catalog",   icon: List,      label: "Каталог"   },
    { href: "/analytics", icon: LineChart, label: "Аналитика" },
    { href: "/vault",     icon: Wallet,    label: "Сейф"      },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", icon: Shield, label: "Админ" });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-x-0 border-b-0 pb-safe"
      style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-around h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const accent = NAV_ACCENT[item.href] ?? "#A855F7";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? accent : "rgba(255,255,255,0.35)" }}
                />
                {isActive && (
                  <div
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? accent : "rgba(255,255,255,0.3)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
