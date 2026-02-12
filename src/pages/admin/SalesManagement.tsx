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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Download, 
  Search, 
  Wallet,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  User,
  Filter,
  Calendar,
  FileText,
  Eye,
  Printer,
  Mail,
  MoreVertical,
  ChevronRight,
  TrendingDown,
  Users,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

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
// Invoice Component
// ============================================================

// ============================================================
// Invoice Component with Print Support
// ============================================================

interface InvoiceProps {
  transaction: TransactionReport;
  onClose: () => void;
}

const InvoiceModal = ({ transaction, onClose }: InvoiceProps) => {
  const gstRate = 18; // Assuming 18% GST
  const amountWithoutGST = transaction.total_amount / (1 + gstRate/100);
  const calculatedGST = transaction.total_amount - amountWithoutGST;
  const invoiceNumber = `INV-${transaction.order_id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const invoiceData = {
    invoiceNo: invoiceNumber,
    date: invoiceDate,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    company: {
      name: "RootPay PVT LTD",
      address: "123 Business Street, Mumbai, Maharashtra 400001",
      gstin: "27AABCU9603R1ZM",
      pan: "AABCU9603R",
      email: "accounts@rootpay.in",
      phone: "+91 9876543210",
      website: "www.rootpay.in"
    },
    buyer: {
      name: transaction.buyer_username,
      email: transaction.buyer_email,
      id: `BUYER-${transaction.buyer_id.toString().padStart(6, '0')}`,
      billingAddress: "Customer billing address"
    },
    seller: {
      name: transaction.seller_username,
      email: transaction.seller_email,
      id: `SELLER-${transaction.seller_id.toString().padStart(6, '0')}`,
      shippingAddress: "Seller shipping address"
    },
    items: [{
      description: transaction.product_name,
      quantity: transaction.quantity,
      unitPrice: transaction.price_per_unit,
      total: transaction.total_amount
    }],
    payment: {
      mode: transaction.payment_mode,
      txnId: transaction.txn_id,
      status: transaction.status,
      date: formatDate(transaction.purchase_date)
    }
  };

const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceData.invoiceNo} - RootPay</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            @page {
              margin: 10mm;
              size: A4;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            .invoice-container {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.4;
            color: #333;
            background: #fff;
            padding: 10px;
          }
          
          .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
            padding: 20px;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
          }
          
          .company-info h1 {
            color: #2563eb;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 3px;
          }
          
          .company-tagline {
            color: #64748b;
            font-size: 11px;
            margin-bottom: 6px;
          }
          
          .company-details p {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 2px;
            line-height: 1.3;
          }
          
          .invoice-meta {
            text-align: right;
          }
          
          .invoice-title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 3px;
          }
          
          .invoice-number {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 6px;
          }
          
          .status-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .detail-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            background: #f8fafc;
          }
          
          .detail-card h3 {
            color: #475569;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          
          .detail-item {
            margin-bottom: 5px;
          }
          
          .detail-label {
            font-size: 9px;
            color: #64748b;
            font-weight: 500;
          }
          
          .detail-value {
            font-size: 11px;
            color: #1e293b;
            font-weight: 600;
            line-height: 1.3;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 1px solid #e2e8f0;
          }
          
          .items-table th {
            background: #f1f5f9;
            padding: 8px;
            text-align: left;
            font-size: 10px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .items-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .total-section {
            margin-left: auto;
            width: 280px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .total-row.total-label {
            font-size: 11px;
            color: #64748b;
          }
          
          .total-row.total-value {
            font-size: 13px;
            color: #1e293b;
            font-weight: 600;
          }
          
          .grand-total {
            border-top: 2px solid #2563eb;
            margin-top: 8px;
            padding-top: 10px;
          }
          
          .grand-total .total-label {
            font-size: 14px;
            color: #1e293b;
            font-weight: 700;
          }
          
          .grand-total .total-value {
            font-size: 18px;
            color: #2563eb;
            font-weight: 700;
          }
          
          .gst-breakdown {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 10px;
            margin-top: 10px;
          }
          
          .gst-title {
            color: #0369a1;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          
          .gst-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 3px;
          }
          
          .payment-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
          }
          
          .payment-info h3 {
            color: #475569;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .payment-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          
          .payment-item {
            font-size: 10px;
          }
          
          .payment-label {
            color: #64748b;
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .payment-value {
            color: #1e293b;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 15px;
            text-align: center;
            color: #64748b;
            font-size: 9px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
          
          .terms {
            background: #f8fafc;
            padding: 10px;
            border-radius: 5px;
            margin-top: 12px;
            font-size: 9px;
            line-height: 1.4;
          }
          
          .stamp {
            position: absolute;
            right: 30px;
            bottom: 30px;
            transform: rotate(15deg);
            opacity: 0.8;
          }
          
          .stamp-content {
            border: 2px solid #10b981;
            color: #10b981;
            padding: 12px;
            border-radius: 50%;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-weight: 700;
            font-size: 10px;
            background: rgba(16, 185, 129, 0.1);
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(37, 99, 235, 0.03);
            font-weight: 900;
            z-index: -1;
            white-space: nowrap;
          }
          
          .invoice-meta-dates {
            font-size: 10px;
            color: #64748b;
          }
          
          .amount-words {
            font-size: 9px;
            color: #64748b;
            text-align: right;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="watermark">ROOTPAY</div>
        
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="company-info">
              <h1>RootPay PVT LTD</h1>
              <div class="company-tagline">Digital Payments & E-commerce Solutions</div>
              <div class="company-details">
                <p>123 Business Street, Mumbai, Maharashtra 400001</p>
                <p>GSTIN: ${invoiceData.company.gstin} | PAN: ${invoiceData.company.pan}</p>
                <p>Email: ${invoiceData.company.email} | Phone: ${invoiceData.company.phone} | Web: ${invoiceData.company.website}</p>
              </div>
            </div>
            
            <div class="invoice-meta">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoiceData.invoiceNo}</div>
              <div class="status-badge">PAID</div>
              <div class="invoice-meta-dates">
                <p><strong>Date:</strong> ${invoiceData.date}</p>
                <p><strong>Due:</strong> ${invoiceData.dueDate}</p>
              </div>
            </div>
          </div>
          
          <!-- Details Grid -->
          <div class="details-grid">
            <div class="detail-card">
              <h3>Bill To</h3>
              <div class="detail-item">
                <div class="detail-label">Customer</div>
                <div class="detail-value">${invoiceData.buyer.name} (${invoiceData.buyer.id})</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${invoiceData.buyer.email}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">${invoiceData.buyer.billingAddress}</div>
              </div>
            </div>
            
            <div class="detail-card">
              <h3>Seller Details</h3>
              <div class="detail-item">
                <div class="detail-label">Seller</div>
                <div class="detail-value">${invoiceData.seller.name} (${invoiceData.seller.id})</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${invoiceData.seller.email}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">${invoiceData.seller.shippingAddress}</div>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div class="total-section">
            <div class="gst-breakdown">
              <div class="gst-title">GST Breakdown</div>
              <div class="gst-row">
                <span>Subtotal (Excluding GST):</span>
                <span>${formatCurrency(amountWithoutGST)}</span>
              </div>
              <div class="gst-row">
                <span>GST (${gstRate}%):</span>
                <span>${formatCurrency(calculatedGST)}</span>
              </div>
              <div class="gst-row" style="border-top: 1px solid #bae6fd; padding-top: 5px; margin-top: 5px;">
                <span><strong>Total (Including GST):</strong></span>
                <span><strong>${formatCurrency(transaction.total_amount)}</strong></span>
              </div>
            </div>
            
            <div class="total-row grand-total">
              <div class="total-label">GRAND TOTAL</div>
              <div class="total-value">${formatCurrency(transaction.total_amount)}</div>
            </div>
            
            <div class="amount-words">
              Amount in words: ${amountToWords(transaction.total_amount)}
            </div>
          </div>
          
          <!-- Payment Information -->
          <div class="payment-info">
            <h3>Payment Information</h3>
            <div class="payment-grid">
              <div class="payment-item">
                <div class="payment-label">Payment Mode</div>
                <div class="payment-value">${invoiceData.payment.mode}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Transaction ID</div>
                <div class="payment-value">${invoiceData.payment.txnId}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Payment Date</div>
                <div class="payment-value">${invoiceData.payment.date}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Status</div>
                <div class="payment-value">
                  <span style="
                    display: inline-block;
                    background: #10b981;
                    color: white;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 9px;
                    font-weight: 600;
                  ">
                    ${invoiceData.payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Terms & Footer -->
          <div class="terms">
            <p><strong>Terms & Conditions:</strong></p>
            <p>1. Payment due within 30 days. 2. Late payments subject to 2% monthly interest. 3. All disputes subject to Mumbai jurisdiction. 4. Computer generated invoice - no signature required.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business! For queries: ${invoiceData.company.email} | ${invoiceData.company.phone}</p>
            <p style="margin-top: 3px;">RootPay PVT LTD - Registered under GST Act, 2017</p>
          </div>
          
          <!-- Stamp -->
          <div class="stamp no-print">
            <div class="stamp-content">
              PAID<br>${invoiceData.date}
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print when the page loads
          window.onload = () => {
            setTimeout(() => {
              window.print();
              // Close the window after printing if it's a popup
              setTimeout(() => {
                if (window.opener) {
                  window.close();
                }
              }, 1000);
            }, 500);
          };
          
          // Handle print dialog close
          window.onafterprint = () => {
            if (window.opener) {
              window.close();
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  const amountToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero Rupees';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    const parts = [];
    if (num >= 10000000) {
      parts.push(convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore');
      num %= 10000000;
    }
    if (num >= 100000) {
      parts.push(convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh');
      num %= 100000;
    }
    if (num >= 1000) {
      parts.push(convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand');
      num %= 1000;
    }
    if (num > 0) {
      parts.push(convertLessThanThousand(num));
    }
    
    const words = parts.join(' ');
    return words + ' Rupees Only';
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML());
      printWindow.document.close();
    }
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Invoice Preview - {invoiceNumber}
        </DialogTitle>
        <DialogDescription>
          Preview the invoice before printing or downloading
        </DialogDescription>
      </DialogHeader>

      {/* Preview Container */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="relative">
          {/* Watermark for preview */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="text-6xl font-bold text-gray-300 transform -rotate-45">PREVIEW</div>
          </div>
          
          {/* Invoice Preview */}
          <div className="relative bg-white p-8 border rounded-lg">
            <div className="flex justify-between items-start mb-8 border-b-2 border-blue-600 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">RootPay PVT LTD</h2>
                <p className="text-sm text-gray-600 mt-1">Digital Payments & E-commerce Solutions</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-600">123 Business Street, Mumbai, Maharashtra 400001</p>
                  <p className="text-xs text-gray-600">GSTIN: 27AABCU9603R1ZM | PAN: AABCU9603R</p>
                  <p className="text-xs text-gray-600">Email: accounts@rootpay.in | Phone: +91 9876543210</p>
                  <p className="text-xs text-gray-600">Website: www.rootpay.in</p>
                </div>
              </div>
              
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                    PAID
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Invoice No:</span> {invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date:</span> {invoiceDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer/Seller Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Bill To</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{invoiceData.buyer.name}</p>
                  <p className="text-sm text-gray-600">ID: {invoiceData.buyer.id}</p>
                  <p className="text-sm text-gray-600">{invoiceData.buyer.email}</p>
                  <p className="text-sm text-gray-600">{invoiceData.buyer.billingAddress}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Seller Details</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{invoiceData.seller.name}</p>
                  <p className="text-sm text-gray-600">ID: {invoiceData.seller.id}</p>
                  <p className="text-sm text-gray-600">{invoiceData.seller.email}</p>
                  <p className="text-sm text-gray-600">{invoiceData.seller.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700 text-sm">Description</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700 text-sm">Quantity</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700 text-sm">Unit Price</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold text-gray-700 text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="border border-gray-200 p-3">{item.description}</td>
                      <td className="border border-gray-200 p-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-200 p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-200 p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-96">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-700 mb-3">GST Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal (Excluding GST):</span>
                      <span className="text-sm font-medium">{formatCurrency(amountWithoutGST)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">GST ({gstRate}%):</span>
                      <span className="text-sm font-medium text-red-600">{formatCurrency(calculatedGST)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                      <span className="font-semibold text-gray-700">Total (Including GST):</span>
                      <span className="font-bold text-blue-700">{formatCurrency(transaction.total_amount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">GRAND TOTAL</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(transaction.total_amount)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    {amountToWords(transaction.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Mode</p>
                  <p className="font-medium">{invoiceData.payment.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium font-mono text-sm">{invoiceData.payment.txnId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium">{invoiceData.payment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {invoiceData.payment.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          <p>This is a preview. Click "Print Invoice" for a formatted printable version.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

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
  const [selectedInvoice, setSelectedInvoice] = useState<TransactionReport | null>(null);

  // Chart data formatting
  const formatChartData = (data: RevenueTrend[]) => {
    return data.map(item => ({
      ...item,
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  const transactionStatusData = sellerStats ? [
    { name: 'Success', value: sellerStats.successful_transactions, color: '#10b981' },
    { name: 'Pending', value: sellerStats.pending_transactions, color: '#f59e0b' },
    { name: 'Failed', value: sellerStats.failed_transactions, color: '#ef4444' },
  ] : [];

  // API Calls (same as before)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // OVERVIEW VIEW - All Sellers with Wallets
  // ============================================================

  if (view === "overview") {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Management
            </h2>
            <p className="text-muted-foreground mt-1">
              Monitor seller performance and wallet balances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Sellers</p>
                  <p className="text-3xl font-bold mt-2">{sellersOverview.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active on platform</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-gradient-to-br from-white to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Balance</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(sellersOverview.reduce((sum, seller) => sum + seller.total_balance, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all wallets</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Sales</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(sellersOverview.reduce((sum, seller) => sum + seller.total_sales, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Lifetime sales</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Pending Settlement</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatCurrency(sellersOverview.reduce((sum, seller) => sum + seller.pending_settlement, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting clearance</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Quick Seller Selection
              </CardTitle>
              <CardDescription>Select a seller to view detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => handleSelectSeller(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a seller..." />
                </SelectTrigger>
                <SelectContent>
                  {sellersList.slice(0, 10).map((seller) => (
                    <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{seller.username}</p>
                          <p className="text-xs text-gray-500">{seller.email}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Sellers
              </CardTitle>
              <CardDescription>Find sellers by name, email, or ID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sellers by username, email, or ID..."
                    value={searchSeller}
                    onChange={(e) => setSearchSeller(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sellers Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Sellers Overview</CardTitle>
                <CardDescription>
                  {sellersOverview.length} sellers • Sorted by Total Balance
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => toast.info("Feature coming soon")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Feature coming soon")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="font-semibold">Seller</TableHead>
                    <TableHead className="font-semibold">Wallet</TableHead>
                    <TableHead className="font-semibold">Payout Wallet</TableHead>
                    <TableHead className="font-semibold">Total Balance</TableHead>
                    <TableHead className="font-semibold">Sales</TableHead>
                    <TableHead className="font-semibold">Settled</TableHead>
                    <TableHead className="font-semibold">Pending</TableHead>
                    <TableHead className="font-semibold">Transactions</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellersOverview.map((seller) => (
                    <TableRow key={seller.seller_id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{seller.username}</p>
                            <p className="text-sm text-gray-500">{seller.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-blue-500" />
                          <span className="font-bold text-blue-600">
                            {formatCurrency(seller.wallet_balance)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-500" />
                          <span className="font-bold text-green-600">
                            {formatCurrency(seller.payout_wallet_balance)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-lg">
                          {formatCurrency(seller.total_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(seller.total_sales)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {formatCurrency(seller.total_settled)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          {formatCurrency(seller.pending_settlement)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16">
                            <Progress value={(seller.transaction_count / 100) * 100} className="h-2" />
                          </div>
                          <span className="font-medium">{seller.transaction_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSelectSeller(seller.seller_id)}
                          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // SELLER DETAIL VIEW - Selected Seller Statistics
  // ============================================================

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToOverview}
            className="gap-2 border-gray-200 hover:border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              {selectedSellerData?.username}
            </h2>
            <p className="text-gray-500">{selectedSellerData?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => selectedSellerId && exportSellerReport(selectedSellerId)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
            <Printer className="h-4 w-4" />
            Print Summary
          </Button>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet Balance
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {sellerStats ? formatCurrency(sellerStats.wallet_balance) : "₦0.00"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Available for purchases</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payout Wallet
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {sellerStats ? formatCurrency(sellerStats.payout_wallet_balance) : "₦0.00"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready for withdrawal</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Sales
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {sellerStats ? formatCurrency(sellerStats.total_sales) : "₦0.00"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sellerStats?.total_transactions || 0} transactions
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold">
                  {sellerStats ? sellerStats.success_rate.toFixed(1) : "0"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Settlement</p>
                <p className="text-2xl font-bold">
                  {sellerStats ? formatCurrency(sellerStats.pending_settlement) : "₦0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Order Value</p>
                <p className="text-2xl font-bold">
                  {sellerStats ? formatCurrency(sellerStats.average_order_value) : "₦0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed Transactions</p>
                <p className="text-2xl font-bold">
                  {sellerStats?.failed_transactions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue metrics</CardDescription>
              </div>
              <Select value={trendDays.toString()} onValueChange={(v) => setTrendDays(parseInt(v))}>
                <SelectTrigger className="w-[140px]">
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
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData(revenueTrend)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                    labelStyle={{ color: '#666' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="settled"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Transaction Status
            </CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Transactions"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={txnTypeFilter} onValueChange={setTxnTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                  <SelectItem value="PayOut">PayOut</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-[140px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-[140px]"
                />
              </div>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transactions found • Showing recent 100
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="all" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="success">Success</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((txn) => (
                    <TableRow key={txn.txn_id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {txn.order_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{txn.buyer_username}</p>
                            <p className="text-xs text-gray-500">{txn.buyer_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{txn.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {txn.quantity}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">{formatCurrency(txn.total_amount)}</p>
                          <p className="text-xs text-gray-500">
                            Settled: {formatCurrency(txn.settle_amount)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            txn.transaction_type === 'Sales' ? 'border-blue-200 text-blue-700' :
                            txn.transaction_type === 'Settled' ? 'border-green-200 text-green-700' :
                            'border-purple-200 text-purple-700'
                          }
                        >
                          {txn.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            txn.status === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                            'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          <span className="flex items-center gap-1">
                            {txn.status === 'success' && <CheckCircle className="h-3 w-3" />}
                            {txn.status === 'pending' && <Clock className="h-3 w-3" />}
                            {txn.status === 'failed' && <XCircle className="h-3 w-3" />}
                            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(txn.purchase_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DialogTrigger asChild>
                            {txn.status === 'success' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedInvoice(txn)}
                                className="gap-2"
                              >
                                <Eye className="h-3 w-3" />
                                Invoice
                              </Button>
                            )}
                          </DialogTrigger>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Invoice Dialog */}
            {selectedInvoice && (
              <InvoiceModal 
                transaction={selectedInvoice} 
                onClose={() => setSelectedInvoice(null)} 
              />
            )}
          </Dialog>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">No transactions found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagement;