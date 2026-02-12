import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { 
  DollarSign, Users, ShoppingBag, Package, TrendingUp, 
  UserCheck, FileText, CreditCard, Download, ShoppingCart,
  BarChart3, ShieldCheck, Banknote, Activity, TrendingDown,
  ArrowUpRight, ArrowDownRight, Calendar, MoreVertical,
  CheckCircle, Clock, XCircle, Star, Crown, Target, Zap
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Types (unchanged)
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
  const [timeRange, setTimeRange] = useState('7d');
  
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
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Zap className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate some metrics for display
  const revenueGrowth = dashboardData?.growth_metrics.revenue_growth || [];
  const lastRevenue = revenueGrowth[revenueGrowth.length - 1]?.revenue || 0;
  const firstRevenue = revenueGrowth[0]?.revenue || 0;
  const revenueChange = lastRevenue && firstRevenue ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0;

  const userGrowth = dashboardData?.growth_metrics.user_growth || [];
  const lastUsers = userGrowth[userGrowth.length - 1]?.count || 0;
  const firstUsers = userGrowth[0]?.count || 0;
  const userChange = lastUsers && firstUsers ? ((lastUsers - firstUsers) / firstUsers) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.username || 'Admin'}! Here's what's happening with your marketplace today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid - Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Revenue Card */}
          <Card className=" group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.overview.total_revenue || 0)}
                </CardDescription>
                <Badge className={`gap-1 ${revenueChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(revenueChange).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-semibold text-green-600">
                  {formatCurrency(dashboardData?.overview.today_revenue || 0)}
                </span>
                today • 
                <span className="font-semibold text-blue-600">
                  {formatCurrency(dashboardData?.overview.monthly_revenue || 0)}
                </span>
                this month
              </p>
              <Progress value={75} className="h-1 mt-2" />
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.overview.total_users || 0)}
                </CardDescription>
                <Badge className={`gap-1 ${userChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {userChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(userChange).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">
                  {dashboardData?.overview.today_signups || 0}
                </span>
                {" "}new today • 
                <span className="font-semibold text-purple-600 ml-2">
                  {formatNumber(dashboardData?.overview.total_sellers || 0)}
                </span>
                {" "}sellers
              </p>
              <Progress value={60} className="h-1 mt-2" />
            </CardContent>
          </Card>

          {/* Active Products Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
              <CardDescription className="text-2xl font-bold text-gray-900">
                {formatNumber(dashboardData?.overview.total_products || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-emerald-600">
                      {formatNumber(dashboardData?.overview.total_downloads || 0)}
                    </span>
                    {" "}total downloads
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      {formatNumber(dashboardData?.overview.total_purchases || 0)}
                    </span>
                    {" "}total purchases
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* Wallet & Payouts Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4 w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Wallet & Payouts</CardTitle>
              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(dashboardData?.overview.wallet_balance || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(dashboardData?.overview.pending_payouts || 0)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg">
                Process Payouts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Verification Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-700">KYC Verification</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Verified</span>
                        <span className="font-bold">{dashboardData?.verification.kyc_verified || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Pending</span>
                        <span className="font-bold">{dashboardData?.verification.kyc_pending || 0}</span>
                      </div>
                    </div>
                    <Progress 
                      value={dashboardData?.verification.kyc_verified || 0} 
                      max={(dashboardData?.verification.kyc_verified || 0) + (dashboardData?.verification.kyc_pending || 0)}
                      className="h-2 mt-3"
                    />
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-700">Company Verification</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Approved</span>
                        <span className="font-bold">{dashboardData?.verification.company_approved || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Pending</span>
                        <span className="font-bold">{dashboardData?.verification.company_pending || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-700">Bank Verification</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Approved</span>
                        <span className="font-bold">{dashboardData?.verification.bank_approved || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Pending</span>
                        <span className="font-bold">{dashboardData?.verification.bank_pending || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary">Overall Progress</p>
                        <p className="text-sm text-gray-600">Verification completion rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">85%</p>
                        <p className="text-xs text-gray-500">Excellent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency((dashboardData?.overview.total_revenue || 0) / (dashboardData?.overview.total_purchases || 1))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Download Rate</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(((dashboardData?.overview.total_downloads || 0) / (dashboardData?.overview.total_purchases || 1)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Seller Conversion</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(((dashboardData?.overview.total_sellers || 0) / (dashboardData?.overview.total_users || 1)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-auto bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="top-performers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Crown className="w-4 h-4 mr-2" />
              Top Performers
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue Overview</CardTitle>
                      <CardDescription>Platform revenue trends over time</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <LineChart 
                      data={dashboardData?.growth_metrics.revenue_growth.map((g, i) => ({
                        name: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        value: g.revenue,
                        date: g.date
                      })) || []}
                      index="name"
                      categories={["value"]}
                      colors={["#3b82f6"]}
                      valueFormatter={(value: number) => `$${formatNumber(value)}`}
                     // showAnimation={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>New user registrations over time</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <BarChart 
                      data={dashboardData?.growth_metrics.user_growth.map(g => ({
                        name: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        value: g.count
                      })) || []}
                      index="name"
                      categories={["value"]}
                      colors={["#10b981"]}
                      valueFormatter={(value: number) => `${formatNumber(value)} users`}
                      //showAnimation={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>Latest wallet activities</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.recent_transactions.slice(0, 5).map((txn, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {txn.type === 'credit' ? (
                              <ArrowUpRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{txn.username}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(txn.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </p>
                          <Badge className={
                            txn.status === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            txn.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                            'bg-red-100 text-red-800 hover:bg-red-100'
                          }>
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Products</CardTitle>
                      <CardDescription>Best selling templates</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.top_products.slice(0, 4).map((product, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                          <p className="text-sm text-gray-500">By {product.seller_username}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatNumber(product.total_sales)}</p>
                          <p className="text-xs text-gray-500">sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl">
                      <h3 className="font-semibold text-lg mb-4">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Monthly Revenue Goal</span>
                            <span className="text-sm font-semibold">75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">User Growth Target</span>
                            <span className="text-sm font-semibold">90%</span>
                          </div>
                          <Progress value={90} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl">
                      <h3 className="font-semibold text-lg mb-4">Platform Health</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-green-600">98.7%</div>
                          <p className="text-sm text-gray-600 mt-1">Uptime</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">1.2s</div>
                          <p className="text-sm text-gray-600 mt-1">Avg. Response</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Revenue Distribution</h3>
                    <div className="h-64">
                      <PieChart 
                        data={[
                          { name: "Product Sales", value: 65 },
                          { name: "Subscriptions", value: 20 },
                          { name: "Services", value: 10 },
                          { name: "Other", value: 5 },
                        ]}
                        index="name"
                        categories={["value"]}
                        colors={["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]}
                        valueFormatter={(value: number) => `${value}%`}
                        //showAnimation={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All platform transactions and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <div className="min-w-full">
                    <div className="bg-gray-50 grid grid-cols-12 px-6 py-3 border-b">
                      <div className="col-span-2 text-sm font-medium text-gray-700">Date & Time</div>
                      <div className="col-span-3 text-sm font-medium text-gray-700">User</div>
                      <div className="col-span-2 text-sm font-medium text-gray-700">Type</div>
                      <div className="col-span-2 text-sm font-medium text-gray-700">Amount</div>
                      <div className="col-span-2 text-sm font-medium text-gray-700">Status</div>
                      <div className="col-span-1 text-sm font-medium text-gray-700"></div>
                    </div>
                    <div>
                      {dashboardData?.recent_transactions.map((txn, index) => (
                        <div key={index} className="grid grid-cols-12 items-center px-6 py-4 border-b hover:bg-gray-50 transition-colors">
                          <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(txn.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="font-medium text-gray-900">{txn.username}</div>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline" className={
                              txn.type === 'credit' ? 'border-green-200 text-green-700 bg-green-50' :
                              'border-red-200 text-red-700 bg-red-50'
                            }>
                              {txn.type}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <div className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                txn.status === 'success' ? 'bg-green-500' :
                                txn.status === 'pending' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                              <span className="capitalize">{txn.status}</span>
                            </div>
                          </div>
                          <div className="col-span-1 text-right">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Performers Tab */}
          <TabsContent value="top-performers" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Top Products
                      </CardTitle>
                      <CardDescription>Best selling templates by revenue</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">View Rankings</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.top_products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          {index < 3 && (
                            <Crown className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{product.product_name}</h4>
                          <p className="text-sm text-gray-500">By {product.seller_username}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatNumber(product.total_sales)} sales</div>
                          <div className="text-sm text-gray-500">{formatNumber(product.total_downloads)} downloads</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Sellers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-500" />
                        Top Sellers
                      </CardTitle>
                      <CardDescription>Most successful sellers by revenue</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.top_sellers.map((seller, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {seller.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{seller.username}</h4>
                          <p className="text-sm text-gray-500 truncate">{seller.email}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {seller.product_count} products
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {formatNumber(seller.total_downloads)} downloads
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatNumber(seller.total_sales)}</div>
                          <div className="text-sm text-gray-500">sales</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                Real-time Data
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                Auto-refresh: 5min
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;