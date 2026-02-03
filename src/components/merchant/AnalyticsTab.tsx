import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Package, DollarSign, Users, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shop } from "@/contexts/MarketplaceContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalyticsTabProps {
  shop: Shop;
  allShops?: Shop[];
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  dailyOrders: { date: string; count: number; revenue: number }[];
  productSales: { name: string; quantity: number; revenue: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AnalyticsTab({ shop, allShops }: AnalyticsTabProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [shop.id, allShops, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get all bag IDs for this shop (or all shops if allShops provided)
      const shopIds = allShops ? allShops.map(s => s.id) : [shop.id];
      const allBagIds = allShops 
        ? allShops.flatMap(s => s.inventory.map(i => i.id))
        : shop.inventory.map(i => i.id);

      if (allBagIds.length === 0) {
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          dailyOrders: [],
          productSales: [],
        });
        setLoading(false);
        return;
      }

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      if (timeRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date('2020-01-01');
      }

      // Fetch orders for these bags
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .in("bag_id", allBagIds)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch bag details for pricing
      const { data: bags } = await supabase
        .from("mystery_bags")
        .select("*")
        .in("id", allBagIds);

      const bagPrices = new Map(bags?.map(b => [b.id, b.discounted_price]) || []);

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'picked_up').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (bagPrices.get(o.bag_id) || 0), 0) || 0;

      // Daily orders aggregation
      const dailyMap = new Map<string, { count: number; revenue: number }>();
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = dailyMap.get(date) || { count: 0, revenue: 0 };
        dailyMap.set(date, {
          count: existing.count + 1,
          revenue: existing.revenue + (bagPrices.get(order.bag_id) || 0),
        });
      });

      const dailyOrders = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .reverse()
        .slice(-7);

      // Product sales breakdown
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      orders?.forEach(order => {
        const bagId = order.bag_id;
        const price = bagPrices.get(bagId) || 0;
        const existing = productMap.get(bagId) || { quantity: 0, revenue: 0 };
        productMap.set(bagId, {
          quantity: existing.quantity + 1,
          revenue: existing.revenue + price,
        });
      });

      const productSales = Array.from(productMap.entries()).map(([bagId, data]) => ({
        name: `Mystery Bag`,
        ...data,
      }));

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        dailyOrders,
        productSales,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {range === 'week' ? t('analytics.lastWeek') : range === 'month' ? t('analytics.lastMonth') : t('analytics.allTime')}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{t('analytics.totalOrders')}</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">{t('analytics.revenue')}</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground">{t('analytics.pending')}</span>
          </div>
          <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">{t('analytics.completed')}</span>
          </div>
          <p className="text-2xl font-bold">{stats?.completedOrders || 0}</p>
        </div>
      </div>

      {/* Sales Chart */}
      {stats && stats.dailyOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t('analytics.dailySales')}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value, t('analytics.orders')]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {stats && stats.dailyOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border-2 border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            {t('analytics.revenueChart')}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatPrice(value), t('analytics.revenue')]}
                />
                <Bar dataKey="revenue" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats && stats.totalOrders === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('analytics.noData')}</p>
          <p className="text-sm mt-2">{t('analytics.startSelling')}</p>
        </div>
      )}
    </div>
  );
}