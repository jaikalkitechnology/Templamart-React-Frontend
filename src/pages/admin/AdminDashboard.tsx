import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { 
  DollarSign, Users, ShoppingBag, Package, TrendingUp, 
  UserCheck, FileText, CreditCard, Download, ShoppingCart,
  BarChart3, ShieldCheck, Banknote, Activity
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Types
interface DashboardStats {
  overview: {
    total_users: number;
    total_sellers: number;
    total_products: number;
    total_purchases: number;
    total_downloads: number;
    total_revenue: number;
    monthly_revenue: number;
    today_revenue: number;
    today_signups: number;
    wallet_balance: number;
    payout_balance: number;
    total_payouts: number;
    pending_payouts: number;
  };
  verification: {
    kyc_verified: number;
    kyc_pending: number;
    company_approved: number;
    company_pending: number;
    bank_approved: number;
    bank_pending: number;
  };
  top_products: Array<{
    product_name: string;
    total_sales: number;
    total_downloads: number;
    seller_username: string;
  }>;
  top_sellers: Array<{
    username: string;
    email: string;
    product_count: number;
    total_sales: number;
    total_downloads: number;
  }>;
  recent_transactions: Array<{
    amount: number;
    type: string;
    status: string;
    date: string;
    username: string;
  }>;
  growth_metrics: {
    user_growth: Array<{ date: string; count: number }>;
    revenue_growth: Array<{ date: string; revenue: number }>;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dash/dashboard`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setDashboardData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load dashboard data");
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Real-time overview of marketplace performance, users, and sales.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.overview.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData?.overview.today_revenue || 0)} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.total_users || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.overview.today_signups || 0} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.total_sellers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(dashboardData?.verification.kyc_verified || 0)} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.total_products || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(dashboardData?.overview.total_downloads || 0)} downloads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.overview.wallet_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.overview.payout_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData?.overview.pending_payouts || 0)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.overview.total_purchases || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData?.overview.monthly_revenue || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dashboardData?.verification.kyc_verified || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.verification.kyc_pending || 0} pending KYC
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Platform revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={dashboardData?.growth_metrics.revenue_growth.map(g => ({
                    name: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: g.revenue
                  })) || []}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value: number) => `$${value}`}
                  className="h-72"
                />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={dashboardData?.growth_metrics.user_growth.map(g => ({
                    name: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: g.count
                  })) || []}
                  index="name"
                  categories={["value"]}
                  colors={["green"]}
                  valueFormatter={(value: number) => `${value}`}
                  className="h-72"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  KYC and Company verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart 
                  data={[
                    { name: "KYC Verified", value: dashboardData?.verification.kyc_verified || 0 },
                    { name: "KYC Pending", value: dashboardData?.verification.kyc_pending || 0 },
                    { name: "Company Approved", value: dashboardData?.verification.company_approved || 0 },
                    { name: "Company Pending", value: dashboardData?.verification.company_pending || 0 },
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["green", "yellow", "blue", "red"]}
                  valueFormatter={(value: number) => `${value}`}
                  className="h-72"
                />
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest wallet transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recent_transactions.slice(0, 5).map((txn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium">{txn.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString()} • {txn.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          txn.status === 'success' ? 'bg-green-100 text-green-800' :
                          txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={dashboardData?.growth_metrics.revenue_growth || []}
                      index="date"
                      categories={["revenue"]}
                      colors={["blue"]}
                      className="h-48"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">User Acquisition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={dashboardData?.growth_metrics.user_growth || []}
                      index="date"
                      categories={["count"]}
                      colors={["green"]}
                      className="h-48"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All platform transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recent_transactions.map((txn, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium">{txn.username}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                            {txn.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            txn.status === 'success' ? 'bg-green-100 text-green-800' :
                            txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="top-performers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best selling templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.top_products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Sold by: {product.seller_username}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(product.total_sales)} sales</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(product.total_downloads)} downloads
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Sellers</CardTitle>
                <CardDescription>
                  Most successful sellers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.top_sellers.map((seller, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium">{seller.username}</p>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(seller.total_sales)} sales</p>
                        <p className="text-sm text-muted-foreground">
                          {seller.product_count} products
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;