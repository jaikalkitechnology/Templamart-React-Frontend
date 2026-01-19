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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Calendar, Download, TrendingUp, Users, ShoppingBag, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const AnalyticsManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [reportData, setReportData] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/admin/reports/sales`,
        {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      setReportData(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickStats = async (period: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/reports/quick-stats?period=${period}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      );
      // Handle quick stats data
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  useEffect(() => {
    fetchQuickStats(period);
  }, [period]);

  const exportAnalytics = () => {
    // Export analytics data as CSV or PDF
    console.log("Exporting analytics data...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights and performance metrics
          </p>
        </div>
        <Button onClick={exportAnalytics}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div>
                <label className="text-sm font-medium">From</label>
                <input
                  type="date"
                  value={dateRange.from.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input
                  type="date"
                  value={dateRange.to.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Quick Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData ? formatCurrency(
                reportData.daily_sales.reduce((sum: number, day: any) => sum + day.total_revenue, 0)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              During selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData ? 
                reportData.daily_sales.reduce((sum: number, day: any) => sum + day.order_count, 0)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData ? formatCurrency(
                reportData.daily_sales.reduce((sum: number, day: any) => sum + day.total_revenue, 0) /
                Math.max(reportData.daily_sales.reduce((sum: number, day: any) => sum + day.order_count, 0), 1)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData ? formatCurrency(
                reportData.daily_sales.reduce((sum: number, day: any) => sum + day.total_revenue, 0) /
                Math.max(reportData.daily_sales.length, 1)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={reportData?.daily_sales.map((day: any) => ({
                name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: day.total_revenue,
                orders: day.order_count
              })) || []}
              index="name"
              categories={["revenue", "orders"]}
              colors={["blue", "green"]}
              valueFormatter={(value: number) => formatCurrency(value)}
              className="h-72"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>
              Revenue by product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={reportData?.product_sales.slice(0, 5).map((product: any) => ({
                name: product.product_name,
                revenue: product.total_revenue,
                sales: product.sales_count
              })) || []}
              index="name"
              categories={["revenue"]}
              colors={["blue"]}
              valueFormatter={(value: number) => formatCurrency(value)}
              className="h-72"
            />
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>
            Detailed sales by product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Seller</th>
                  <th className="text-left py-3 px-4">Sales Count</th>
                  <th className="text-left py-3 px-4">Total Revenue</th>
                  <th className="text-left py-3 px-4">Commission</th>
                  <th className="text-left py-3 px-4">Avg. Price</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.product_sales.map((product: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{product.product_name}</td>
                    <td className="py-3 px-4">{product.seller}</td>
                    <td className="py-3 px-4">{product.sales_count}</td>
                    <td className="py-3 px-4 font-bold">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(product.total_commission)}
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(product.total_revenue / Math.max(product.sales_count, 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsManagement;