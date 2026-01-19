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
import { LineChart } from "@/components/ui/charts";
import { 
  Download, 
  Search, 
  Wallet,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  User
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================
// Type Definitions
// ============================================================

interface SellerWalletSummary {
  seller_id: number;
  username: string;
  email: string;
  wallet_balance: number;
  payout_wallet_balance: number;
  total_balance: number;
  total_sales: number;
  total_settled: number;
  total_payout: number;
  pending_settlement: number;
  transaction_count: number;
  last_transaction_date: string | null;
}

interface SellerDetail {
  seller_id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
}

interface TransactionReport {
  txn_id: string;
  order_id: string;
  purchase_id: string;
  buyer_id: number;
  buyer_username: string;
  buyer_email: string;
  seller_id: number;
  seller_username: string;
  seller_email: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  settle_amount: number;
  gst: number;
  transaction_type: string;
  credit_debit: string;
  status: string;
  payment_mode: string;
  purchase_date: string;
  created_at: string;
}

interface SellerStatistics {
  total_sales: number;
  total_settled: number;
  total_payout: number;
  pending_settlement: number;
  wallet_balance: number;
  payout_wallet_balance: number;
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_gst_collected: number;
  average_order_value: number;
  success_rate: number;
}

interface RevenueTrend {
  date: string;
  revenue: number;
  transactions: number;
  settled: number;
  payout: number;
}

// ============================================================
// Main Component
// ============================================================

const SalesManagement = () => {
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "seller-detail">("overview");
  
  // Sellers overview
  const [sellersOverview, setSellersOverview] = useState<SellerWalletSummary[]>([]);
  const [sellersList, setSellersList] = useState<SellerDetail[]>([]);
  const [searchSeller, setSearchSeller] = useState("");
  
  // Selected seller
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [selectedSellerData, setSelectedSellerData] = useState<SellerWalletSummary | null>(null);
  const [sellerStats, setSellerStats] = useState<SellerStatistics | null>(null);
  const [sellerTransactions, setSellerTransactions] = useState<TransactionReport[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  
  // Filters for seller transactions
  const [txnSearch, setTxnSearch] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [trendDays, setTrendDays] = useState(30);

  // ============================================================
  // API Calls
  // ============================================================

  const fetchSellersOverview = async () => {
    try {
      const params: any = {};
      if (searchSeller) {
        params.search = searchSeller;
      }

      const res = await axios.get(`${BASE_URL}/dash/sales/sellers-overview`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setSellersOverview(res.data);
    } catch (error) {
      console.error("Error fetching sellers overview:", error);
      toast.error("Failed to load sellers overview");
    }
  };

  const fetchSellersList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/sales/sellers-list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellersList(res.data);
    } catch (error) {
      console.error("Error fetching sellers list:", error);
    }
  };

  const fetchSellerStats = async (sellerId: number) => {
    try {
      const params: any = {};
      if (dateRange.from) params.start_date = dateRange.from;
      if (dateRange.to) params.end_date = dateRange.to;

      const res = await axios.get(`${BASE_URL}/dash/sales/seller-stats/${sellerId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setSellerStats(res.data);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      toast.error("Failed to load seller statistics");
    }
  };

  const fetchSellerTransactions = async (sellerId: number) => {
    try {
      const params: any = {
        limit: 100,
        offset: 0,
      };
      
      if (txnTypeFilter !== "all") params.transaction_type = txnTypeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateRange.from) params.start_date = dateRange.from;
      if (dateRange.to) params.end_date = dateRange.to;

      const res = await axios.get(`${BASE_URL}/dash/sales/seller-transactions/${sellerId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setSellerTransactions(res.data);
    } catch (error) {
      console.error("Error fetching seller transactions:", error);
      toast.error("Failed to load transactions");
    }
  };

  const fetchSellerRevenueTrend = async (sellerId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/sales/seller-revenue-trend/${sellerId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params: { days: trendDays },
      });
      setRevenueTrend(res.data);
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      toast.error("Failed to load revenue trend");
    }
  };

  const exportSellerReport = async (sellerId: number) => {
    try {
      const params: any = {};
      if (dateRange.from) params.start_date = dateRange.from;
      if (dateRange.to) params.end_date = dateRange.to;
      if (txnTypeFilter !== "all") params.transaction_type = txnTypeFilter;

      const res = await axios.get(`${BASE_URL}/dash/sales/seller-export/${sellerId}`, {
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
        headers.join(','),
        ...data.map((row: any) =>
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seller-${res.data.seller_name}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSellersOverview(),
        fetchSellersList(),
      ]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchSellersOverview();
    }
  }, [searchSeller]);

  useEffect(() => {
    if (selectedSellerId) {
      fetchSellerStats(selectedSellerId);
      fetchSellerTransactions(selectedSellerId);
      fetchSellerRevenueTrend(selectedSellerId);
    }
  }, [selectedSellerId, txnTypeFilter, statusFilter, dateRange]);

  useEffect(() => {
    if (selectedSellerId) {
      fetchSellerRevenueTrend(selectedSellerId);
    }
  }, [trendDays]);

  // ============================================================
  // Handlers
  // ============================================================

  const handleSelectSeller = (sellerId: number) => {
    const seller = sellersOverview.find(s => s.seller_id === sellerId);
    setSelectedSellerId(sellerId);
    setSelectedSellerData(seller || null);
    setView("seller-detail");
  };

  const handleBackToOverview = () => {
    setView("overview");
    setSelectedSellerId(null);
    setSelectedSellerData(null);
    setSellerStats(null);
    setSellerTransactions([]);
    setRevenueTrend([]);
    setTxnSearch("");
    setTxnTypeFilter("all");
    setStatusFilter("all");
    setDateRange({ from: "", to: "" });
  };

  // ============================================================
  // Filters
  // ============================================================

  const filteredTransactions = sellerTransactions.filter(txn => {
    if (txnSearch === "") return true;
    const search = txnSearch.toLowerCase();
    return (
      txn.buyer_username.toLowerCase().includes(search) ||
      txn.buyer_email.toLowerCase().includes(search) ||
      txn.txn_id.toLowerCase().includes(search) ||
      txn.order_id.toLowerCase().includes(search) ||
      txn.product_name.toLowerCase().includes(search)
    );
  });

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

  // ============================================================
  // OVERVIEW VIEW - All Sellers with Wallets
  // ============================================================

  if (view === "overview") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Management</h2>
          <p className="text-muted-foreground">
            View all sellers and their wallet balances
          </p>
        </div>

        {/* Quick Seller Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Seller Selection</CardTitle>
            <CardDescription>Select a seller to view detailed statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => handleSelectSeller(parseInt(value))}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a seller..." />
              </SelectTrigger>
              <SelectContent>
                {sellersList.map((seller) => (
                  <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                    {seller.username} ({seller.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Search Sellers */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sellers by username or email..."
                value={searchSeller}
                onChange={(e) => setSearchSeller(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sellers Overview Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sellers Overview</CardTitle>
            <CardDescription>
              {sellersOverview.length} sellers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead>Payout Wallet</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Settled</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellersOverview.map((seller) => (
                    <TableRow key={seller.seller_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{seller.username}</p>
                          <p className="text-sm text-muted-foreground">{seller.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {formatCurrency(seller.wallet_balance)}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(seller.payout_wallet_balance)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(seller.total_balance)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(seller.total_sales)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(seller.total_settled)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {formatCurrency(seller.pending_settlement)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {seller.transaction_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectSeller(seller.seller_id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // SELLER DETAIL VIEW - Selected Seller Statistics
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToOverview}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          {selectedSellerData && (
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {selectedSellerData.username}
              </h2>
              <p className="text-muted-foreground">{selectedSellerData.email}</p>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => selectedSellerId && exportSellerReport(selectedSellerId)}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Wallet Balance Cards */}
      {sellerStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(sellerStats.wallet_balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Main wallet balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                Payout Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(sellerStats.payout_wallet_balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available for payout</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Statistics Cards */}
      {sellerStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sellerStats.total_sales)}</div>
              <p className="text-xs text-muted-foreground">
                {sellerStats.total_transactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Settled Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sellerStats.total_settled)}</div>
              <p className="text-xs text-muted-foreground">
                Pending: {formatCurrency(sellerStats.pending_settlement)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payout Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sellerStats.total_payout)}</div>
              <p className="text-xs text-muted-foreground">
                GST: {formatCurrency(sellerStats.total_gst_collected)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerStats.success_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {sellerStats.successful_transactions} / {sellerStats.total_transactions} orders
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue and transaction metrics</CardDescription>
            </div>
            <Select value={trendDays.toString()} onValueChange={(v) => setTrendDays(parseInt(v))}>
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
          <LineChart 
            data={revenueTrend}
            index="date"
            categories={["revenue", "settled", "payout"]}
            colors={["blue", "green", "orange"]}
            valueFormatter={(value: number) => formatCurrency(value)}
            className="h-72"
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by buyer, order ID, or product..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={txnTypeFilter} onValueChange={setTxnTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                  <SelectItem value="PayOut">PayOut</SelectItem>
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

              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-[180px]"
              />
              
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-[180px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Settled</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.txn_id}>
                    <TableCell className="font-mono text-xs">
                      {txn.order_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{txn.buyer_username}</p>
                        <p className="text-xs text-muted-foreground">{txn.buyer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{txn.product_name}</p>
                    </TableCell>
                    <TableCell>{txn.quantity}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(txn.total_amount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(txn.settle_amount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(txn.gst)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {txn.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        txn.status === 'success' ? 'default' :
                        txn.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(txn.purchase_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagement;