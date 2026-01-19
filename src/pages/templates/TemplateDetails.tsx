import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Link as LinkIcon
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

const TemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [templateData, setTemplateData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [isWebsiteUrl, setIsWebsiteUrl] = useState(false);
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

  const handleNewReviewNameChange = (value: string) => {
    setNewReview({
      ...newReview,
      rating: Number(value),
    });
  };

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
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/cart";
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard", {
      description: "Share this template with others!",
    });
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b">
        <div className="container py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
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

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Preview */}
            <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <div className="relative aspect-[4/3] overflow-hidden">
                {isWebsiteUrl ? (
                  <div className="relative h-full w-full">
                    {previewLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span className="text-sm text-muted-foreground">Loading website preview...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Browser Frame */}
                    <div className="absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-r from-gray-200/90 to-gray-300/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border-b border-gray-300/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between px-4 h-full">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <div className="h-3 w-3 rounded-full bg-yellow-400" />
                            <div className="h-3 w-3 rounded-full bg-green-400" />
                          </div>
                          <div className="ml-3 flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getWebsiteHostname(templateData.image)}
                            </span>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="gap-1.5 px-2 py-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="text-xs">Live Website</span>
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
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent pointer-events-none" />
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
                    <Badge variant="secondary" className="absolute bottom-4 right-4 gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span className="text-sm">Image Preview</span>
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
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
                
                <p className="text-muted-foreground leading-relaxed">
                  {templateData.description}
                </p>
                
                {/* Tags */}
                {templateData.tags && templateData.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {templateData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
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
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-background to-background/50 border border-border/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                  <FileCode className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-primary/10">
                  <Layers className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/10">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      About This Template
                    </h3>
                    {templateData.longDescription ? (
                      <div 
                        className="prose prose-lg max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: templateData.longDescription }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          This premium template is designed with modern development practices in mind. 
                          It features clean code architecture, responsive design, and follows the latest 
                          industry standards for performance and accessibility.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">High Performance</h4>
                              <p className="text-sm text-muted-foreground">Optimized for speed and efficiency</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Secure & Reliable</h4>
                              <p className="text-sm text-muted-foreground">Built with security best practices</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileCode className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Clean Code</h4>
                              <p className="text-sm text-muted-foreground">Well-documented and maintainable</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Community Support</h4>
                              <p className="text-sm text-muted-foreground">Active community and regular updates</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Key Features & Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Core Features</h4>
                        <ul className="space-y-3">
                          {templateData.features?.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          )) || [
                            "Fully Responsive Design",
                            "Clean & Modern Interface",
                            "Easy Customization",
                            "Cross-browser Compatible",
                            "SEO Optimized",
                            "Fast Loading Speed"
                          ].map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-lg mb-4">Technical Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">File Format</span>
                              <span className="font-medium">{templateData.fileFormat || "HTML, CSS, JS"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">File Size</span>
                              <span className="font-medium">{templateData.fileSize || "5-10 MB"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">Last Updated</span>
                              <span className="font-medium">
                                {templateData.lastUpdated 
                                  ? new Date(templateData.lastUpdated).toLocaleDateString()
                                  : "Recently"
                                }
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">Framework</span>
                              <span className="font-medium">{templateData.framework || "React/Next.js"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg mb-4">Support & Updates</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">Technical Support</span>
                              <span className="font-medium text-green-600">6 Months Included</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">Updates</span>
                              <span className="font-medium text-green-600">Lifetime Updates</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                              <span className="text-muted-foreground">License</span>
                              <span className="font-medium">Commercial Use</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                            <div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(averageRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Based on {reviews.length} reviews
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => {
                              if (!user) {
                                toast.error("Please login to write a review");
                                window.location.href = "/login";
                              }
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                                    className="h-12 w-12"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
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
                                placeholder="Share your experience with this template..."
                                className="min-h-[120px]"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddReview}>
                              Submit Review
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-border/30 pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.user?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{review.user?.name || "Anonymous"}</h4>
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
                                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="text-lg font-semibold mb-2">No reviews yet</h4>
                        <p className="text-muted-foreground mb-6">
                          Be the first to share your experience with this template
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

          {/* Right Column - Purchase & Author Info */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
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
                      One-time purchase. Lifetime updates included.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Format</span>
                      <span className="font-medium">{templateData.fileFormat || "Web Template"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">License</span>
                      <span className="font-medium">Commercial</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Support</span>
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
                          <span className="font-medium">Secure Payment</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Instant Download</span>
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
                    About the Creator
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
                        Professional Template Designer
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{templateData.author?.templates || 0}</div>
                          <div className="text-muted-foreground">Templates</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{templateData.author?.sales || 0}</div>
                          <div className="text-muted-foreground">Sales</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{templateData.author?.rating || 4.5}</div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                      </div>
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

            {/* Support Card */}
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Support Included
                  </h3>
                  
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
                      <span className="text-sm">Documentation included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Commercial license</span>
                    </li>
                  </ul>
                  
                  <Button variant="ghost" className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10">
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{templateData.sales || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">{averageRating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {templateData.lastUpdated ? 'Updated' : 'Fresh'}
                    </div>
                    <div className="text-xs text-muted-foreground">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{reviews.length}</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetails;