import { Link, useLocation } from "wouter";
import { Map, List, LineChart, Wallet, Shield } from "lucide-react";
import { useUser } from "@/lib/context/user";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useUser();

  const navItems = [
    { href: "/", icon: Map, label: "Карта" },
    { href: "/catalog", icon: List, label: "Каталог" },
    { href: "/analytics", icon: LineChart, label: "Аналитика" },
    { href: "/vault", icon: Wallet, label: "Сейф" },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", icon: Shield, label: "Админ" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-b-0 border-x-0 border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
