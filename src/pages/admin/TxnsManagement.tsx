import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, BarChart } from "@/components/ui/charts";
import {
  Search,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  BarChart3,
  User,
  Wallet,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// ============================================================
// Type Definitions (unchanged)
// ============================================================

interface DailyStats {
  date: string;
  total_amount: number;
  total_count: number;
  success_count: number;
  pending_count: number;
  failed_count: number;
  success_amount: number;
  pending_amount: number;
  failed_amount: number;
}

interface TransactionStats {
  today: DailyStats;
  yesterday: DailyStats;
  current_month: DailyStats;
}

interface TransactionItem {
  id: number;
  txn_id: string;
  order_id: string | null;
  seller_id: number;
  seller_username: string;
  seller_email: string;
  transaction_type: string;
  credit_debit: string;
  amount: number;
  settle_amount: number;
  balance_amount: number;
  gst: number;
  status: string;
  description: string | null;
  reference_id: string | null;
  payIn_mode: string | null;
  created_at: string;
}

interface SellerOption {
  seller_id: number;
  username: string;
  email: string;
}

interface DailyTrendItem {
  date: string;
  total_amount: number;
  total_count: number;
  success_count: number;
  pending_count: number;
  failed_count: number;
}

// ============================================================
// Main Component
// ============================================================

const TxnsManagement = () => {
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);

  // Filters
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Chart settings
  const [trendDays, setTrendDays] = useState(30);
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================
  // API Calls (unchanged)
  // ============================================================

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (sellerFilter !== "all") params.seller_id = sellerFilter;
      if (selectedDate) params.selected_date = selectedDate;

      const res = await axios.get(`${BASE_URL}/dash/transactions/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchTransactions = async () => {
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (sellerFilter !== "all") params.seller_id = sellerFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.transaction_type = typeFilter;
      if (dateRange.from) params.start_date = dateRange.from;
      if (dateRange.to) params.end_date = dateRange.to;
      if (search) params.search = search;

      const res = await axios.get(`${BASE_URL}/dash/transactions/list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });

      setTransactions(res.data.transactions);
      setTotalCount(res.data.total_count);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/transactions/sellers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellers(res.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchDailyTrend = async () => {
    try {
      const params: any = { days: trendDays };
      if (sellerFilter !== "all") params.seller_id = sellerFilter;
      if (typeFilter !== "all") params.transaction_type = typeFilter;

      const res = await axios.get(`${BASE_URL}/dash/transactions/daily-trend`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setDailyTrend(res.data);
    } catch (error) {
      console.error("Error fetching daily trend:", error);
    }
  };

  const exportTransactions = async () => {
    try {
      const params: any = {};
      if (sellerFilter !== "all") params.seller_id = sellerFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.transaction_type = typeFilter;
      if (dateRange.from) params.start_date = dateRange.from;
      if (dateRange.to) params.end_date = dateRange.to;

      const res = await axios.get(`${BASE_URL}/dash/transactions/export`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });

      const data = res.data.data;
      if (data.length === 0) {
        toast.warning("No data to export");
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row: any) =>
          headers
            .map((header) => {
              const value = row[header];
              if (
                typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Transactions exported successfully");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions");
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchSellers(), fetchDailyTrend(), fetchTransactions()]);
    setLoading(false);
    toast.success("Data refreshed successfully");
  };

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchSellers(), fetchDailyTrend()]);
      await fetchTransactions();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchStats();
      fetchDailyTrend();
    }
  }, [sellerFilter, selectedDate, trendDays, typeFilter]);

  useEffect(() => {
    if (!loading) {
      fetchTransactions();
    }
  }, [
    currentPage,
    sellerFilter,
    statusFilter,
    typeFilter,
    dateRange,
    search,
  ]);

  // ============================================================
  // Helpers
  // ============================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Sales":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Settled":
        return "bg-green-100 text-green-800 border-green-200";
      case "PayOut":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendPercentage = () => {
    if (!stats || stats.yesterday.total_amount === 0) return 0;
    const change = ((stats.today.total_amount - stats.yesterday.total_amount) / stats.yesterday.total_amount) * 100;
    return parseFloat(change.toFixed(1));
  };

  const getSuccessRate = () => {
    if (!stats || stats.today.total_count === 0) return 0;
    return Math.round((stats.today.success_count / stats.today.total_count) * 100);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // ============================================================
  // Render
  // ============================================================

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Wallet className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Transaction Management
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and analyze all wallet transactions in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={refreshAllData}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg"
              onClick={exportTransactions}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Main Stats Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {selectedDate ? `Stats for ${selectedDate}` : "Today's Overview"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{formatCurrency(stats.today.total_amount).replace('$', '')}
                      </span>
                      <Badge className={`gap-1 ${getTrendPercentage() >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {getTrendPercentage() >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(getTrendPercentage())}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{stats.today.success_count}</div>
                    <p className="text-xs text-gray-500 mt-1">Success</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{stats.today.pending_count}</div>
                    <p className="text-xs text-gray-500 mt-1">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-red-600">{stats.today.failed_count}</div>
                    <p className="text-xs text-gray-500 mt-1">Failed</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span className="font-semibold">{getSuccessRate()}%</span>
                  </div>
                  <Progress value={getSuccessRate()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Comparison Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-600">Yesterday</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    ₹{formatCurrency(stats.yesterday.total_amount).replace('$', '')}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{stats.yesterday.total_count} transactions</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    ₹{formatCurrency(stats.current_month.total_amount).replace('$', '')}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{stats.current_month.total_count} transactions</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-lg transition-all duration-300 col-span-2">
                <div className="absolute top-4 right-4 w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-amber-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-600">Amount Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-green-600">
                        ₹{formatCurrency(stats.today.success_amount).replace('$', '')}
                      </div>
                      <p className="text-xs text-gray-500">Successful</p>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-yellow-600">
                        ₹{formatCurrency(stats.today.pending_amount).replace('$', '')}
                      </div>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-red-600">
                        ₹{formatCurrency(stats.today.failed_amount).replace('$', '')}
                      </div>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Date Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Date Filter</p>
                  <p className="text-sm text-gray-500">Select a date to view specific day statistics</p>
                </div>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Trend Chart */}
       <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Transaction Amount Trend</CardTitle>
                <CardDescription>
                  Daily transaction amounts over the past {trendDays} days
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={trendDays.toString()}
                  onValueChange={(value) => setTrendDays(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="15">Last 15 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="60">Last 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart
              data={dailyTrend.map((item) => ({
                date: item.date,
                total_amount: item.total_amount,
              }))}
              index="date"
              categories={["total_amount"]}
              colors={["#3b82f6"]}
              valueFormatter={(value: number) => `₹${formatCurrency(value).replace('$', '')}`}
              //showAnimation={true}
            />

                         
          </CardContent>
        </Card>

        {/* Filters Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <p className="font-medium">Advanced Filters</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSellerFilter("all");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setDateRange({ from: "", to: "" });
                      setSearch("");
                    }}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="ID, seller, order..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Seller</label>
                    <Select value={sellerFilter} onValueChange={setSellerFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Sellers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sellers</SelectItem>
                        {sellers.map((seller) => (
                          <SelectItem
                            key={seller.seller_id}
                            value={seller.seller_id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              {seller.username}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            Success
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-yellow-600" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="failed">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Failed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Settled">Settled</SelectItem>
                        <SelectItem value="PayOut">PayOut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date Range - From</label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                      placeholder="Start date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date Range - To</label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Showing {transactions.length} of {totalCount} transactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Wallet className="w-3 h-3" />
                  {totalCount} Total
                </Badge>
                <Badge className="gap-1 bg-gradient-to-r from-primary to-primary/80">
                  <IndianRupee className="w-3 h-3" />
                  {stats ? `₹${formatCurrency(stats.today.total_amount).replace('$', '')}` : '₹0'} Today
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <div className="min-w-full">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 grid grid-cols-12 px-6 py-4 border-b">
                  <div className="col-span-2 text-sm font-semibold text-gray-700">Date & Time</div>
                  <div className="col-span-2 text-sm font-semibold text-gray-700">Seller</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">Type</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">Amount</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">Settled</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">GST</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">Status</div>
                  <div className="col-span-2 text-sm font-semibold text-gray-700">Payment Mode</div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700"></div>
                </div>
                <div>
                  {transactions.map((txn) => (
                    <div key={txn.id} className="grid grid-cols-12 items-center px-6 py-4 border-b hover:bg-gray-50 transition-colors group">
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(txn.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(txn.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {txn.seller_username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{txn.seller_username}</div>
                            <div className="text-xs text-gray-500 truncate">{txn.seller_email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Badge className={`${getTypeColor(txn.transaction_type)} text-xs`}>
                          {txn.transaction_type}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          {txn.credit_debit === "credit" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`font-bold ${txn.credit_debit === "credit" ? "text-green-600" : "text-red-600"}`}>
                            ₹{formatCurrency(txn.amount).replace('$', '')}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{formatCurrency(txn.settle_amount).replace('$', '')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm text-gray-600">
                          ₹{formatCurrency(txn.gst).replace('$', '')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Badge className={`${getStatusColor(txn.status)} text-xs`}>
                          <div className="flex items-center gap-1">
                            {txn.status === "success" && <CheckCircle className="w-3 h-3" />}
                            {txn.status === "pending" && <Clock className="w-3 h-3" />}
                            {txn.status === "failed" && <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{txn.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          {txn.payIn_mode ? (
                            <Badge variant="outline" className="text-xs">
                              {txn.payIn_mode}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalCount} transactions found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronUp className="w-4 h-4 rotate-90" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronUp className="w-4 h-4 -rotate-90" />
                  </Button>
                </div>
              </div>
            )}

            {/* No Results */}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters to find what you're looking for.</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSellerFilter("all");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setDateRange({ from: "", to: "" });
                    setSearch("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TxnsManagement;