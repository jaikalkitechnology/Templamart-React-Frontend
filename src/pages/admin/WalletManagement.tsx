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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Wallet,
  Filter,
  Download,
  IndianRupee,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Users,
  Calendar,
  Eye,
  MoreVertical,
  Loader2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================================
// Type Definitions
// ============================================================

interface WalletTransactionItem {
  id: number;
  txn_id: string;
  order_id: string;
  seller_id: number;
  seller_username: string;
  seller_email: string;
  wallet_balance: number;
  payout_wallet_balance: number;
  transaction_type: string;
  credit_debit: string;
  amount: number;
  settle_amount: number;
  balance_amount: number;
  gst: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface SellerOption {
  seller_id: number;
  username: string;
  email: string;
  wallet_balance: number;
  payout_wallet_balance: number;
}

// ============================================================
// Main Component
// ============================================================

const WalletManagement = () => {
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("settlements");
  const [refreshing, setRefreshing] = useState(false);
  
  // Settlements (Wallet → Payout Wallet)
  const [pendingSettlements, setPendingSettlements] = useState<WalletTransactionItem[]>([]);
  const [settlementSearch, setSettlementSearch] = useState("");
  const [settlementSellerFilter, setSettlementSellerFilter] = useState<string>("all");
  
  // Payouts (Payout Wallet → External)
  const [pendingPayouts, setPendingPayouts] = useState<WalletTransactionItem[]>([]);
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutSellerFilter, setPayoutSellerFilter] = useState<string>("all");
  
  // Sellers list
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  
  // Manual settlement dialog
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualSellerId, setManualSellerId] = useState<string>("");
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualDescription, setManualDescription] = useState<string>("");
  
  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    type: 'settlement' | 'approve-payout' | 'reject-payout' | null;
    transaction: WalletTransactionItem | null;
  }>({
    show: false,
    type: null,
    transaction: null
  });

  // ============================================================
  // API Calls
  // ============================================================

  const fetchPendingSettlements = async () => {
    try {
      const params: any = { limit: 100 };
      if (settlementSellerFilter !== "all") {
        params.seller_id = settlementSellerFilter;
      }

      const res = await axios.get(`${BASE_URL}/dash/wallet-management/pending-settlements`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setPendingSettlements(res.data);
    } catch (error) {
      console.error("Error fetching pending settlements:", error);
      toast.error("Failed to load pending settlements");
    }
  };

  const fetchPendingPayouts = async () => {
    try {
      const params: any = { limit: 100 };
      if (payoutSellerFilter !== "all") {
        params.seller_id = payoutSellerFilter;
      }

      const res = await axios.get(`${BASE_URL}/dash/wallet-management/pending-payouts`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setPendingPayouts(res.data);
    } catch (error) {
      console.error("Error fetching pending payouts:", error);
      toast.error("Failed to load pending payouts");
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/wallet-management/sellers-list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellers(res.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const approveSettlement = async (transactionId: number, sellerId: number) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/dash/wallet-management/approve-settlement`,
        { transaction_id: transactionId, seller_id: sellerId },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      toast.success(res.data.message);
      fetchPendingSettlements();
      fetchSellers();
    } catch (error: any) {
      console.error("Error approving settlement:", error);
      toast.error(error.response?.data?.detail || "Failed to approve settlement");
    }
  };

  const handlePayoutAction = async (transactionId: number, sellerId: number, action: 'approve' | 'reject') => {
    try {
      const res = await axios.post(
        `${BASE_URL}/dash/wallet-management/payout-action`,
        { transaction_id: transactionId, seller_id: sellerId, action },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      
      toast.success(res.data.message);
      fetchPendingPayouts();
      fetchSellers();
    } catch (error: any) {
      console.error("Error processing payout:", error);
      toast.error(error.response?.data?.detail || "Failed to process payout");
    }
  };

  const createManualSettlement = async () => {
    if (!manualSellerId || !manualAmount) {
      toast.error("Please select seller and enter amount");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/dash/wallet-management/create-settlement`,
        null,
        {
          params: {
            seller_id: parseInt(manualSellerId),
            amount: parseFloat(manualAmount),
            description: manualDescription || undefined
          },
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      
      toast.success(res.data.message);
      setShowManualDialog(false);
      setManualSellerId("");
      setManualAmount("");
      setManualDescription("");
      fetchPendingSettlements();
      fetchSellers();
    } catch (error: any) {
      console.error("Error creating manual settlement:", error);
      toast.error(error.response?.data?.detail || "Failed to create settlement");
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPendingSettlements(),
      fetchPendingPayouts(),
      fetchSellers(),
    ]);
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPendingSettlements(),
        fetchPendingPayouts(),
        fetchSellers(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPendingSettlements();
    }
  }, [settlementSellerFilter]);

  useEffect(() => {
    if (!loading) {
      fetchPendingPayouts();
    }
  }, [payoutSellerFilter]);

  // ============================================================
  // Filters
  // ============================================================

  const filteredSettlements = pendingSettlements.filter(txn => {
    if (settlementSearch === "") return true;
    const search = settlementSearch.toLowerCase();
    return (
      txn.seller_username.toLowerCase().includes(search) ||
      txn.seller_email.toLowerCase().includes(search) ||
      txn.txn_id.toLowerCase().includes(search)
    );
  });

  const filteredPayouts = pendingPayouts.filter(txn => {
    if (payoutSearch === "") return true;
    const search = payoutSearch.toLowerCase();
    return (
      txn.seller_username.toLowerCase().includes(search) ||
      txn.seller_email.toLowerCase().includes(search) ||
      txn.txn_id.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // Handlers
  // ============================================================

  const handleConfirmAction = () => {
    if (!confirmDialog.transaction) return;

    const { type, transaction } = confirmDialog;
    
    if (type === 'settlement') {
      approveSettlement(transaction.id, transaction.seller_id);
    } else if (type === 'approve-payout') {
      handlePayoutAction(transaction.id, transaction.seller_id, 'approve');
    } else if (type === 'reject-payout') {
      handlePayoutAction(transaction.id, transaction.seller_id, 'reject');
    }

    setConfirmDialog({ show: false, type: null, transaction: null });
  };

  // ============================================================
  // Stats Calculations
  // ============================================================

  const settlementStats = {
    total: filteredSettlements.length,
    totalAmount: filteredSettlements.reduce((sum, t) => sum + t.settle_amount, 0),
    pendingCount: filteredSettlements.filter(t => t.status === 'pending').length,
  };

  const payoutStats = {
    total: filteredPayouts.length,
    totalAmount: filteredPayouts.reduce((sum, t) => sum + t.amount, 0),
    pendingCount: filteredPayouts.filter(t => t.status === 'pending').length,
  };

  const getTotalWalletBalance = () => {
    return sellers.reduce((sum, seller) => sum + seller.wallet_balance, 0);
  };

  const getTotalPayoutBalance = () => {
    return sellers.reduce((sum, seller) => sum + seller.payout_wallet_balance, 0);
  };

  // ============================================================
  // Helper Functions
  // ============================================================

  const getStatusBadge = (status: string, isInsufficient: boolean = false) => {
    if (isInsufficient) {
      return (
        <Badge className="bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Insufficient
        </Badge>
      );
    }
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return (
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-pink-50 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-500/60 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-background p-8 border border-blue-200/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              Wallet Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              Manage settlements, payouts, and seller wallet balances
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                <Calendar className="w-3 h-3 inline mr-1" />
                Last updated: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={refreshAll}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button onClick={() => setShowManualDialog(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <ArrowRightLeft className="h-4 w-4" />
              Manual Settlement
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Wallet Balance */}
        <Card className="relative overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <Wallet className="h-4 w-4" />
              Total Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center text-blue-800">
              <IndianRupee className="h-6 w-6 mr-1" />
              {new Intl.NumberFormat('en-IN').format(getTotalWalletBalance())}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Across {sellers.length} sellers
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Payout Balance */}
        <Card className="relative overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <CreditCard className="h-4 w-4" />
              Total Payout Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center text-green-800">
              <IndianRupee className="h-6 w-6 mr-1" />
              {new Intl.NumberFormat('en-IN').format(getTotalPayoutBalance())}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Ready for withdrawal
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Settlements */}
        <Card className="relative overflow-hidden border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
              <ArrowRightLeft className="h-4 w-4" />
              Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {settlementStats.pendingCount}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-sm text-amber-600 font-medium">
                <IndianRupee className="h-3 w-3 inline mr-1" />
                {new Intl.NumberFormat('en-IN').format(settlementStats.totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total amount
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Processing</span>
                <span>{settlementStats.pendingCount}/{settlementStats.total}</span>
              </div>
              <Progress value={(settlementStats.pendingCount / Math.max(settlementStats.total, 1)) * 100} className="h-2 bg-amber-100" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="relative overflow-hidden border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -translate-y-12 translate-x-12"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <ArrowDownRight className="h-4 w-4" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">
              {payoutStats.pendingCount}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-sm text-red-600 font-medium">
                <IndianRupee className="h-3 w-3 inline mr-1" />
                {new Intl.NumberFormat('en-IN').format(payoutStats.totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total amount
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Awaiting Approval</span>
                <span>{payoutStats.pendingCount}/{payoutStats.total}</span>
              </div>
              <Progress value={(payoutStats.pendingCount / Math.max(payoutStats.total, 1)) * 100} className="h-2 bg-red-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Top Sellers
        </Button>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-6">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
                <TabsTrigger
                  value="settlements"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Pending Settlements ({settlementStats.total})
                </TabsTrigger>
                <TabsTrigger
                  value="payouts"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
                >
                  <ArrowDownRight className="h-4 w-4" />
                  Pending Payouts ({payoutStats.total})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* SETTLEMENTS TAB */}
            <TabsContent value="settlements" className="m-0">
              <div className="px-6 pb-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by seller name, email, or transaction ID..."
                      value={settlementSearch}
                      onChange={(e) => setSettlementSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Select value={settlementSellerFilter} onValueChange={setSettlementSellerFilter}>
                        <SelectTrigger className="w-[250px] pl-10 h-11">
                          <SelectValue placeholder="Filter by Seller" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sellers</SelectItem>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{seller.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  ₹{seller.wallet_balance.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Settlements Table */}
                <div className="rounded-lg border overflow-hidden border-blue-200">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-50 to-cyan-50/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold">Seller Details</TableHead>
                        <TableHead className="font-semibold">Balance Status</TableHead>
                        <TableHead className="font-semibold">Settlement Details</TableHead>
                        <TableHead className="font-semibold">Transaction</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSettlements.map((txn) => {
                        const isInsufficient = txn.wallet_balance < txn.settle_amount;
                        return (
                          <TableRow
                            key={txn.id}
                            className={`group hover:bg-gradient-to-r hover:from-blue-500/5 hover:via-blue-500/2 hover:to-transparent transition-colors ${
                              isInsufficient ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(txn.created_at)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {txn.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="font-semibold group-hover:text-blue-600 transition-colors">
                                    {txn.seller_username}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{txn.seller_email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                                  <p className={`font-semibold flex items-center ${isInsufficient ? 'text-red-600' : 'text-blue-600'}`}>
                                    <IndianRupee className="h-3 w-3 mr-1" />
                                    {txn.wallet_balance.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Payout Balance</p>
                                  <p className="font-semibold flex items-center text-green-600">
                                    <IndianRupee className="h-3 w-3 mr-1" />
                                    {txn.payout_wallet_balance.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Settlement Amount</p>
                                  <p className="text-lg font-bold text-amber-700 flex items-center">
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {txn.settle_amount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                {txn.gst > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">GST</p>
                                    <p className="text-sm text-purple-600">
                                      ₹{txn.gst.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  {txn.txn_id.slice(0, 20)}...
                                </code>
                                {txn.order_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Order: {txn.order_id}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                {isInsufficient ? (
                                  <div className="space-y-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1"
                                      disabled
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                      Insufficient
                                    </Button>
                                    <p className="text-xs text-red-500">
                                      Short by ₹{(txn.settle_amount - txn.wallet_balance).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      className="gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                      onClick={() => setConfirmDialog({
                                        show: true,
                                        type: 'settlement',
                                        transaction: txn
                                      })}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                          <Wallet className="h-4 w-4 mr-2" />
                                          View Seller Wallet
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {filteredSettlements.length === 0 && (
                    <div className="text-center py-12">
                      <ArrowRightLeft className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium text-lg">No pending settlements</h3>
                      <p className="text-muted-foreground mt-1">
                        All settlements have been processed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* PAYOUTS TAB */}
            <TabsContent value="payouts" className="m-0">
              <div className="px-6 pb-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by seller name, email, or transaction ID..."
                      value={payoutSearch}
                      onChange={(e) => setPayoutSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Select value={payoutSellerFilter} onValueChange={setPayoutSellerFilter}>
                        <SelectTrigger className="w-[250px] pl-10 h-11">
                          <SelectValue placeholder="Filter by Seller" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sellers</SelectItem>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{seller.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  ₹{seller.payout_wallet_balance.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Payouts Table */}
                <div className="rounded-lg border overflow-hidden border-red-200">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-red-50 to-orange-50/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold">Seller Details</TableHead>
                        <TableHead className="font-semibold">Payout Balance</TableHead>
                        <TableHead className="font-semibold">Payout Details</TableHead>
                        <TableHead className="font-semibold">Transaction</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayouts.map((txn) => {
                        const isInsufficient = txn.payout_wallet_balance < txn.amount;
                        return (
                          <TableRow
                            key={txn.id}
                            className={`group hover:bg-gradient-to-r hover:from-red-500/5 hover:via-red-500/2 hover:to-transparent transition-colors ${
                              isInsufficient ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(txn.created_at)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {txn.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="font-semibold group-hover:text-red-600 transition-colors">
                                    {txn.seller_username}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{txn.seller_email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Available Balance</p>
                                <p className={`font-semibold flex items-center ${isInsufficient ? 'text-red-600' : 'text-green-600'}`}>
                                  <IndianRupee className="h-4 w-4 mr-1" />
                                  {txn.payout_wallet_balance.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Payout Amount</p>
                                  <p className="text-lg font-bold text-red-700 flex items-center">
                                    <IndianRupee className="h-4 w-4 mr-1" />
                                    {txn.amount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                {txn.description && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Description</p>
                                    <p className="text-sm max-w-xs truncate" title={txn.description}>
                                      {txn.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  {txn.txn_id.slice(0, 20)}...
                                </code>
                                <div className="mt-1">
                                  {getStatusBadge(txn.status, isInsufficient)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                {isInsufficient ? (
                                  <div className="space-y-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1"
                                      disabled
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                      Insufficient
                                    </Button>
                                    <p className="text-xs text-red-500">
                                      Short by ₹{(txn.amount - txn.payout_wallet_balance).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      className="gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                      onClick={() => setConfirmDialog({
                                        show: true,
                                        type: 'approve-payout',
                                        transaction: txn
                                      })}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                      onClick={() => setConfirmDialog({
                                        show: true,
                                        type: 'reject-payout',
                                        transaction: txn
                                      })}
                                    >
                                      <XCircle className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {filteredPayouts.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium text-lg">No pending payouts</h3>
                      <p className="text-muted-foreground mt-1">
                        All payout requests have been processed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Manual Settlement Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              Create Manual Settlement
            </DialogTitle>
            <DialogDescription>
              Transfer amount from seller's wallet to payout wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Seller</label>
              <Select value={manualSellerId} onValueChange={setManualSellerId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose seller..." />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{seller.username}</div>
                          <div className="text-xs text-muted-foreground">{seller.email}</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-blue-600 flex items-center">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            {seller.wallet_balance.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Enter description..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="h-11"
              />
            </div>
            {manualSellerId && manualAmount && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">Transfer Summary</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Current Wallet Balance:</span>
                    <span className="font-medium">
                      ₹{sellers.find(s => s.seller_id.toString() === manualSellerId)?.wallet_balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Amount:</span>
                    <span className="font-medium">₹{parseFloat(manualAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>New Wallet Balance:</span>
                    <span className="font-medium">
                      ₹{(sellers.find(s => s.seller_id.toString() === manualSellerId)!.wallet_balance - parseFloat(manualAmount)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowManualDialog(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={createManualSettlement}
              className="h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Create Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.show} onOpenChange={(open) => 
        setConfirmDialog({ ...confirmDialog, show: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'settlement' && (
                <>
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  Confirm Settlement Transfer
                </>
              )}
              {confirmDialog.type === 'approve-payout' && (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Approve Payout
                </>
              )}
              {confirmDialog.type === 'reject-payout' && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Payout
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.transaction && (
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Seller</p>
                        <p className="font-medium">{confirmDialog.transaction.seller_username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium text-lg flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {(
                            confirmDialog.type === 'settlement' 
                              ? confirmDialog.transaction.settle_amount 
                              : confirmDialog.transaction.amount
                          ).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {confirmDialog.type === 'settlement' && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm">Current Wallet Balance:</span>
                          <span className="font-medium text-blue-700">
                            ₹{confirmDialog.transaction.wallet_balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm">Current Payout Balance:</span>
                          <span className="font-medium text-green-700">
                            ₹{confirmDialog.transaction.payout_wallet_balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                          <span className="text-sm font-medium">Transfer Amount:</span>
                          <span className="font-bold text-amber-700">
                            ₹{confirmDialog.transaction.settle_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        Amount will be transferred from wallet to payout wallet.
                      </div>
                    </>
                  )}
                  {confirmDialog.type === 'approve-payout' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm">Available Payout Balance:</span>
                        <span className="font-medium text-green-700">
                          ₹{confirmDialog.transaction.payout_wallet_balance.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <span className="text-sm font-medium">Payout Amount:</span>
                        <span className="font-bold text-red-700">
                          ₹{confirmDialog.transaction.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        Amount will be deducted from payout wallet and transferred to seller.
                      </div>
                    </div>
                  )}
                  {confirmDialog.type === 'reject-payout' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <span className="text-sm font-medium">Payout Amount:</span>
                        <span className="font-bold text-red-700">
                          ₹{confirmDialog.transaction.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-sm text-red-600 p-3 bg-red-50/50 rounded-lg border border-red-200">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Payout will be rejected. Amount will remain in payout wallet.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ show: false, type: null, transaction: null })}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              className={`h-11 ${
                confirmDialog.type === 'reject-payout' 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
                  : confirmDialog.type === 'settlement'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
              }`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletManagement;