// seller/dashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Download,
  Users,
  TrendingUp,
  CreditCard,
  BarChart3,
  FileText,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Star,
  Activity,
  TrendingDown,
  RefreshCw,
  Upload,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Target,
  Trophy,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExternalLink,
  ChevronRight,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MoreVertical,
  Filter,
  Layers,
  Cpu,
  PieChart,
  LineChart,
  BarChart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

interface DashboardStats {
  stats: {
    products: {
      total: number;
      active: number;
      avg_rating: number;
    };
    sales: {
      total: number;
      recent: number;
      total_revenue: number;
      recent_earning: number;
    };
    downloads: number;
    wallet: {
      balance: number;
      payout_balance: number;
      pending_payouts: number;
    };
  };
  recent_sales: Array<{
    purchase_id: string;
    customer_name?: string;
    customer_email?: string;
    total_amount: number;
    commission: number;
    earning: number;
    purchase_date: string;
    items: Array<{
      product_name: string;
      quantity: number;
      price_per_unit: number;
    }>;
  }>;
  top_products: Array<{
    name: string;
    sales: number;
    downloads: number;
    rating: number;
  }>;
  recent_reviews: Array<{
    product_name: string;
    rating: number;
    comment?: string;
    date: string;
  }>;
  kyc_status?: {
    verified: boolean;
    document_type?: string;
  };
}

interface SalesTrend {
  date: string;
  sales_count: number;
  daily_earning: number;
}


// Types
export interface SellerTxnProduct {
  product_id: number;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export interface SellerTxnProduct {
  product_id: number;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}
export interface SellerOrderTxn {
  order_id: string;
  order_status: string;
  txn_id?: string;
  total_amount: number;
  purchase_date: string;
  buyer_name?: string;
  buyer_email?: string;
  wallet_txn_id: number;
  amount: number;
  gst?: number | null;
  settled_amount?: number | null;
  balance_amount?: number | null;
  platform_fee?: number | null;
  products: SellerTxnProduct[];
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedChart, setSelectedChart] = useState("revenue");
  const [sellerTransactions, setSellerTransactions] = useState<SellerOrderTxn[]>([]);
  const fetchSellerOrderTxn = async () => {
    try {
      // Fetch recent 10 transactions
      const params = new URLSearchParams({
        skip: '0',
        limit: '10'
      });

      const res = await axios.get(
        `${BASE_URL}/dash/seller/seller_transactions?${params}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );

      setSellerTransactions(res.data || []);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dash/seller/dashboard`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setDashboardData(res.data);
      
      // Fetch sales trend separately
      const trendRes = await axios.get(
        `${BASE_URL}/dash/seller/sales/summary?days=${timeRange === '7days' ? 7 : 30}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSalesTrend(trendRes.data.sales_trend || []);
      toast.success("Dashboard updated!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load dashboard");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshDashboard = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSellerOrderTxn();
    // Refresh every 2 minutes
    const interval = setInterval(fetchDashboardData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock data for demonstration
  const performanceMetrics = [
    { label: "Conversion Rate", value: "0.0%", trend: "up", change: "+0.0%" },
    { label: "Avg. Order Value", value: "₹ 0", trend: "up", change: "+0%" },
    { label: "Customer Satisfaction", value: "0%", trend: "stable", change: "0%" },
    { label: "Return Rate", value: "0%", trend: "down", change: "-0.0%" },
  ];

  const quickActions = [
    { title: "Upload Template", icon: Upload, href: "/seller/templates/new", color: "from-purple-500 to-blue-500" },
    { title: "View Analytics", icon: BarChart3, href: "/seller/analytics", color: "from-green-500 to-emerald-500" },
    { title: "Manage Products", icon: Package, href: "/seller/templates", color: "from-amber-500 to-orange-500" },
    { title: "Withdraw Funds", icon: CreditCard, href: "/seller/wallet", color: "from-pink-500 to-rose-500" },
  ];

  const systemStatus = [
    { label: "API Status", status: "operational", color: "bg-green-500" },
    { label: "Payment Gateway", status: "operational", color: "bg-green-500" },
    { label: "File Storage", status: "operational", color: "bg-green-500" },
    { label: "KYC Verification", status: dashboardData?.kyc_status?.verified ? "verified" : "pending", color: dashboardData?.kyc_status?.verified ? "bg-green-500" : "bg-yellow-500" },
  ];

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-gray-400">Preparing all the insights</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = dashboardData?.stats.sales.total_revenue || 0;
  const totalSales = dashboardData?.stats.sales.total || 0;
  const recentEarning = dashboardData?.stats.sales.recent_earning || 0;
  const recentSales = dashboardData?.stats.sales.recent || 0;
  const activeProducts = dashboardData?.stats.products.active || 0;
  const totalProducts = dashboardData?.stats.products.total || 0;
  const totalDownloads = dashboardData?.stats.downloads || 0;
  const avgRating = dashboardData?.stats.products.avg_rating || 0;
  
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = totalDownloads > 0 ? (totalSales / totalDownloads) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your store today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {timeRange === '7days' ? 'Last 7 days' : 'Last 30 days'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimeRange("7days")}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange("30days")}>
                  Last 30 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KYC Alert */}
        {dashboardData?.kyc_status && !dashboardData.kyc_status.verified && (
          <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <AlertDescription className="text-amber-800">
                  Complete KYC verification to enable all seller features and faster payouts.
                  <Link to="/seller/kyc" className="ml-2 font-semibold underline">
                    Verify Now →
                  </Link>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <CurrencyRupeeIcon className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                {recentEarning > 0 ? "+0%" : "0%"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">
                  +{formatCurrency(recentEarning)} recent
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sales Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-white">
                <Target className="h-3 w-3 mr-1" />
                Target: 100
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold">{totalSales}</p>
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">
                  +{recentSales} recent sales
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Products Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-3xl font-bold">{activeProducts}</p>
              <p className="text-sm text-gray-500">
                {totalProducts} total • {((activeProducts / totalProducts) * 100).toFixed(0)}% active
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Downloads Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Download className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="bg-white">
                {conversionRate.toFixed(1)}% CVR
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold">{totalDownloads}</p>
              <div className="text-sm text-gray-500">
                {Math.round(totalDownloads / 30)} avg/month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Sales and revenue trends over time
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedChart === "revenue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChart("revenue")}
                >
                  Revenue
                </Button>
                <Button
                  variant={selectedChart === "sales" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChart("sales")}
                >
                  Sales
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {/* Mock Chart - In production, use Recharts or similar */}
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Interactive chart would appear here</p>
                    <p className="text-sm text-gray-400">Showing {timeRange === '7days' ? '7-day' : '30-day'} trend</p>
                  </div>
                </div>
                
                {/* Mock trend line */}
                <div className="absolute bottom-0 left-0 right-0 h-32">
                  <div className="h-full flex items-end">
                    <div className="h-1/3 w-1/12 bg-purple-300 mx-0.5 rounded-t-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="text-center">
                <p className="text-sm text-gray-500">Avg. Daily Earning</p>
                <p className="font-bold">{formatCurrency(totalRevenue / (timeRange === '7days' ? 7 : 30))}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Best Day</p>
                <p className="font-bold">{formatCurrency(Math.max(...salesTrend.map(d => d.daily_earning)))}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Growth</p>
                <p className="font-bold text-green-600">+0%</p>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Wallet & Performance */}
        <div className="space-y-6">
          {/* Wallet Balance */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Available Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(dashboardData?.stats.wallet.balance || 0)}</p>
                  </div>
                </div>
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Payout Wallet</span>
                  <span className="font-medium">{formatCurrency(dashboardData?.stats.wallet.payout_balance || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Pending</span>
                  <span className="font-medium">{formatCurrency(dashboardData?.stats.wallet.pending_payouts || 0)}</span>
                </div>
              </div>
              <Button className="w-full mt-6 bg-white text-gray-900 hover:bg-gray-100">
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="font-bold">{metric.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress 
                        value={
                          metric.label === "Conversion Rate" ? 0 :
                          metric.label === "Avg. Order Value" ? 0 :
                          metric.label === "Customer Satisfaction" ? 0 :
                          0
                        } 
                        className="h-2"
                      />
                    </div>
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : metric.trend === "down" ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
              </div>
              <Link to="/seller/sales">
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
         <CardContent>
        <div className="space-y-4">
          {sellerTransactions?.slice(0, 5).map((sale, index) => (
            <div 
              key={sale.wallet_txn_id || index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {(sale.buyer_name || 'C')[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {sale.buyer_name || `Customer ${sale.order_id.slice(0, 8)}`}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(sale.purchase_date)}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-green-600">
                  +{formatCurrency(sale.settled_amount || 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(sale.total_amount)}
                </p>
              </div>
            </div>
          ))}
          
          {(!sellerTransactions || sellerTransactions.length === 0) && (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No recent sales</p>
              <p className="text-sm text-gray-400 mt-1">Sales will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing templates</CardDescription>
              </div>
              <Badge variant="secondary">This month</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.top_products.slice(0, 4).map((product, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ShoppingBag className="h-3 w-3" />
                        {product.sales}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Download className="h-3 w-3" />
                        {product.downloads}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {product.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!dashboardData?.top_products || dashboardData.top_products.length === 0) && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No product data</p>
                  <p className="text-sm text-gray-400 mt-1">Upload templates to see analytics</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Link to="/seller/templates" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Layers className="h-4 w-4" />
                View All Products
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.href}>
                    <Card className="border hover:shadow-md transition-all duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`p-3 rounded-full bg-gradient-to-r ${action.color}`}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium">{action.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{status.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${status.color}`}></div>
                      <span className="text-sm font-medium capitalize">{status.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reviews */}
      {dashboardData?.recent_reviews && dashboardData.recent_reviews.length > 0 && (
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Customer Reviews</CardTitle>
                <CardDescription>Feedback from your customers</CardDescription>
              </div>
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                {avgRating.toFixed(1)} avg rating
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.recent_reviews.slice(0, 4).map((review, index) => (
                <Card key={index} className="border hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-600">
                          <Star className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(review.rating)
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 font-bold">{review.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{review.product_name}</p>
                        {review.comment && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Banner */}
      <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Ready to scale your business?</h3>
                <p className="text-gray-600">Upgrade to Pro Seller for advanced analytics and priority support.</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerDashboard;