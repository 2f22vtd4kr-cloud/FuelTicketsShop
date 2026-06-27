import { useState } from "react";
import { 
  useGetAdminStats, 
  useListAdminUsers, 
  useListAdminVouchers, 
  useSendBroadcast 
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, Wallet, Activity, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/context/user";

export default function AdminPage() {
  const { user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsAuthenticated(true);
    } else {
      toast({ title: "Ошибка", description: "Неверный PIN-код", variant: "destructive" });
      setPin("");
    }
  };

  if (!user?.isAdmin && !isAuthenticated) {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl w-full max-w-sm flex flex-col items-center border-primary/20"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Доступ ограничен</h2>
          <p className="text-white/50 text-center mb-6 text-sm">
            Введите PIN-код администратора для доступа к панели управления
          </p>
          <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="text-center text-2xl tracking-widest h-14 bg-black/50 border-white/10"
              autoFocus
            />
            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
              Войти
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetAdminStats();
  const { data: usersData, isLoading: isLoadingUsers } = useListAdminUsers();
  const { data: vouchers, isLoading: isLoadingVouchers } = useListAdminVouchers();
  const { mutate: sendBroadcast, isPending: isBroadcasting } = useSendBroadcast();
  const { toast } = useToast();

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const handleBroadcast = () => {
    if (!message.trim()) return;
    
    sendBroadcast({ data: { message } }, {
      onSuccess: (res) => {
        toast({ title: "Успешно", description: `Отправлено ${res.sent} пользователям` });
        setMessage("");
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось отправить рассылку", variant: "destructive" });
      }
    });
  };

  const users = Array.isArray(usersData) ? usersData : [];
  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(search.toLowerCase()) || 
    (u.username && u.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-full p-4 pt-6 pb-24 flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Панель управления</h1>
        <Shield className="w-6 h-6 text-primary" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-4 rounded-2xl">
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-2xl font-black">{stats?.totalUsers || 0}</div>
          <div className="text-xs text-white/50">Пользователей</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <Wallet className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="text-2xl font-black">{stats?.totalVouchers || 0}</div>
          <div className="text-xs text-white/50">Всего талонов</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
          <div className="text-2xl font-black">{stats?.activeVouchers || 0}</div>
          <div className="text-xs text-white/50">Активных талонов</div>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-primary/20 bg-primary/5">
          <Activity className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-black text-primary">
            {stats?.totalRevenue ? `${(stats.totalRevenue / 1000).toFixed(1)}k` : "0"} ₽
          </div>
          <div className="text-xs text-white/50">Оборот</div>
        </div>
      </div>

      {/* Broadcast */}
      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Рассылка</h3>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Текст сообщения для всех пользователей..."
          className="bg-black/30 border-white/10 resize-none min-h-[100px] mb-3"
        />
        <Button 
          onClick={handleBroadcast} 
          disabled={isBroadcasting || !message.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
        >
          {isBroadcasting ? "Отправка..." : "Отправить всем"}
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Users Table */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Пользователи</h3>
        <Input 
          placeholder="Поиск по имени или @username..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black/30 border-white/10"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-white/50 bg-white/5">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">ID</th>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Талонов</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-white/50">Загрузка...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-white/50">Не найдено</td></tr>
              ) : (
                filteredUsers.slice(0, 5).map(u => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/50">{u.id}</td>
                    <td className="px-4 py-3 font-medium">
                      {u.firstName} {u.lastName}
                      {u.username && <div className="text-xs text-white/50">@{u.username}</div>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-400">
                      {u.totalVouchers || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
