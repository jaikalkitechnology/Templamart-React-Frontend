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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star,
  BarChart3,
  Filter,
  RefreshCw,
  TrendingDown,
  Target,
  Award,
  Trophy,
  Sparkles,
  Zap,
  Activity,
  Clock,
  Layers,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Globe,
  CreditCard,
  User,
  Heart,
  TrendingUp as TrendingUpIcon,
  Crown,
  Coffee,
  Rocket,
  Brain,
  Lightbulb,
  Wallet,
  FileText,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  Package,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

<CurrencyRupeeIcon />


interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  total_earning: number;
  average_order_value: number;
  sales_trend: Array<{
    date: string;
    sales_count: number;
    daily_earning: number;
  }>;
}

interface MonthlyEarning {
  month: string;
  total_earnings: number;
  total_sales: number;
  commission_paid: number;
}

interface ProductAnalytics {
  product_id: number;
  product_name: string;
  total_sales: number;
  total_revenue: number;
  total_downloads: number;
  avg_rating: number;
  total_reviews: number;
  avg_sale_price: number;
  first_sale: string;
  last_sale: string;
  daily_stats: Array<{
    date: string;
    sales_count: number;
    daily_earning: number;
  }>;
  top_buyers: Array<{
    username: string;
    email: string;
    purchase_count: number;
    total_spent: number;
  }>;
}

const SellerAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [view, setView] = useState<"overview" | "products" | "customers" | "insights">("overview");
  const [chartView, setChartView] = useState<"line" | "bar" | "area">("line");
  const [compareMode, setCompareMode] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(false);

  const fetchSalesSummary = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dash/seller/sales/summary?days=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSalesSummary(res.data);
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      toast.error("Failed to load sales data");
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/seller/earnings/monthly`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setMonthlyEarnings(res.data);
    } catch (error) {
      console.error("Error fetching monthly earnings:", error);
      toast.error("Failed to load earnings data");
    }
  };

  const fetchProductAnalytics = async () => {
    try {
      // First get all products
      const productsRes = await axios.get(`${BASE_URL}/dash/seller/products`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      // For each product, fetch analytics
      const analyticsPromises = productsRes.data.map(async (product: any) => {
        try {
          const analyticsRes = await axios.get(
            `${BASE_URL}/dash/seller/products/${product.id}/analytics`,
            {
              headers: { Authorization: `Bearer ${user?.token}` },
            }
          );
          return analyticsRes.data;
        } catch (error) {
          console.error(`Error fetching analytics for product ${product.id}:`, error);
          return null;
        }
      });
      
      const analyticsResults = await Promise.all(analyticsPromises);
      setProductAnalytics(analyticsResults.filter(Boolean));
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      toast.error("Failed to load product analytics");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSalesSummary(),
        fetchMonthlyEarnings(),
        fetchProductAnalytics(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [timeRange]);

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSalesSummary(),
      fetchMonthlyEarnings(),
      fetchProductAnalytics(),
    ]);
    toast.success("Analytics refreshed!");
    setLoading(false);
  };

  const exportAnalytics = () => {
    // Create CSV data
    const csvData = [
      ["Date", "Sales Count", "Daily Earning"],
      ...(salesSummary?.sales_trend.map((day) => [
        day.date,
        day.sales_count,
        day.daily_earning,
      ]) || []),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Analytics exported successfully!");
  };

  const getTopProducts = () => {
    return [...productAnalytics]
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 5);
  };

  // Calculate performance metrics
  const performanceMetrics = [
    { 
      label: "Conversion Rate", 
      value: "0%", 
      trend: "up", 
      change: "+0.0%",
      target: "0.0%",
      icon: Target,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      label: "Avg. Order Value", 
      value: formatCurrency(salesSummary?.average_order_value || 0), 
      trend: "up", 
      change: "0%",
      target: formatCurrency(1500),
      icon: CurrencyRupeeIcon,
      color: "from-green-500 to-emerald-500"
    },
    { 
      label: "Customer Retention", 
      value: "0%", 
      trend: "up", 
      change: "0%",
      target: "0%",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    { 
      label: "Growth Rate", 
      value: "0%", 
      trend: "up", 
      change: "0%",
      target: "0%",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Skeleton Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Skeleton Tabs */}
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Deep insights into your store performance and customer behavior
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportAnalytics} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
                { id: "products", label: "Products", icon: <Layers className="h-4 w-4" /> },
                { id: "customers", label: "Customers", icon: <Users className="h-4 w-4" /> },
                { id: "insights", label: "Insights", icon: <Brain className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 pb-3 px-1 font-medium text-sm transition-colors ${
                    view === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                  onClick={() => setView(tab.id as any)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                    <CurrencyRupeeIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(salesSummary?.total_revenue || 0)}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <p className="text-green-600 font-medium">
                      {formatCurrency(salesSummary?.total_earning || 0)} earned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <p className="text-3xl font-bold">{salesSummary?.total_sales || 0}</p>
                  <p className="text-sm text-gray-500">
                    Avg order: {formatCurrency(salesSummary?.average_order_value || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-medium text-gray-600">Commission</div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {formatCurrency(salesSummary?.total_commission || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Platform fees</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                    <TrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {(salesSummary?.total_sales ? ((salesSummary.total_sales / 100) * 100).toFixed(1) : 0)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold">
                    {(salesSummary?.total_sales ? ((salesSummary.total_sales / 100) * 100).toFixed(1) : 0)}%
                  </p>
                  <p className="text-sm text-gray-500">Based on views</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Key indicators of your store's health and growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color}`}>
                        <metric.icon className="h-4 w-4 text-white" />
                      </div>
                      <Badge variant={metric.trend === "up" ? "default" : "secondary"}>
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Target: {metric.target}</span>
                        <span className={`font-medium ${
                          metric.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overview View */}
          {view === "overview" && (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>
                          Daily sales over the selected period
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={chartView === "line" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartView("line")}
                        >
                          <LineChartIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={chartView === "bar" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartView("bar")}
                        >
                          <BarChartIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFullscreenChart(!fullscreenChart)}
                        >
                          {fullscreenChart ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {/* Mock Chart */}
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <LineChartIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Interactive chart would appear here</p>
                            <p className="text-sm text-gray-400">
                              Showing {timeRange === '7' ? '7-day' : timeRange === '30' ? '30-day' : timeRange === '90' ? '90-day' : 'yearly'} trend
                            </p>
                          </div>
                        </div>
                        
                        {/* Mock trend line */}
                        <div className="absolute bottom-0 left-0 right-0 h-32">
                          <div className="h-full flex items-end">
                            {Array.from({ length: parseInt(timeRange) || 30 }).map((_, i) => {
                              const height = 20 + Math.sin(i * 0.5) * 40 + Math.random() * 30;
                              return (
                                <div
                                  key={i}
                                  className="flex-1 mx-0.5"
                                  style={{ height: `${height}%` }}
                                >
                                  <div className="h-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-500"></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 w-full">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Peak Day</p>
                        <p className="font-bold">{formatCurrency(2450)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Avg. Daily</p>
                        <p className="font-bold">{formatCurrency(salesSummary?.average_order_value || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Growth</p>
                        <p className="font-bold text-green-600">+12.5%</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>

                {/* Monthly Earnings */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Monthly Earnings</CardTitle>
                        <CardDescription>
                          Earnings over the past 6 months
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        <Trophy className="h-3 w-3 mr-1" />
                        Best Month: {formatCurrency(Math.max(...monthlyEarnings.map(m => m.total_earnings)))}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {monthlyEarnings.slice(0, 6).map((month, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                                <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{month.month}</p>
                                <p className="text-sm text-gray-500">{month.total_sales} sales</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(month.total_earnings)}</p>
                              <p className="text-sm text-gray-500">
                                Commission: {formatCurrency(month.commission_paid)}
                              </p>
                            </div>
                          </div>
                          <Progress 
                            value={(month.total_earnings / Math.max(...monthlyEarnings.map(m => m.total_earnings))) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Detailed Performance Analysis</CardTitle>
                      <CardDescription>
                        Comprehensive breakdown of your store metrics
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="compare-mode" className="text-sm">Compare Mode</Label>
                      <Switch
                        id="compare-mode"
                        checked={compareMode}
                        onCheckedChange={setCompareMode}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Sales Performance
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Conversion Rate</span>
                            <span className="font-bold">4.8%</span>
                          </div>
                          <Progress value={4.8} className="h-2" />
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Repeat Purchase Rate</span>
                            <span className="font-bold">32%</span>
                          </div>
                          <Progress value={32} className="h-2" />
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Cart Abandonment</span>
                            <span className="font-bold">18%</span>
                          </div>
                          <Progress value={18} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Customer Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Avg. Lifetime Value</span>
                            <span className="font-bold">₹2,450</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Customer Satisfaction</span>
                            <span className="font-bold">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                        <div className="p-3 bg-cyan-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Referral Rate</span>
                            <span className="font-bold">12%</span>
                          </div>
                          <Progress value={12} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Growth Metrics
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">MoM Growth</span>
                            <span className="font-bold text-green-600">+24.5%</span>
                          </div>
                          <Progress value={24.5} className="h-2" />
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">YoY Growth</span>
                            <span className="font-bold text-green-600">+156%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div className="p-3 bg-violet-50 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Market Share</span>
                            <span className="font-bold">8.3%</span>
                          </div>
                          <Progress value={8.3} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Products View */}
          {view === "products" && (
            <div className="space-y-6">
              {/* Top Products */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Performing Products</CardTitle>
                      <CardDescription>
                        Based on total sales and revenue
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      #1: {getTopProducts()[0]?.product_name || 'No products'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getTopProducts().map((product, index) => (
                      <div 
                        key={product.product_id} 
                        className={`flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer ${
                          selectedProduct === product.product_id ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedProduct(product.product_id)}
                      >
                        <div className="relative">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-r from-yellow-700 to-yellow-600' :
                            'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}>
                            {index < 3 ? (
                              <Trophy className="h-6 w-6 text-white" />
                            ) : (
                              <Package className="h-6 w-6 text-white" />
                            )}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-2 -right-2">
                              <Award className="h-5 w-5 text-amber-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{product.product_name}</p>
                            <Badge variant="secondary">#{index + 1}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <ShoppingBag className="h-3 w-3" />
                              <span>{product.total_sales} sales</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <CurrencyRupeeIcon className="h-3 w-3" />
                              <span>{formatCurrency(product.total_revenue)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 text-amber-500" />
                              <span>{product.avg_rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Product Statistics</CardTitle>
                    <CardDescription>
                      Overall performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Layers className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total Products</p>
                              <p className="text-2xl font-bold">{productAnalytics.length}</p>
                            </div>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Sales</p>
                            <p className="text-2xl font-bold">
                              {productAnalytics.reduce((sum, p) => sum + p.total_sales, 0)}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(productAnalytics.reduce((sum, p) => sum + p.total_revenue, 0))}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Avg. Rating</p>
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="text-2xl font-bold">
                                {(productAnalytics.reduce((sum, p) => sum + p.avg_rating, 0) / 
                                  Math.max(productAnalytics.length, 1)).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Total Downloads</p>
                            <p className="text-2xl font-bold">
                              {productAnalytics.reduce((sum, p) => sum + p.total_downloads, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Product Details */}
                {selectedProduct && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Product Details
                      </CardTitle>
                      <CardDescription>
                        Performance metrics for selected product
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold">
                                {productAnalytics.find(p => p.product_id === selectedProduct)?.product_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                First sale: {formatDate(productAnalytics.find(p => p.product_id === selectedProduct)?.first_sale || '')}
                              </p>
                            </div>
                            <Badge variant="default">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Total Sales</p>
                              <p className="text-xl font-bold">
                                {productAnalytics.find(p => p.product_id === selectedProduct)?.total_sales}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Revenue</p>
                              <p className="text-xl font-bold">
                                {formatCurrency(productAnalytics.find(p => p.product_id === selectedProduct)?.total_revenue || 0)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Rating</p>
                              <p className="text-xl font-bold">
                                {productAnalytics.find(p => p.product_id === selectedProduct)?.avg_rating.toFixed(1)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Downloads</p>
                              <p className="text-xl font-bold">
                                {productAnalytics.find(p => p.product_id === selectedProduct)?.total_downloads}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Customers View */}
          {view === "customers" && (
            <div className="space-y-6">
              {/* Customer Insights */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Insights</CardTitle>
                      <CardDescription>
                        Understand your customer base and behavior
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {productAnalytics.flatMap(p => p.top_buyers).length} unique customers
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold">Customer Distribution</h3>
                              <p className="text-sm text-gray-600">Based on purchase behavior</p>
                            </div>
                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">New Customers</p>
                              <p className="text-2xl font-bold">45%</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">Returning</p>
                              <p className="text-2xl font-bold">35%</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <p className="text-sm text-gray-600">One-time</p>
                              <p className="text-2xl font-bold">20%</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold">Customer Metrics</h3>
                              <p className="text-sm text-gray-600">Key performance indicators</p>
                            </div>
                            <Target className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Customer Retention Rate</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">78%</span>
                                <Badge variant="outline" className="text-green-600">
                                  <ArrowUpRight className="h-3 w-3" />
                                  +12%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Avg. Purchase Frequency</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">2.4</span>
                                <span className="text-sm text-gray-500">per customer</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Customer Lifetime Value</span>
                              <span className="font-bold">{formatCurrency(2450)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Customers */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        Top Customers
                      </h3>
                      <div className="space-y-3">
                        {productAnalytics
                          .flatMap(p => p.top_buyers)
                          .reduce((acc: any[], buyer) => {
                            const existing = acc.find(b => b.email === buyer.email);
                            if (existing) {
                              existing.purchase_count += buyer.purchase_count;
                              existing.total_spent += buyer.total_spent;
                            } else {
                              acc.push({ ...buyer });
                            }
                            return acc;
                          }, [])
                          .sort((a, b) => b.total_spent - a.total_spent)
                          .slice(0, 5)
                          .map((buyer, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {buyer.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{buyer.username}</p>
                                <p className="text-sm text-gray-500 truncate">{buyer.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(buyer.total_spent)}</p>
                                <p className="text-xs text-gray-500">{buyer.purchase_count} purchases</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Insights View */}
          {view === "insights" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Smart recommendations based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold">Growth Opportunities</h3>
                          <p className="text-sm text-gray-600">Potential areas for expansion</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Bundle similar templates for 30% more revenue
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Target weekend promotions for 25% higher conversion
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Expand to mobile templates (growing market)
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold">Performance Tips</h3>
                          <p className="text-sm text-gray-600">Optimize your store performance</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Improve product images for 15% higher CTR
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Add video previews for 40% more engagement
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Optimize pricing during holiday seasons
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Rocket className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold">Quick Wins</h3>
                          <p className="text-sm text-gray-600">Immediate actions to boost sales</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          Run a limited-time discount on top products
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          Send personalized recommendations to top buyers
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          Update product descriptions with SEO keywords
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Coffee className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold">Next Best Actions</h3>
                          <p className="text-sm text-gray-600">Recommended strategies</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Launch Pro Bundle</span>
                            <Badge variant="outline">+30% Revenue</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Combine 3 top templates at 20% discount</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Email Campaign</span>
                            <Badge variant="outline">+15% Sales</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Target customers who viewed but didn't purchase</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Need deeper insights?</h3>
                    <p className="text-gray-600">Upgrade to Pro Analytics for advanced reporting and predictions.</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component for check icon
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default SellerAnalytics;