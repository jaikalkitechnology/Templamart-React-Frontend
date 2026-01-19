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
  Wallet
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

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
  };

  const payoutStats = {
    total: filteredPayouts.length,
    totalAmount: filteredPayouts.reduce((sum, t) => sum + t.amount, 0),
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Wallet Management</h2>
          <p className="text-muted-foreground">
            Manage settlements and payout approvals
          </p>
        </div>
        <Button onClick={() => setShowManualDialog(true)}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Manual Settlement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {settlementStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(settlementStats.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {payoutStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(payoutStats.totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settlements">
            Pending Settlements ({settlementStats.total})
          </TabsTrigger>
          <TabsTrigger value="payouts">
            Pending Payouts ({payoutStats.total})
          </TabsTrigger>
        </TabsList>

        {/* SETTLEMENTS TAB */}
        <TabsContent value="settlements" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by seller or transaction ID..."
                      value={settlementSearch}
                      onChange={(e) => setSettlementSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={settlementSellerFilter} onValueChange={setSettlementSellerFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by Seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                        {seller.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Settlements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Settlements</CardTitle>
              <CardDescription>
                Transfer amounts from wallet to payout wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Payout Balance</TableHead>
                      <TableHead>Settlement Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSettlements.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">
                          {formatDate(txn.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.seller_username}</p>
                            <p className="text-sm text-muted-foreground">{txn.seller_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatCurrency(txn.wallet_balance)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(txn.payout_wallet_balance)}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg">
                            {formatCurrency(txn.settle_amount)}
                          </div>
                          {txn.gst > 0 && (
                            <p className="text-xs text-muted-foreground">
                              GST: {formatCurrency(txn.gst)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {txn.txn_id}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setConfirmDialog({
                              show: true,
                              type: 'settlement',
                              transaction: txn
                            })}
                            disabled={txn.wallet_balance < txn.settle_amount}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve Transfer
                          </Button>
                          {txn.wallet_balance < txn.settle_amount && (
                            <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYOUTS TAB */}
        <TabsContent value="payouts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by seller or transaction ID..."
                      value={payoutSearch}
                      onChange={(e) => setPayoutSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={payoutSellerFilter} onValueChange={setPayoutSellerFilter}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by Seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                        {seller.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                Approve or reject payout requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Payout Balance</TableHead>
                      <TableHead>Payout Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">
                          {formatDate(txn.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.seller_username}</p>
                            <p className="text-sm text-muted-foreground">{txn.seller_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(txn.payout_wallet_balance)}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg text-red-600">
                            {formatCurrency(txn.amount)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {txn.txn_id}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {txn.description || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setConfirmDialog({
                                show: true,
                                type: 'approve-payout',
                                transaction: txn
                              })}
                              disabled={txn.payout_wallet_balance < txn.amount}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setConfirmDialog({
                                show: true,
                                type: 'reject-payout',
                                transaction: txn
                              })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                          {txn.payout_wallet_balance < txn.amount && (
                            <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Settlement Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Settlement</DialogTitle>
            <DialogDescription>
              Transfer amount from seller's wallet to payout wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Seller</label>
              <Select value={manualSellerId} onValueChange={setManualSellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose seller..." />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                      {seller.username} - Wallet: {formatCurrency(seller.wallet_balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Enter description..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createManualSettlement}>
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
            <DialogTitle>
              {confirmDialog.type === 'settlement' && 'Confirm Settlement Transfer'}
              {confirmDialog.type === 'approve-payout' && 'Approve Payout'}
              {confirmDialog.type === 'reject-payout' && 'Reject Payout'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.transaction && (
                <div className="space-y-2 mt-4">
                  <p><strong>Seller:</strong> {confirmDialog.transaction.seller_username}</p>
                  <p><strong>Amount:</strong> {formatCurrency(
                    confirmDialog.type === 'settlement' 
                      ? confirmDialog.transaction.settle_amount 
                      : confirmDialog.transaction.amount
                  )}</p>
                  {confirmDialog.type === 'settlement' && (
                    <>
                      <p><strong>Current Wallet:</strong> {formatCurrency(confirmDialog.transaction.wallet_balance)}</p>
                      <p><strong>Current Payout Wallet:</strong> {formatCurrency(confirmDialog.transaction.payout_wallet_balance)}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Amount will be transferred from wallet to payout wallet.
                      </p>
                    </>
                  )}
                  {confirmDialog.type === 'approve-payout' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Amount will be deducted from payout wallet.
                    </p>
                  )}
                  {confirmDialog.type === 'reject-payout' && (
                    <p className="text-sm text-red-600 mt-2">
                      Payout will be rejected. Amount will remain in payout wallet.
                    </p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ show: false, type: null, transaction: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              variant={confirmDialog.type === 'reject-payout' ? 'destructive' : 'default'}
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