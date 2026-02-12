import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  ExternalLink, 
  Check, 
  Calendar, 
  Download,
  Eye,
  Globe,
  Image as ImageIcon,
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  Shield,
  Clock,
  FileCode,
  Layers,
  Sparkles,
  Zap,
  ThumbsUp,
  MessageSquare,
  Plus,
  ArrowRight,
  Link as LinkIcon,
  ChevronLeft,
  X
} from "lucide-react";
import { useShoppingContext } from "@/context/ShoppingContext";
import { toast } from "sonner";
import { TemplateProps } from "@/components/templates/TemplateCard";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [templateData, setTemplateData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [isWebsiteUrl, setIsWebsiteUrl] = useState(false);
  const [isPurchaseSheetOpen, setIsPurchaseSheetOpen] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useShoppingContext();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const { user } = useAuth();

  // Check if image is a website URL
  useEffect(() => {
    if (templateData?.image) {
      const checkUrlType = () => {
        const image = templateData.image;
        const isUrl = image.startsWith('http://') || image.startsWith('https://');
        
        if (isUrl) {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
          const hasImageExtension = imageExtensions.some(ext => 
            image.toLowerCase().includes(ext)
          );
          
          const isImageHosting = image.includes('/images/') || 
                                image.includes('image.') ||
                                image.includes('img.');
          
          setIsWebsiteUrl(!hasImageExtension && !isImageHosting);
        }
      };
      checkUrlType();
    }
  }, [templateData]);

  useEffect(() => {
    if (id) {
      axios.get(`${BASE_URL}/product/details/${id}`)
        .then(res => setTemplateData(res.data))
        .catch(() => toast.error("Failed to load template details"));
      
      axios.get(`${BASE_URL}/product/reviews/${id}`)
        .then(resp => setReviews(resp.data))
        .catch(() => toast.error("Failed to load reviews"));
    }
  }, [id]);

  const handleAddReview = async () => {
    if (!newReview.rating) {
      toast.error("Rating is required");
      return;
    }

    const categoryToSend = {
      rating: newReview.rating,
      comment_text: newReview.comment,
      product_token: id,
    };

    try {
      const response = await fetch(`${BASE_URL}/product/product/${id}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(categoryToSend),
      });
      
      const savedData = await response.json();

      if (savedData.status === "success") {
        const newReviewData = savedData.data;
        setReviews(prev => [...(prev || []), newReviewData]);
      
        toast.success("Review added", {
          description: savedData.message || "Rating has been added to records",
        });
      
        setNewReview({ rating: 5, comment: "" });
        setIsReviewDialogOpen(false);
      } else {
        toast.error("Add Rating failed!", {
          description: savedData.message || "Unexpected error",
        });
      }
      
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review", {
        description: "Please try again later",
      });
    }      
  };

  const handleLike = () => {
    if (templateData) {
      const templateCartData: TemplateProps = {
        id: templateData.id,
        title: templateData.title,
        description: templateData.description,
        price: templateData.price,
        image: templateData.image,
        category: templateData.category,
        author: templateData.author,
        rating: templateData.rating,
        sales: templateData.sales
      };
      toggleWishlist(templateCartData);
    }
  };

  const handleAddToCart = () => {
    if (templateData) {
      const templateCartData: TemplateProps = {
        id: templateData.id,
        title: templateData.title,
        description: templateData.description,
        price: templateData.price,
        image: templateData.image,
        category: templateData.category,
        author: templateData.author,
        rating: templateData.rating,
        sales: templateData.sales
      };
      addToCart(templateCartData);
      toast.success("Added to cart!");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/cart";
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: templateData.title,
        text: templateData.description,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handlePreviewLoad = () => setPreviewLoading(false);

  const getWebsiteHostname = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace(/https?:\/\//, '').split('/')[0];
    }
  };

  if (!templateData) {
    return (
      <div className="container py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg text-muted-foreground">Loading template details...</p>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : templateData.rating || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Mobile Hero Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container py-3 px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold truncate">{templateData.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{templateData.sales?.toLocaleString() || 0} sales</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={handleLike}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all",
                    isInWishlist(templateData.id) 
                      ? "fill-red-500 text-red-500" 
                      : ""
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden lg:block bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/templates" className="hover:text-primary transition-colors">
              Templates
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/category/${templateData.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">
              {templateData.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{templateData.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-4 md:py-8 px-4">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Main Preview */}
            <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
                {isWebsiteUrl ? (
                  <div className="relative h-full w-full">
                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span className="text-sm text-muted-foreground">Loading preview...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Browser Frame */}
                    <div className="absolute inset-x-0 top-0 z-10 h-7 md:h-8 bg-gradient-to-r from-gray-200/90 to-gray-300/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border-b border-gray-300/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between px-2 md:px-4 h-full">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-400" />
                            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-yellow-400" />
                            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-400" />
                          </div>
                          <div className="hidden sm:flex items-center gap-2 ml-2">
                            <Globe className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-none">
                              {getWebsiteHostname(templateData.image)}
                            </span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs">
                          <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          <span className="hidden sm:inline">Live</span>
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Embedded Website */}
                    <iframe
                      src={templateData.image}
                      className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
                        previewLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      loading="lazy"
                      title={`${templateData.title} preview`}
                      onLoad={handlePreviewLoad}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      </div>
                    )}
                    <img
                      src={templateData.image}
                      alt={templateData.title}
                      className="h-full w-full object-cover transition-opacity duration-300"
                      onLoad={handlePreviewLoad}
                      style={{ opacity: previewLoading ? 0 : 1 }}
                    />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 md:p-6">
                {/* Desktop Title & Actions */}
                <div className="hidden lg:flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{templateData.title}</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{averageRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({reviews.length || 0} reviews)
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {templateData.sales?.toLocaleString() || 0} sales
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 text-blue-500" />
                        2.5k views
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={handleLike}
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          isInWishlist(templateData.id) 
                            ? "fill-red-500 text-red-500 animate-pulse" 
                            : "hover:fill-red-200 hover:text-red-500"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <div className="text-lg font-bold text-primary">{templateData.sales || 0}</div>
                    <div className="text-xs text-muted-foreground">Sales</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-500/10">
                    <div className="text-lg font-bold text-amber-600">{averageRating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-lg font-bold text-blue-600">{reviews.length}</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {templateData.description}
                </p>
                
                {/* Tags */}
                {templateData.tags && templateData.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {templateData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-2 md:px-3 py-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-background to-background/50 border border-border/50 h-auto">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 text-xs md:text-sm py-2 md:py-2.5">
                  <FileCode className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-primary/10 text-xs md:text-sm py-2 md:py-2.5">
                  <Layers className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/10 text-xs md:text-sm py-2 md:py-2.5">
                  <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden sm:inline">Reviews</span>
                  <Badge className="ml-1 md:ml-2 h-5 px-1.5 text-[10px]">{reviews.length}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4 md:mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                      About This Template
                    </h3>
                    {templateData.longDescription ? (
                      <div 
                        className="prose prose-sm md:prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: templateData.longDescription }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          This premium template is designed with modern development practices in mind. 
                          It features clean code architecture, responsive design, and follows the latest 
                          industry standards for performance and accessibility.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-6">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base">High Performance</h4>
                              <p className="text-xs md:text-sm text-muted-foreground">Optimized for speed</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base">Secure & Reliable</h4>
                              <p className="text-xs md:text-sm text-muted-foreground">Built with best practices</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileCode className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base">Clean Code</h4>
                              <p className="text-xs md:text-sm text-muted-foreground">Well-documented</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base">Community Support</h4>
                              <p className="text-xs md:text-sm text-muted-foreground">Regular updates</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="mt-4 md:mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                      <Layers className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-base md:text-lg">Core Features</h4>
                        <ul className="space-y-2 md:space-y-3">
                          {templateData.features?.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 md:gap-3">
                              <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
                            </li>
                          )) || [
                            "Fully Responsive Design",
                            "Clean & Modern Interface",
                            "Easy Customization",
                            "Cross-browser Compatible",
                            "SEO Optimized",
                            "Fast Loading Speed"
                          ].map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 md:gap-3">
                              <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm md:text-base text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Technical Details</h4>
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/30 text-sm md:text-base">
                              <span className="text-muted-foreground">Format</span>
                              <span className="font-medium">{templateData.fileFormat || "HTML, CSS, JS"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30 text-sm md:text-base">
                              <span className="text-muted-foreground">Size</span>
                              <span className="font-medium">{templateData.fileSize || "5-10 MB"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30 text-sm md:text-base">
                              <span className="text-muted-foreground">Updated</span>
                              <span className="font-medium">
                                {templateData.lastUpdated 
                                  ? new Date(templateData.lastUpdated).toLocaleDateString()
                                  : "Recently"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4 md:mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">Customer Reviews</h3>
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-2xl md:text-3xl font-bold">{averageRating.toFixed(1)}</div>
                            <div>
                              <div className="flex items-center gap-0.5 md:gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 md:h-4 md:w-4 ${
                                      i < Math.floor(averageRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {reviews.length} reviews
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full sm:w-auto"
                            onClick={() => {
                              if (!user) {
                                toast.error("Please login to write a review");
                                window.location.href = "/login";
                              }
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Write Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Share Your Experience</DialogTitle>
                            <DialogDescription>
                              Your review helps others make better decisions.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Button
                                    key={star}
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 md:h-12 md:w-12"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                  >
                                    <Star
                                      className={`h-5 w-5 md:h-6 md:w-6 ${
                                        star <= newReview.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="comment">Your Review</Label>
                              <Textarea
                                id="comment"
                                placeholder="Share your experience..."
                                className="min-h-[120px]"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button onClick={handleAddReview} className="w-full sm:w-auto">
                              Submit Review
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-4 md:space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-border/30 pb-4 md:pb-6 last:border-0">
                            <div className="flex items-start gap-3 md:gap-4">
                              <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm md:text-base">
                                  {review.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm md:text-base truncate">{review.user?.name || "Anonymous"}</h4>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-3 w-3 ${
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {review.date ? new Date(review.date).toLocaleDateString() : "Recently"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm md:text-base text-muted-foreground">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 md:py-12">
                        <MessageSquare className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="text-base md:text-lg font-semibold mb-2">No reviews yet</h4>
                        <p className="text-sm md:text-base text-muted-foreground mb-6">
                          Be the first to share your experience
                        </p>
                        <Button onClick={() => setIsReviewDialogOpen(true)}>
                          Write the First Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Purchase Card */}
          <div className="hidden lg:block space-y-6">
            {/* Purchase Card */}
            <Card className="border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm sticky top-20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">₹{templateData.price?.toFixed(2) || "0.00"}</span>
                      {templateData.discountPrice && (
                        <>
                          <span className="text-xl text-muted-foreground line-through">
                            ₹{templateData.discountPrice}
                          </span>
                          <Badge className="bg-green-500">
                            Save ₹{(templateData.price - templateData.discountPrice).toFixed(2)}
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      One-time purchase. Lifetime updates.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Format</span>
                      <span className="font-medium">{templateData.fileFormat || "Web Template"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">License</span>
                      <span className="font-medium">Commercial</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Support</span>
                      <span className="font-medium text-green-600">6 Months</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-brand-600 hover:from-primary/90 hover:to-brand-500"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 gap-2"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                    
                    {templateData.preview_url && (
                      <Button 
                        variant="secondary" 
                        className="w-full h-12 gap-2"
                        asChild
                      >
                        <a href={templateData.preview_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-5 w-5" />
                          Live Preview
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Secure</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Instant</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Creator
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {templateData.author?.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{templateData.author?.name || "Creator"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Template Designer
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to={`/seller/${templateData.author?.id || 'creator'}`}>
                      View Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-lg">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-lg md:text-2xl font-bold">₹{templateData.price?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">One-time purchase</p>
            </div>
            <Button 
              variant="outline"
              className="h-11 px-4 rounded-xl"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Sheet open={isPurchaseSheetOpen} onOpenChange={setIsPurchaseSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  className="h-11 px-6 bg-gradient-to-r from-primary to-brand-600 rounded-xl flex-shrink-0"
                >
                  Buy Now
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-xl">Purchase Details</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 overflow-y-auto h-[calc(90vh-200px)]">
                  {/* Price Section */}
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">₹{templateData.price?.toFixed(2)}</span>
                      {templateData.discountPrice && (
                        <Badge className="bg-green-500 mb-1">
                          Save ₹{(templateData.price - templateData.discountPrice).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      One-time purchase. Lifetime updates included.
                    </p>
                  </div>

                  <Separator />

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Format</span>
                      <span className="font-medium">{templateData.fileFormat || "Web Template"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="font-medium">Commercial</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Support</span>
                      <span className="font-medium text-green-600">6 Months</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">6 months technical support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Lifetime updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Full documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Commercial license</span>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Author Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      About the Creator
                    </h4>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {templateData.author?.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{templateData.author?.name || "Creator"}</h4>
                        <p className="text-sm text-muted-foreground">Professional Designer</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t space-y-3">
                  {templateData.preview_url && (
                    <Button 
                      variant="outline" 
                      className="w-full h-12"
                      asChild
                    >
                      <a href={templateData.preview_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Live Preview
                      </a>
                    </Button>
                  )}
                  <Button 
                    className="w-full h-12 text-lg bg-gradient-to-r from-primary to-brand-600"
                    onClick={handleBuyNow}
                  >
                    Complete Purchase
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetails;