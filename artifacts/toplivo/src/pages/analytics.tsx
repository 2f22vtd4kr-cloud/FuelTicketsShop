import { useState } from "react";
import { useGetAnalyticsSummary, useGetSupplyMatrix, useGetPriceHistory } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Droplet, Wallet, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetAnalyticsSummary();
  const { data: matrix, isLoading: isMatrixLoading } = useGetSupplyMatrix();
  const { data: priceHistory, isLoading: isHistoryLoading } = useGetPriceHistory({ fuelType: "ai95", days: 30 });

  return (
    <div className="w-full min-h-full p-4 pt-6 pb-24 flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Аналитика рынка</h1>
        <BarChart3 className="w-6 h-6 text-primary" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-4 rounded-2xl border-cyan-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-xl rounded-full" />
          <Wallet className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="text-2xl font-black text-white mb-1">
            {summary?.totalSavings ? `${(summary.totalSavings / 1000000).toFixed(1)}M` : "--"} ₽
          </div>
          <div className="text-xs text-white/60">Сэкономлено пользователями</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-4 rounded-2xl border-red-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-xl rounded-full" />
          <TrendingUp className="w-5 h-5 text-red-400 mb-2" />
          <div className="text-2xl font-black text-white mb-1">
            +{summary?.priceGrowthSinceLock ? summary.priceGrowthSinceLock.toFixed(1) : "--"}%
          </div>
          <div className="text-xs text-white/60">Рост цен за 30 дней</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 rounded-2xl"
        >
          <Droplet className="w-5 h-5 text-primary mb-2" />
          <div className="text-xl font-bold text-white mb-1">
            {summary?.totalLiters ? `${(summary.totalLiters / 1000).toFixed(1)}k` : "--"} л
          </div>
          <div className="text-xs text-white/60">Заморожено литров</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-4 rounded-2xl"
        >
          <Users className="w-5 h-5 text-green-400 mb-2" />
          <div className="text-xl font-bold text-white mb-1">
            {summary?.activeVouchers || "--"}
          </div>
          <div className="text-xs text-white/60">Активных талонов</div>
        </motion.div>
      </div>

      {/* Price Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-panel p-5 rounded-2xl"
      >
        <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Динамика цен АИ-95</h3>
        <div className="h-[200px] w-full">
          {isHistoryLoading ? (
            <div className="w-full h-full flex items-center justify-center text-white/50">Загрузка графика...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickFormatter={(val) => `${val} ₽`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#22D3EE', fontWeight: 'bold' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="price" stroke="#22D3EE" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#22D3EE" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Market Comparison Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-white/5 to-primary/10 border-primary/20"
      >
        <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Если бы вы покупали по рынку...</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-white/50 mb-1">Рыночная цена АИ-95</div>
              <div className="text-lg font-bold text-red-400">
                {summary?.marketPriceAi95?.toFixed(2) || "--"} ₽/л
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 mb-1">Замороженная цена</div>
              <div className="text-xl font-black text-cyan-400">
                {summary?.lockedPriceAi95?.toFixed(2) || "--"} ₽/л
              </div>
            </div>
          </div>
          
          <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
            <div className="bg-cyan-400 h-full" style={{ width: '85%' }} />
            <div className="bg-red-400 h-full" style={{ width: '15%' }} />
          </div>
          
          <p className="text-xs text-white/60 text-center">
            Разница составляет <span className="text-primary font-bold">~{summary?.avgSavingsPercent?.toFixed(1) || "--"}%</span> экономии
          </p>
        </div>
      </motion.div>

      {/* Supply Matrix */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold mb-4">Доступность по сетям</h3>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-white/50 bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Сеть</th>
                  <th className="px-4 py-3 text-center">92</th>
                  <th className="px-4 py-3 text-center">95</th>
                  <th className="px-4 py-3 text-center">98</th>
                  <th className="px-4 py-3 text-center">ДТ</th>
                </tr>
              </thead>
              <tbody>
                {isMatrixLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/50">Загрузка данных...</td>
                  </tr>
                ) : matrix?.map((row, i) => (
                  <tr key={row.network} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.networkColor || '#FFF' }} />
                      {row.network}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusDot status={row.ai92} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusDot status={row.ai95} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusDot status={row.ai98} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusDot status={row.diesel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const getColors = () => {
    switch(status) {
      case 'available': return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
      case 'low': return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
      case 'unavailable': return "bg-red-500/50";
      default: return "bg-white/20";
    }
  };
  
  return (
    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${getColors()}`} title={status} />
  );
}
