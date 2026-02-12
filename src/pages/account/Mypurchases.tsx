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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Download,
  FileText,
  Eye,
  Package,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Receipt,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================
// Type Definitions
// ============================================================

interface PurchaseStats {
  total_purchases: number;
  total_spent: number;
  total_products: number;
  pending_purchases: number;
}

interface PurchaseListItem {
  id: string;
  purchase_date: string;
  status: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
}

interface PurchaseItemDetail {
  product_id: number;
  product_title: string;
  product_slug: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  download_link: string | null;
}

interface PurchaseDetail {
  id: string;
  purchase_date: string;
  status: string;
  payment_method: string;
  total_amount: number;
  base_amount: number;
  gst_amount: number;
  gst_percentage: number;
  items: PurchaseItemDetail[];
}

// ============================================================
// Main Component
// ============================================================

const MyPurchases = () => {
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
    const [purchaseHistory, setPurchaseHistory] = useState([]);
  // Dialogs
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseDetail | null>(
    null
  );

  // ============================================================
  // API Calls
  // ============================================================

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/buyer/purchases/stats/summary`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchPurchases = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await axios.get(`${BASE_URL}/buyer/purchases/list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setPurchases(res.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    }
  };

  const fetchPurchaseDetail = async (purchaseId: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/buyer/purchases/${purchaseId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSelectedPurchase(res.data);
      setShowDetailDialog(true);
    } catch (error) {
      console.error("Error fetching purchase detail:", error);
      toast.error("Failed to load purchase details");
    }
  };

 const previewInvoice = async (purchaseId: string) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/buyer/purchases/${purchaseId}/invoice/preview`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: "blob",
      }
    );

    // Create a blob URL and open it in a new tab
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Optional: Clean up the blob URL after some time
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Error previewing invoice:", error);
    toast.error("Failed to preview invoice");
  }
};

  const downloadInvoice = async (purchaseId: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/buyer/purchases/${purchaseId}/invoice/download`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${purchaseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

 const downloadProduct = async (
  purchaseId: string,
  productId: number,
  productSlug: string
) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/buyer/purchases/${purchaseId}/download/${productId}`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );

    // Get download link from response
    const { download_link, filename } = res.data;

    // Create download link
    const link = document.createElement("a");
    link.href = download_link;
    link.setAttribute("download", filename || `${productSlug}.zip`);
    link.setAttribute("target", "_blank"); // Open in new tab as fallback
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Product download started");
  } catch (error) {
    console.error("Error downloading product:", error);
    toast.error("Failed to download product");
  }
};

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPurchases()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchPurchases();
    }
  }, [statusFilter]);
  

  // ============================================================
  // Helpers
  // ============================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
    <div className="container space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Purchases</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          View your purchase history and download products
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                <span className="hidden sm:inline">Total Purchases</span>
                <span className="sm:hidden">Purchases</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.total_purchases}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                <span className="hidden sm:inline">Total Spent</span>
                <span className="sm:hidden">Spent</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_spent)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                <span className="hidden sm:inline">Products Owned</span>
                <span className="sm:hidden">Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats.total_products}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
                <span className="hidden sm:inline">Pending</span>
                <span className="sm:hidden">Pending</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {stats.pending_purchases}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="text-xs sm:text-sm font-medium">Filter by status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purchases</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View - Hidden on Mobile */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            {purchases.length} purchase(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {purchase.id.slice(0, 12)}...
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{purchase.items_count} item(s)</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(purchase.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.payment_method}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchPurchaseDetail(purchase.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {purchase.status === "success" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => previewInvoice(purchase.id)}
                              title="Preview Invoice"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadInvoice(purchase.id)}
                              title="Download Invoice"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {purchases.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No purchases found</p>
                <p className="text-sm">Your purchase history will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View - Shown only on Mobile */}
      <div className="md:hidden space-y-3">
        {purchases.length > 0 ? (
          purchases.map((purchase) => (
            <Card key={purchase.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {purchase.id.slice(0, 10)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDate(purchase.purchase_date)}</span>
                      </div>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between py-2 border-t border-b">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{purchase.items_count} item(s)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(purchase.total_amount)}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {purchase.payment_method}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => fetchPurchaseDetail(purchase.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {purchase.status === "success" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewInvoice(purchase.id)}
                          title="Preview"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(purchase.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-muted-foreground mb-1">
                No purchases found
              </p>
              <p className="text-sm text-muted-foreground">
                Your purchase history will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Purchase Detail Dialog - Responsive */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Purchase Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Order ID: {selectedPurchase?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4 sm:space-y-6 py-4">
              {/* Purchase Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Purchase Date
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(selectedPurchase.purchase_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                      {getStatusBadge(selectedPurchase.status)}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Payment Method
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {selectedPurchase.payment_method}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items - Desktop Table */}
              <Card className="hidden sm:block">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPurchase.items.map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product_title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.product_slug}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price_per_unit)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedPurchase.status === "success" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  downloadProduct(
                                    selectedPurchase.id,
                                    item.product_id,
                                    item.product_slug
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Items - Mobile Cards */}
              <Card className="sm:hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPurchase.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.product_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.product_slug}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                      {selectedPurchase.status === "success" && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            downloadProduct(
                              selectedPurchase.id,
                              item.product_id,
                              item.product_slug
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Billing Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">
                        Subtotal (Before Tax)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(selectedPurchase.base_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-muted-foreground">
                        GST ({selectedPurchase.gst_percentage}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(selectedPurchase.gst_amount)}
                      </span>
                    </div>
                    <div className="border-t pt-2 sm:pt-3 flex justify-between">
                      <span className="text-base sm:text-lg font-bold">Total Amount</span>
                      <span className="text-base sm:text-lg font-bold text-primary">
                        {formatCurrency(selectedPurchase.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {selectedPurchase.status === "success" && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => previewInvoice(selectedPurchase.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Invoice
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => downloadInvoice(selectedPurchase.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPurchases;