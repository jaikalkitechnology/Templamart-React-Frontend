import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  X, 
  ExternalLink, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Shield, 
  Lock, 
  ArrowRight, 
  Package, 
  RefreshCw, 
  Sparkles, 
  Gift, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Star,
  ChevronRight,
  Receipt,
  Percent,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { useShoppingContext } from "@/context/ShoppingContext";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Cart = () => {
  const { cart, removeFromCart, clearCart, addToCart } = useShoppingContext();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Calculate prices correctly with GST extraction
  const calculatePrices = () => {
    const GST_RATE = 0.18; // 18% GST
    
    // Total including GST (this is the product price)
    const totalIncludingGST = cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
    
    // Extract GST from the total (price already includes GST)
    // If price is ₹118, then base = 118/1.18 = 100, GST = 18
    const baseAmount = totalIncludingGST / (1 + GST_RATE);
    const gstAmount = totalIncludingGST - baseAmount;
    
    // Apply discount on base amount
    const discountAmount = discount;
    const baseAfterDiscount = baseAmount - discountAmount;
    
    // Calculate GST on discounted amount
    const gstOnDiscounted = baseAfterDiscount * GST_RATE;
    
    // Final total
    const finalTotal = baseAfterDiscount + gstOnDiscounted;
    
    return {
      baseAmount: baseAmount,
      gstAmount: gstOnDiscounted,
      totalIncludingGST: totalIncludingGST,
      discountAmount: discountAmount,
      finalTotal: finalTotal,
      savings: totalIncludingGST - finalTotal
    };
  };

  const prices = calculatePrices();

  const handleApplyCoupon = () => {
    setIsLoading(true);
    setTimeout(() => {
      const baseAmount = prices.baseAmount;
      
      if (couponCode.toLowerCase() === "welcome10") {
        const discountAmount = baseAmount * 0.1;
        setDiscount(discountAmount);
        toast.success("Coupon Applied!", {
          description: "🎉 10% discount has been applied to your order!",
          duration: 3000,
        });
      } else if (couponCode.toLowerCase() === "firstorder") {
        const discountAmount = baseAmount * 0.15;
        setDiscount(discountAmount);
        toast.success("Coupon Applied!", {
          description: "🎊 15% discount for your first order!",
          duration: 3000,
        });
      } else if (couponCode.toLowerCase() === "summer20") {
        const discountAmount = baseAmount * 0.2;
        setDiscount(discountAmount);
        toast.success("Coupon Applied!", {
          description: "🌞 20% summer discount applied!",
          duration: 3000,
        });
      } else {
        toast.error("Invalid Coupon Code", {
          description: "The coupon code you entered is invalid or expired.",
          duration: 3000,
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode("");
    toast.info("Coupon Removed", {
      description: "Discount has been removed from your order.",
    });
  };

  const handleCheckout = () => {
    toast.success("Redirecting to Checkout", {
      description: "You'll be redirected to secure payment in 2 seconds...",
      duration: 2000,
    });
    setTimeout(() => {
      // Navigate to checkout
    }, 2000);
  };

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
      toast.info("Item removed", {
        description: `${item.title} has been removed from your cart.`,
      });
    } else {
      removeFromCart(item.id);
      for (let i = 0; i < newQuantity; i++) {
        addToCart(item);
      }
    }
  };

  const clearCartWithConfirmation = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      setDiscount(0);
      setCouponCode("");
      toast.info("Cart Cleared", {
        description: "All items have been removed from your cart.",
      });
    }
  };

  const getWebsiteUrl = (item) => {
    if (item.website) return item.website;
    if (item.liveDemoUrl) return item.liveDemoUrl;
    if (item.previewUrl) return item.previewUrl;
    return item.image;
  };

  const isEmbeddableUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const popularCoupons = [
    { code: "WELCOME10", discount: "10% off", desc: "For new customers", color: "from-blue-500 to-cyan-500" },
    { code: "FIRSTORDER", discount: "15% off", desc: "First purchase only", color: "from-purple-500 to-pink-500" },
    { code: "SUMMER20", discount: "20% off", desc: "Limited time offer", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background pb-20 lg:pb-0">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 py-6 md:py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Shopping Cart</h1>
              <p className="text-white/80 mt-1 md:mt-2 text-sm md:text-base">Review your items before checkout</p>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm">
              <ShoppingCart className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container px-4 py-4 md:py-8">
        {cart.length > 0 ? (
          <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 md:p-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-xl flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden sm:inline">Cart Items</span>
                      <span className="sm:hidden">Items</span>
                    </CardTitle>
                    <Badge variant="outline" className="bg-background text-xs md:text-sm">
                      {cart.length}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  <div className="divide-y">
                    {cart.map((item) => {
                      const websiteUrl = getWebsiteUrl(item);
                      const isEmbeddable = isEmbeddableUrl(websiteUrl);
                      
                      return (
                        <div key={item.id} className="group hover:bg-muted/30 transition-colors">
                          <div className="p-3 md:p-6">
                            <div className="flex gap-3 md:gap-4">
                              {/* Product Image */}
                              <div className="relative w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-lg md:rounded-xl overflow-hidden border bg-gradient-to-br from-muted to-muted/50 group-hover:shadow-lg transition-all flex-shrink-0">
                                {isEmbeddable ? (
                                  <iframe
                                    src={websiteUrl}
                                    title={`${item.title} Preview`}
                                    className="h-full w-full pointer-events-none"
                                    sandbox="allow-scripts allow-same-origin"
                                    loading="lazy"
                                    style={{ border: 'none' }}
                                  />
                                ) : (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                                {item.price == 0.00 && (
                                  <Badge className="absolute top-1 left-1 md:top-2 md:left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                                    FREE
                                  </Badge>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-2 md:gap-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm md:text-lg leading-tight">
                                        <Link
                                          to={`/template/${item.id}`}
                                          className="hover:text-primary transition-colors line-clamp-2"
                                        >
                                          {item.title}
                                        </Link>
                                      </h3>
                                      <p className="hidden md:block text-muted-foreground text-sm mt-1 line-clamp-2">
                                        {item.description || "Premium template"}
                                      </p>
                                    </div>

                                    {/* Desktop Price */}
                                    <div className="hidden md:block text-right flex-shrink-0">
                                      <div className="text-xl lg:text-2xl font-bold">
                                        ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                      </div>
                                      {item.quantity > 1 && (
                                        <div className="text-sm text-muted-foreground">
                                          ₹{item.price?.toLocaleString()} each
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Mobile Price */}
                                  <div className="md:hidden text-lg font-bold">
                                    ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                    {/* Quantity */}
                                    <div className="flex items-center border rounded-lg">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 md:h-8 md:w-8 rounded-r-none"
                                        onClick={() => updateQuantity(item, (item.quantity || 1) - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <div className="w-8 md:w-12 text-center font-medium text-sm md:text-base">
                                        {item.quantity || 1}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 md:h-8 md:w-8 rounded-l-none"
                                        onClick={() => updateQuantity(item, (item.quantity || 1) + 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {isEmbeddable && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(websiteUrl, '_blank')}
                                        className="gap-1.5 md:gap-2 text-xs md:text-sm h-7 md:h-8 px-2 md:px-3"
                                      >
                                        <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                        <span className="hidden sm:inline">Preview</span>
                                      </Button>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeFromCart(item.id)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 md:h-8 md:w-8"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-between p-3 md:p-6 border-t bg-muted/20">
                  <Button
                    variant="outline"
                    onClick={clearCartWithConfirmation}
                    className="w-full sm:w-auto gap-2 hover:bg-red-50 hover:text-red-600 text-sm md:text-base h-9 md:h-10"
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Clear Cart
                  </Button>
                  <Button variant="outline" asChild className="w-full sm:w-auto gap-2 text-sm md:text-base h-9 md:h-10">
                    <Link to="/templates">
                      <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Coupon Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Tag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Apply Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6 pt-0">
                  <Tabs defaultValue="apply" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9 md:h-10">
                      <TabsTrigger value="apply" className="text-xs md:text-sm">Apply</TabsTrigger>
                      <TabsTrigger value="popular" className="text-xs md:text-sm">Popular</TabsTrigger>
                    </TabsList>
                    <TabsContent value="apply" className="space-y-3 pt-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="h-10 md:h-12 text-sm md:text-base"
                          disabled={discount > 0}
                        />
                        {discount > 0 ? (
                          <Button
                            onClick={removeCoupon}
                            variant="outline"
                            className="h-10 md:h-12 px-4 md:px-6"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode || isLoading}
                            className="h-10 md:h-12 px-4 md:px-6 bg-gradient-to-r from-primary to-brand-600"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        )}
                      </div>
                      {discount > 0 && (
                        <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="font-semibold text-sm">Applied!</span>
                            <span className="ml-auto font-bold">-₹{discount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="popular" className="pt-3">
                      <div className="grid gap-2">
                        {popularCoupons.map((coupon) => (
                          <div
                            key={coupon.code}
                            onClick={() => setCouponCode(coupon.code)}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className={cn(
                                "h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                                coupon.color
                              )}>
                                <Gift className="h-4 w-4 md:h-5 md:w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{coupon.code}</div>
                                <div className="text-xs text-muted-foreground">{coupon.desc}</div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">{coupon.discount}</Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Summary */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{prices.totalIncludingGST.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Amount</span>
                      <span className="font-medium">₹{prices.baseAmount.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          Discount
                        </span>
                        <span className="font-bold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5" />
                        GST (18%)
                      </span>
                      <span className="font-medium">₹{prices.gstAmount.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <div className="text-right">
                        <div className="text-2xl text-primary">₹{prices.finalTotal.toFixed(2)}</div>
                        {prices.savings > 0 && (
                          <div className="text-xs text-green-600 font-normal">
                            Saved ₹{prices.savings.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-3 space-y-1">
                      <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">GST:</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                        <div className="flex justify-between">
                          <span>CGST (9%):</span>
                          <span>₹{(prices.gstAmount / 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SGST (9%):</span>
                          <span>₹{(prices.gstAmount / 2).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary via-purple-600 to-pink-600 shadow-lg"
                    onClick={handleCheckout}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Checkout
                    <ArrowRight className="h-5 w-5 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-8 md:py-20">
            <Card className="border-0 shadow-xl">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 md:p-8 text-center">
                <div className="h-20 w-20 md:h-24 md:w-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                </div>
                <h2 className="text-xl md:text-3xl font-bold mb-2">Cart is empty</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6">Find the perfect template!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-brand-600">
                    <Link to="/templates">
                      <Sparkles className="h-4 w-4" />
                      Browse
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/featured">
                      <Star className="h-4 w-4" />
                      Featured
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      {cart.length > 0 && (
        <Sheet open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg">
            <div className="container px-4 py-3">
              <div className="flex items-center gap-3">
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 px-4 rounded-xl flex-1">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="text-base font-bold">₹{prices.finalTotal.toFixed(2)}</div>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </Button>
                </SheetTrigger>

                <Button 
                  className="h-11 px-6 bg-gradient-to-r from-primary to-brand-600 rounded-xl"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>

          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Order Summary</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4 overflow-y-auto h-[calc(85vh-180px)] mt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{prices.totalIncludingGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base</span>
                  <span>₹{prices.baseAmount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{prices.gstAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{prices.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-brand-600" onClick={() => {
                setIsSummaryOpen(false);
                handleCheckout();
              }}>
                <Lock className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Cart;