import { useState, useEffect, useRef } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Eye,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingBag,
  User,
  Package,
  Wallet,
  FileText,
  Printer,
  Mail,
  TrendingUp,
  Percent,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  RefreshCw,
  FileDown,
  Building,
  MapPin,
  Phone,
  Globe,
  FileCheck,
  Receipt,
  IndianRupee
} from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

export interface SellerSalesProps {
  totalRevenue: number;
  totalEarnings: number;
  totalPlatformFees: number;
  pendingSettlements: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface KYCDetails {
  company_name: string;
  gst_number: string | null;
  pan_number: string;
  state: string;
  city: string;
  pin_code: string;
  mobile_number: string;
}

const COMPANY_DETAILS = {
  name: "RootPay Pvt Ltd",
  address: "B1/A, Ground Floor, Anand Hub, Behind Shree Mahalaxmi Hospital Road, Thane – 400066",
  gst: "27AABCR1234Q1Z5",
  state: "Maharashtra",
  stateCode: "27",
  email: "accounts@rootpay.com",
  phone: "+91-22-12345678",
  website: "www.rootpay.com",
  bankDetails: {
    name: "State Bank of India",
    account: "123456789012",
    ifsc: "SBIN0001234",
    branch: "Thane West"
  }
};

const SellerSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<SellerOrderTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState<SellerOrderTxn | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [salesProps, setSalesProps] = useState<SellerSalesProps>({
    totalRevenue: 0,
    totalEarnings: 0,
    totalPlatformFees: 0,
    pendingSettlements: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [kycDetails, setKycDetails] = useState<KYCDetails | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  const fetchKYCDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dash/seller/kyc/status`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (response.data.kyc_details) {
        setKycDetails(response.data.kyc_details);
      }
    } catch (error) {
      console.error("Error fetching KYC details:", error);
    }
  };

  const fetchSales = async (page: number = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        skip: String((page - 1) * pageSize),
        limit: String(pageSize),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (dateRange.from) {
        params.append("start_date", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("end_date", dateRange.to.toISOString());
      }

      const [salesRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/dash/seller/seller_transactions?${params}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
        axios.get(`${BASE_URL}/dash/seller/seller_sales_stats`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
      ]);

      setSales(salesRes.data);
      setSalesProps({
        totalRevenue: statsRes.data.totalRevenue || 0,
        totalEarnings: statsRes.data.totalEarnings || 0,
        totalPlatformFees: statsRes.data.totalPlatformFees || 0,
        pendingSettlements: statsRes.data.pendingSettlements || 0,
        totalOrders: statsRes.data.totalOrders || 0,
        averageOrderValue: statsRes.data.averageOrderValue || 0
      });
      
      setTotalPages(salesRes.data.length < pageSize ? page : page + 1);
      
      // Fetch KYC details if not already loaded
      if (!kycDetails) {
        await fetchKYCDetails();
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage, statusFilter, dateRange]);

  const exportSales = () => {
    const csvData = [
      ["Order ID", "Order Status", "Date", "Amount", "Settled", "Platform Fee", "GST", "Status", "Items"],
      ...sales.map((sale) => [
        sale.order_id,
        sale.order_status,
        formatDate(sale.purchase_date),
        sale.amount,
        sale.settled_amount,
        sale.balance_amount,
        sale.gst,
        sale.order_status,
        sale.products.map(item => `${item.product_name} (${item.quantity}x)`).join(", "),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const viewSaleDetails = (sale: SellerOrderTxn) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const generateInvoice = async (sale: SellerOrderTxn) => {
    setSelectedSale(sale);
    setInvoiceLoading(true);
    await fetchKYCDetails();
    setInvoiceLoading(false);
    setShowInvoice(true);
  };

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const html = element.innerHTML;
    const style = `
      <style>
        @page { margin: 20mm; }
        body { font-family: Arial, sans-serif; }
        .invoice-container { padding: 20px; }
      </style>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Invoice ${selectedSale?.order_id}</title>
            ${style}
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.order_id.toLowerCase().includes(search.toLowerCase()) ||
      sale.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.buyer_email?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-gradient-to-r from-blue-500 to-purple-500"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading your sales data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Dashboard
            </h2>
          </div>
          <p className="text-muted-foreground">
            Track, manage, and analyze your sales performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => fetchSales(currentPage)}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={exportSales}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Revenue
                </p>
                <h3 className="text-3xl font-bold mt-2 flex items-center">
                  <IndianRupee className="h-7 w-7 mr-1" />
                  {formatCurrency(salesProps.totalRevenue)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={80} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                From {salesProps.totalOrders} orders
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Your Earnings
                </p>
                <h3 className="text-3xl font-bold mt-2 flex items-center">
                  <IndianRupee className="h-7 w-7 mr-1" />
                  {formatCurrency(salesProps.totalEarnings)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={65} className="h-2 bg-green-100" />
              <p className="text-xs text-muted-foreground mt-2">
                After commissions and fees
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Platform Fees
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {formatCurrency(salesProps.totalPlatformFees)}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm">
                <span className="font-bold">
                  {salesProps.totalOrders > 0 
                    ? ((salesProps.totalPlatformFees / salesProps.totalRevenue) * 100).toFixed(1)
                    : "0"
                  }%
                </span> of revenue
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID, customer name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-40"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-40"
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-11 border-2">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Transaction History</CardTitle>
              <CardDescription>
                {filteredSales.length} orders • {formatCurrency(salesProps.totalRevenue)} total
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Earnings</TableHead>
                  <TableHead className="font-semibold">Fees</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow 
                    key={sale.order_id} 
                    className="hover:bg-muted/30 transition-colors border-b border-gray-100"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-100">
                          <Receipt className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="font-mono text-sm">
                          {sale.order_id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          {sale.buyer_name || "Anonymous"}
                        </p>
                        {sale.buyer_email && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {sale.buyer_email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(sale.purchase_date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {formatCurrency(sale.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-green-600 font-bold flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        +{formatCurrency(sale.settled_amount || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-red-600 font-bold flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        -{formatCurrency(sale.balance_amount || 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sale.order_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewSaleDetails(sale)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sale.order_status === "success" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => generateInvoice(sale)}
                            className="h-8 w-8 p-0"
                            disabled={invoiceLoading}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t">
              <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {filteredSales.length} of {salesProps.totalOrders} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Order ID:</span>
                        <code className="font-mono text-sm px-2 py-1 bg-muted rounded">
                          {selectedSale.order_id}
                        </code>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Date:</span>
                        <span className="font-medium">{formatDate(selectedSale.purchase_date)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Status:</span>
                        {getStatusBadge(selectedSale.order_status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Name:</span>
                        <span className="font-medium">{selectedSale.buyer_name || "Anonymous"}</span>
                      </div>
                      {selectedSale.buyer_email && (
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="font-medium text-sm">{selectedSale.buyer_email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedSale.products.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-white border"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Product ID: {item.product_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.total_price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price_per_unit)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(selectedSale.total_amount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center p-3 text-red-600">
                      <span>Platform Fee ({selectedSale.platform_fee ? "15%" : "0%"})</span>
                      <span className="font-medium">
                        -{formatCurrency(selectedSale.balance_amount || 0)}
                      </span>
                    </div>
                    {selectedSale.gst && (
                      <div className="flex justify-between items-center p-3 text-red-600">
                        <span>GST (18%)</span>
                        <span className="font-medium">
                          -{formatCurrency(selectedSale.gst || 0)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center p-3 text-green-600 font-bold text-lg bg-gradient-to-r from-green-50 to-white rounded-lg">
                      <span>Your Earnings:</span>
                      <span>+{formatCurrency(selectedSale.settled_amount || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Sales Invoice
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadInvoice}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={downloadInvoice}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && kycDetails && (
            <div ref={invoiceRef} className="invoice-container bg-white p-8 rounded-lg border shadow-sm">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Building className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">ROOTPAY</h1>
                      <p className="text-sm text-muted-foreground">Private Limited</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {COMPANY_DETAILS.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {COMPANY_DETAILS.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {COMPANY_DETAILS.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {COMPANY_DETAILS.website}
                    </p>
                    <p className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      GST: {COMPANY_DETAILS.gst}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-sm text-muted-foreground">Original Copy</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-4">
                      <span className="font-medium">Invoice #:</span>
                      <span className="font-mono">{selectedSale.order_id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(selectedSale.purchase_date)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="font-medium">Status:</span>
                      <Badge className="bg-green-100 text-green-800">PAID</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Bill To / Seller Details */}
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Bill To (Seller)
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-lg">{kycDetails.company_name}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {kycDetails.city}, {kycDetails.state} - {kycDetails.pin_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PAN: {kycDetails.pan_number}
                    </p>
                    {kycDetails.gst_number && (
                      <p className="text-sm text-muted-foreground">
                        GST: {kycDetails.gst_number}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Mobile: {kycDetails.mobile_number}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedSale.buyer_name || "Anonymous Customer"}</p>
                    {selectedSale.buyer_email && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedSale.buyer_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 font-semibold border">Product</th>
                        <th className="text-left p-3 font-semibold border">Quantity</th>
                        <th className="text-left p-3 font-semibold border">Unit Price</th>
                        <th className="text-left p-3 font-semibold border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.products.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 border">{item.product_name}</td>
                          <td className="p-3 border text-center">{item.quantity}</td>
                          <td className="p-3 border text-right">₹{item.price_per_unit.toFixed(2)}</td>
                          <td className="p-3 border text-right font-medium">₹{item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-3">Payment Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      • Payment settled to seller account within 3-5 business days
                      <br />
                      • Platform fees deducted at source
                      <br />
                      • GST as applicable
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border">
                    <h4 className="font-bold text-lg mb-4">Payment Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Gross Amount:</span>
                        <span className="font-medium">₹{selectedSale.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Platform Fee (15%):</span>
                        <span>-₹{(selectedSale.balance_amount || 0).toFixed(2)}</span>
                      </div>
                      {selectedSale.gst && (
                        <div className="flex justify-between text-red-600">
                          <span>GST (18% on fee):</span>
                          <span>-₹{(selectedSale.gst || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-green-600 font-bold text-lg">
                        <span>Net Amount Payable:</span>
                        <span>₹{(selectedSale.settled_amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">RootPay Pvt Ltd</p>
                    <p>Bank: {COMPANY_DETAILS.bankDetails.name}</p>
                    <p>Account: {COMPANY_DETAILS.bankDetails.account}</p>
                    <p>IFSC: {COMPANY_DETAILS.bankDetails.ifsc}</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <p>This is a computer-generated invoice</p>
                    <p>No signature required</p>
                  </div>
                </div>
                <div className="mt-6 text-center text-xs text-muted-foreground">
                  <p>Thank you for selling with RootPay!</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerSales;