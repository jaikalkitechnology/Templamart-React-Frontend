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
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================
// Type Definitions
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

  // ============================================================
  // API Calls
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
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Sales":
        return "bg-blue-50 text-blue-700";
      case "Settled":
        return "bg-green-50 text-green-700";
      case "PayOut":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Transaction Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and analyze all wallet transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[180px]"
            placeholder="Select base date"
          />
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <>
          {/* Today Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {selectedDate
                ? `Stats for ${selectedDate}`
                : "Today's Statistics"}
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.today.total_amount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.today.total_count} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.today.success_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.today.success_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.today.pending_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.today.pending_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.today.failed_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.today.failed_amount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Yesterday Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {selectedDate
                ? `Previous Day (${stats.yesterday.date})`
                : "Yesterday's Statistics"}
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold">
                    {formatCurrency(stats.yesterday.total_amount)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.yesterday.total_count} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-green-600">
                    {stats.yesterday.success_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.yesterday.success_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-yellow-600">
                    {stats.yesterday.pending_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.yesterday.pending_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-red-600">
                    {stats.yesterday.failed_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.yesterday.failed_amount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Current Month Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              {selectedDate
                ? `Month Statistics (${stats.current_month.date} onwards)`
                : "Current Month Statistics"}
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold">
                    {formatCurrency(stats.current_month.total_amount)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.current_month.total_count} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-green-600">
                    {stats.current_month.success_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.current_month.success_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-yellow-600">
                    {stats.current_month.pending_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.current_month.pending_amount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-xl font-bold text-red-600">
                    {stats.current_month.failed_count}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stats.current_month.failed_amount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction Trend</CardTitle>
              <CardDescription>Daily transaction statistics</CardDescription>
            </div>
            <Select
              value={trendDays.toString()}
              onValueChange={(v) => setTrendDays(parseInt(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <BarChart
            data={dailyTrend}
            index="date"
            categories={["success_count", "pending_count", "failed_count"]}
            colors={["green", "yellow", "red"]}
            className="h-72"
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by transaction ID, order ID, seller..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={sellerFilter} onValueChange={setSellerFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Seller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem
                      key={seller.seller_id}
                      value={seller.seller_id.toString()}
                    >
                      {seller.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                  <SelectItem value="PayOut">PayOut</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="w-[180px]"
                placeholder="From"
              />

              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="w-[180px]"
                placeholder="To"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {transactions.length} of {totalCount} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Settled</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">
                      {formatDate(txn.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {txn.seller_username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {txn.seller_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(txn.transaction_type)}>
                        {txn.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      <div
                        className={
                          txn.credit_debit === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {txn.credit_debit === "credit" ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(txn.settle_amount)}</TableCell>
                    <TableCell>{formatCurrency(txn.gst)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(txn.status)}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {txn.payIn_mode || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {txn.txn_id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TxnsManagement;