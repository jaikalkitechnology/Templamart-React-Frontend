// seller/wallet.tsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Plus,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Shield,
  Zap,
  IndianRupee,
  Building,
  Landmark,
  User,
  Key,
  Mail,
  Phone,
  Globe,
  FileText,
  ChevronRight,
  AlertCircle,
  Receipt,
  BarChart,
  Target,
  Sparkles,
  Coins,
  Gift,
  Award,
  Crown,
  Star,
  Rocket,
  PieChart,
  ArrowRightLeft,
  WalletCards,
  History,
  Calendar,
  CreditCardIcon,
  Smartphone,
  QrCode,
  Loader2,
  Check,
  AlertTriangle,
  Edit
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface WalletBalance {
  balance: number;
  last_updated: string;
}

interface WalletTransaction {
  id: number;
  transaction_type: string;
  credit_debit: string;
  amount: number;
  balance_amount: number;
  settle_amount: number;
  gst: number;
  txn_id: string;
  status: string;
  reference_id?: string;
  description?: string;
  created_at: string;
}

interface Payout {
  id: number;
  amount: number;
  payout_status: string;
  reference_id?: string;
  requested_at: string;
  processed_at?: string;
}

interface BankAccount {
  id: number;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  bank_branch?: string;
  account_type: string;
  bank_address?: string;
  is_primary: boolean;
  approval: boolean;
}

interface SellerPeriodStats {
  revenue: number;
  templates_sold: number;
}

interface SellerDashboardKPI {
  today: SellerPeriodStats;
  yesterday: SellerPeriodStats;
  current_month: SellerPeriodStats;
}

interface BankAccountFormData {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  account_type: string;
  bank_address: string;
  is_primary: boolean;
}

const SellerWallet = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [payoutWalletBalance, setPayoutWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [data, setData] = useState<SellerDashboardKPI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [isAddingBankAccount, setIsAddingBankAccount] = useState(false);

  const [bankFormData, setBankFormData] = useState<BankAccountFormData>({
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    bank_branch: "",
    account_type: "savings",
    bank_address: "",
    is_primary: false,
  });

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      const [walletRes, payoutWalletRes, transactionsRes, payoutsRes, bankAccountsRes] = 
        await Promise.all([
          axios.get(`${BASE_URL}/dash/seller/wallet`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${BASE_URL}/dash/seller/wallet/payout`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${BASE_URL}/dash/seller/wallet/transactions`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${BASE_URL}/dash/seller/payouts`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${BASE_URL}/dash/seller/bank-accounts`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

      setWalletBalance(walletRes.data);
      setPayoutWalletBalance(payoutWalletRes.data);
      setTransactions(transactionsRes.data);
      setPayouts(payoutsRes.data);
      setBankAccounts(bankAccountsRes.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get<SellerDashboardKPI>(
          `${BASE_URL}/dash/seller/seller_dashboard_kpis`,
          { headers: { Authorization: `Bearer ${user?.token}` }, }
        );
        setData(res.data);
      } catch (err) {
        setError("Failed to load dashboard stats");
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, []);
  
  const handleBankFormChange = (field: keyof BankAccountFormData, value: string | boolean) => {
    setBankFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBankAccount = async () => {
    try {
      setIsAddingBankAccount(true);
      
      const response = await axios.post(
        `${BASE_URL}/dash/seller/bank-accounts`,
        bankFormData,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success("Bank account added successfully!");
      setShowAddBankDialog(false);
      setBankFormData({
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        bank_branch: "",
        account_type: "savings",
        bank_address: "",
        is_primary: false,
      });
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to add bank account");
    } finally {
      setIsAddingBankAccount(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !selectedBankAccount) {
      toast.error("Please fill all fields");
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (payoutWalletBalance && amount > payoutWalletBalance.balance) {
      toast.error("Insufficient balance in payout wallet");
      return;
    }

    try {
      setIsRequestingPayout(true);
      await axios.post(
        `${BASE_URL}/dash/seller/payouts/request`,
        {
          amount: amount,
          bank_account_id: parseInt(selectedBankAccount),
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      setShowPayoutDialog(false);
      setPayoutAmount("");
      setSelectedBankAccount("");
      fetchWalletData();
      toast.success("Payout request submitted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to request payout");
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const transferToPayoutWallet = async () => {
    if (!walletBalance || walletBalance.balance <= 0) {
      toast.error("No balance available to transfer");
      return;
    }

    try {
      setIsTransferring(true);
      await axios.post(
        `${BASE_URL}/dash/seller/wallet/transfer`,
        { amount: walletBalance.balance },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      fetchWalletData();
      toast.success("Transfer successful!");
    } catch (error) {
      toast.error("Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (txn) => transactionType === "all" || txn.transaction_type === transactionType
  );

  const totalCredits = filteredTransactions
    .filter((t) => t.credit_debit === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = filteredTransactions
    .filter((t) => t.credit_debit === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayouts = payouts.filter((p) => p.payout_status === "pending");
  const completedPayouts = payouts.filter((p) => p.payout_status === "success");

  const exportTransactions = () => {
    const csvData = [
      ["Date", "Type", "Credit/Debit", "Amount", "Settled", "Platform Fee", "GST", "Transaction ID", "Status"],
      ...transactions.map((txn) => [
        formatDate(txn.created_at),
        txn.transaction_type,
        txn.credit_debit,
        txn.amount,
        txn.settle_amount,
        txn.balance_amount,
        txn.gst,
        txn.txn_id,
        txn.status,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-20"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-gradient-to-r from-amber-500 to-orange-500"></div>
        </div>
        <p className="text-muted-foreground">Loading your wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Seller Wallet
              </h2>
              <p className="text-muted-foreground">
                Manage your earnings, payouts, and financial insights
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={fetchWalletData}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={exportTransactions}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Wallet Summary Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main Wallet Card */}
        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <WalletCards className="h-5 w-5" />
                  Main Wallet
                </CardTitle>
                <CardDescription className="text-white/80">
                  Available for transfer to payout wallet
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-white/20">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold mb-6 flex items-center">
              <IndianRupee className="h-8 w-8 mr-1" />
              {formatCurrency(walletBalance?.balance || 0)}
            </div>
            <div className="space-y-3">
              <Button 
                onClick={transferToPayoutWallet} 
                disabled={!walletBalance?.balance || isTransferring}
                className="w-full bg-white text-blue-600 hover:bg-white/90 hover:text-blue-700 font-semibold shadow-lg"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer to Payout Wallet
                  </>
                )}
              </Button>
              <p className="text-xs text-white/70">
                Last updated: {walletBalance?.last_updated ? formatDate(walletBalance.last_updated) : "Recently"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payout Wallet Card */}
        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Banknote className="h-5 w-5" />
                  Payout Wallet
                </CardTitle>
                <CardDescription className="text-white/80">
                  Available for withdrawal to bank
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-white/20">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold mb-6 flex items-center">
              <IndianRupee className="h-8 w-8 mr-1" />
              {formatCurrency(payoutWalletBalance?.balance || 0)}
            </div>
            <div className="space-y-3">
              <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-white text-green-600 hover:bg-white/90 hover:text-green-700 font-semibold shadow-lg">
                    <Zap className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Request Payout
                    </DialogTitle>
                    <DialogDescription>
                      Transfer funds to your bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="payout-amount">Amount to withdraw</Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="payout-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Available balance: <span className="font-semibold">{formatCurrency(payoutWalletBalance?.balance || 0)}</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank-account">Select Bank Account</Label>
                      <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                        <SelectTrigger id="bank-account">
                          <SelectValue placeholder="Choose a bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts
                            .filter((account) => account.approval)
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Landmark className="h-4 w-4" />
                                  <div>
                                    <span className="font-medium">{account.bank_name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ••••{account.account_number.slice(-4)}
                                      {account.is_primary && (
                                        <Badge variant="secondary" className="ml-2">Primary</Badge>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPayoutDialog(false)}
                      disabled={isRequestingPayout}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePayoutRequest}
                      disabled={isRequestingPayout}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      {isRequestingPayout ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Request Payout
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <p className="text-xs text-white/70">
                Minimum withdrawal: ₹500 • Processed in 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today's Revenue
                </p>
                <h3 className="text-2xl font-bold mt-2 flex items-center">
                  <IndianRupee className="h-6 w-6 mr-1" />
                  {formatCurrency(data ? data.today.revenue : 0)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={data?.today.revenue ? Math.min(100, (data.today.revenue / 50000) * 100) : 0} className="h-2 bg-amber-100" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{data?.today.templates_sold || 0} templates sold</span>
                <span>₹50k daily goal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Yesterday's Revenue
                </p>
                <h3 className="text-2xl font-bold mt-2 flex items-center">
                  <IndianRupee className="h-6 w-6 mr-1" />
                  {formatCurrency(data ? data.yesterday.revenue : 0)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BarChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {data?.yesterday.templates_sold || 0} sales
                </Badge>
                {data && data.yesterday.revenue > (data.today.revenue || 0) && (
                  <span className="text-xs text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Down from today
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Month to Date
                </p>
                <h3 className="text-2xl font-bold mt-2 flex items-center">
                  <IndianRupee className="h-6 w-6 mr-1" />
                  {formatCurrency(data ? data.current_month.revenue : 0)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {data?.current_month.templates_sold || 0} templates this month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction Summary
              </CardTitle>
              <CardDescription>
                {filteredTransactions.length} transactions • Net: {formatCurrency(totalCredits - totalDebits)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="PayOut">Payout</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                  <SelectItem value="Commission">Commission</SelectItem>
                  <SelectItem value="Refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4">
                <History className="h-4 w-4 mr-2" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="payouts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Payouts
              </TabsTrigger>
              <TabsTrigger value="bank-accounts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4">
                <Building className="h-4 w-4 mr-2" />
                Bank Accounts
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Settled</TableHead>
                      <TableHead className="font-semibold">Platform Fee</TableHead>
                      <TableHead className="font-semibold">GST</TableHead>
                      <TableHead className="font-semibold">Transaction ID</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions?.map((txn) => (
                      <TableRow key={txn?.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{formatDate(txn?.created_at)}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(txn.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${
                              txn.transaction_type === "Sales" ? "bg-green-100 text-green-600" :
                              txn.transaction_type === "PayOut" ? "bg-blue-100 text-blue-600" :
                              txn.transaction_type === "Settled" ? "bg-purple-100 text-purple-600" :
                              "bg-amber-100 text-amber-600"
                            }`}>
                              {txn.transaction_type === "Sales" ? <TrendingUp className="h-4 w-4" /> :
                               txn.transaction_type === "PayOut" ? <ArrowDownRight className="h-4 w-4" /> :
                               <ArrowRightLeft className="h-4 w-4" />}
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                txn.transaction_type === "Sales"
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : txn.transaction_type === "PayOut"
                                  ? "border-blue-200 text-blue-700 bg-blue-50"
                                  : txn.transaction_type === "Settled"
                                  ? "border-purple-200 text-purple-700 bg-purple-50"
                                  : "border-amber-200 text-amber-700 bg-amber-50"
                              }
                            >
                              {txn?.transaction_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold flex items-center gap-1 ${
                            txn?.credit_debit === "credit" ? "text-green-600" : "text-red-600"
                          }`}>
                            {txn.credit_debit === "credit" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            <IndianRupee className="h-4 w-4" />
                            {formatCurrency(txn?.amount)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          <IndianRupee className="h-4 w-4 inline mr-1" />
                          {formatCurrency(txn.settle_amount)}
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          <IndianRupee className="h-4 w-4 inline mr-1" />
                          {formatCurrency(txn?.balance_amount)}
                        </TableCell>
                        <TableCell>
                          <IndianRupee className="h-4 w-4 inline mr-1" />
                          {formatCurrency(txn.gst)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {txn?.txn_id}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              txn.status === "success"
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                : txn.status === "pending"
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                : txn.status === "failed"
                                ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {txn.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {txn.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {txn.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Payout History</h3>
                    <p className="text-sm text-muted-foreground">
                      {payouts.length} total payouts • {pendingPayouts.length} pending • {completedPayouts.length} completed
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Reference ID</TableHead>
                        <TableHead className="font-semibold">Requested Date</TableHead>
                        <TableHead className="font-semibold">Processed Date</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">
                            {payout.reference_id ? (
                              <div className="flex items-center gap-2">
                                <Key className="h-3 w-3 text-muted-foreground" />
                                {payout.reference_id.slice(0, 8)}...
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{formatDate(payout.requested_at)}</div>
                              <div className="text-xs text-muted-foreground">
                                Requested
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payout.processed_at ? (
                              <div className="space-y-1">
                                <div className="font-medium">{formatDate(payout.processed_at)}</div>
                                <div className="text-xs text-muted-foreground">
                                  Processed
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not processed</span>
                            )}
                          </TableCell>
                          <TableCell className="font-bold">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {formatCurrency(payout.amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payout.payout_status === "completed"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                  : payout.payout_status === "pending"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                              }
                            >
                              {payout.payout_status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {payout.payout_status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {payout.payout_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Bank Accounts Tab */}
            <TabsContent value="bank-accounts" className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Bank Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your bank accounts for payouts and withdrawals
                    </p>
                  </div>
                  <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                        <Plus className="h-4 w-4" />
                        Add Bank Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Add Bank Account
                        </DialogTitle>
                        <DialogDescription>
                          Add a new bank account for payouts. All fields are required.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-holder-name">Account Holder Name *</Label>
                          <Input
                            id="account-holder-name"
                            placeholder="John Doe"
                            value={bankFormData.account_holder_name}
                            onChange={(e) => handleBankFormChange("account_holder_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-number">Account Number *</Label>
                          <Input
                            id="account-number"
                            placeholder="1234567890"
                            value={bankFormData.account_number}
                            onChange={(e) => handleBankFormChange("account_number", e.target.value)}
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="ifsc-code">IFSC Code *</Label>
                            <Input
                              id="ifsc-code"
                              placeholder="SBIN0000123"
                              value={bankFormData.ifsc_code}
                              onChange={(e) => handleBankFormChange("ifsc_code", e.target.value.toUpperCase())}
                            />
                          </div>
                          <div className="space-y-2 flex-1">
                            <Label htmlFor="account-type">Account Type *</Label>
                            <Select
                              value={bankFormData.account_type}
                              onValueChange={(value) => handleBankFormChange("account_type", value)}
                            >
                              <SelectTrigger id="account-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="savings">Savings Account</SelectItem>
                                <SelectItem value="current">Current Account</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-name">Bank Name *</Label>
                          <Input
                            id="bank-name"
                            placeholder="State Bank of India"
                            value={bankFormData.bank_name}
                            onChange={(e) => handleBankFormChange("bank_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-branch">Bank Branch</Label>
                          <Input
                            id="bank-branch"
                            placeholder="Main Branch, Mumbai"
                            value={bankFormData.bank_branch}
                            onChange={(e) => handleBankFormChange("bank_branch", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank-address">Bank Address</Label>
                          <Textarea
                            id="bank-address"
                            placeholder="Bank full address"
                            value={bankFormData.bank_address}
                            onChange={(e) => handleBankFormChange("bank_address", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is-primary"
                            checked={bankFormData.is_primary}
                            onCheckedChange={(checked) => handleBankFormChange("is_primary", checked)}
                          />
                          <Label htmlFor="is-primary">Set as primary bank account</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddBankDialog(false)}
                          disabled={isAddingBankAccount}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddBankAccount}
                          disabled={isAddingBankAccount}
                          className="bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          {isAddingBankAccount ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Add Bank Account
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col gap-4">
                  {bankAccounts.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-semibold text-lg mb-2">No bank accounts</h4>
                        <p className="text-muted-foreground mb-4">
                          Add a bank account to receive payouts
                        </p>
                        <Button onClick={() => setShowAddBankDialog(true)}>
                          Add Bank Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    bankAccounts.map((account) => (
                      <Card key={account.id} className={account.is_primary ? "border-2 border-primary" : ""}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${
                                  account.is_primary 
                                    ? "bg-gradient-to-br from-primary/20 to-primary/10" 
                                    : "bg-muted"
                                }`}>
                                  <Landmark className={`h-5 w-5 ${
                                    account.is_primary ? "text-primary" : "text-muted-foreground"
                                  }`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">
                                      {account.bank_name}
                                    </h3>
                                    {account.is_primary && (
                                      <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Primary
                                      </Badge>
                                    )}
                                    {!account.approval && (
                                      <Badge variant="secondary">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Pending Approval
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {account.account_holder_name}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium">Account Number</p>
                                  <p className="text-muted-foreground font-mono">
                                    ••••{account.account_number.slice(-4)}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">IFSC Code</p>
                                  <p className="text-muted-foreground font-mono">
                                    {account.ifsc_code}
                                  </p>
                                </div>
                                {account.bank_branch && (
                                  <div>
                                    <p className="font-medium">Branch</p>
                                    <p className="text-muted-foreground">
                                      {account.bank_branch}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">Type</p>
                                  <p className="text-muted-foreground capitalize">
                                    {account.account_type}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!account.is_primary && (
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Star className="h-4 w-4" />
                                  Set Primary
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Insights
          </CardTitle>
          <CardDescription>
            Key metrics and trends from your wallet activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-white border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Total Credits</span>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  <IndianRupee className="h-6 w-6 inline mr-1" />
                  {formatCurrency(totalCredits)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All incoming transactions
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Total Debits</span>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  <IndianRupee className="h-6 w-6 inline mr-1" />
                  {formatCurrency(totalDebits)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All outgoing transactions
                </p>
              </div>
            </div>
            <div className="flex-1">
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">Security Tips</h4>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    Always verify bank details before payout
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    Use strong passwords for wallet access
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    Enable two-factor authentication if available
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    Regularly check transaction history
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerWallet;