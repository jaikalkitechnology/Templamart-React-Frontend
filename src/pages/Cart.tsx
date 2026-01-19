import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useShoppingContext } from "@/context/ShoppingContext";

const Cart = () => {
  const { cart, removeFromCart, clearCart, addToCart } = useShoppingContext();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "discount10") {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      toast.success("Coupon applied", {
        description: "10% discount has been applied to your order."
      });
    } else {
      toast.error("Invalid coupon code", {
        description: "The coupon code you entered is invalid or expired."
      });
    }
  };

  const handleCheckout = () => {
    toast.success("Proceeding to checkout", {
      description: "Redirecting to secure payment page..."
    });
    // In a real app, this would navigate to the checkout page
  };

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      // First remove the item
      removeFromCart(item.id);
      // Then add it back with the new quantity
      for (let i = 0; i < newQuantity; i++) {
        addToCart(item);
      }
    }
  };

  // Function to get website URL from item
  const getWebsiteUrl = (item) => {
    // If item has a website property, use it
    if (item.website) return item.website;
    
    // If item has a liveDemoUrl or previewUrl, use it
    if (item.liveDemoUrl) return item.liveDemoUrl;
    if (item.previewUrl) return item.previewUrl;
    
    // If image is a URL, you might want to use a placeholder instead
    // For now, return the image URL as fallback (but it's not a website)
    return item.image;
  };

  // Function to check if URL is embeddable
  const isEmbeddableUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      // Check if it's a web URL (http/https)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Your Cart</h1>
      <p className="text-muted-foreground">Review your items before checkout</p>

      {cart.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => {
                    const websiteUrl = getWebsiteUrl(item);
                    const isEmbeddable = isEmbeddableUrl(websiteUrl);
                    
                    return (
                      <div key={item.id} className="flex items-start space-x-4">
                        <div className="h-40 w-40 overflow-hidden rounded-md border bg-gray-100 relative group">
                          {isEmbeddable ? (
                            <>
                              <iframe
                                src={websiteUrl}
                                title={`${item.title} Preview`}
                                className="h-full w-full"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                loading="lazy"
                                style={{ border: 'none' }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="absolute bottom-2 right-2 h-6 px-2 text-xs"
                                  onClick={() => setActivePreview(activePreview === item.id ? null : item.id)}
                                >
                                  {activePreview === item.id ? 'Minimize' : 'Expand'}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        
                        {/* Expanded Preview Modal */}
                        {activePreview === item.id && isEmbeddable && (
                          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
                              <div className="flex items-center justify-between p-4 border-b">
                                <div>
                                  <h3 className="font-semibold">{item.title} - Live Preview</h3>
                                  <p className="text-sm text-muted-foreground">{websiteUrl}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Open in New Tab
                                    </a>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setActivePreview(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <iframe
                                  src={websiteUrl}
                                  title={`${item.title} Full Preview`}
                                  className="h-full w-full"
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-medium">
                            <Link
                              to={`/template/${item.id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {item.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground">
                            Single license
                          </p>
                          {isEmbeddable && (
                            <div className="mt-1">
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                asChild
                              >
                                <a 
                                  href={websiteUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit Live Website
                                </a>
                              </Button>
                            </div>
                          )}
                          <div className="mt-2 flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="mx-2 min-w-[30px] text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                <Button variant="outline" asChild>
                  <Link to="/templates">Continue Shopping</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Coupon Code</div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode}
                      >
                        Apply
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Try "DISCOUNT20" for 20% off
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-4 rounded-lg border p-4">
              <h3 className="font-medium">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">
                We use secure payment processing to ensure your information is
                always protected.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9h6M9 15h6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="max-w-md text-muted-foreground">
            Looks like you haven&apos;t added any templates to your cart yet.
            Find the perfect template for your project!
          </p>
          <Button asChild>
            <Link to="/templates">Browse Templates</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;