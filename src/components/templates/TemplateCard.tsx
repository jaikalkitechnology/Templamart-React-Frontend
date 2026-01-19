import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, ShoppingCart, ExternalLink, Globe, Image as ImageIcon, Maximize2 } from "lucide-react";
import { useShoppingContext } from "@/context/ShoppingContext";
import { BASE_URL, DOMAIN } from "@/config";
import { useState, useEffect, useRef } from "react";

export interface TemplateProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  author: {
    id: string;
    name: string;
  };
  rating: number;
  sales: number;
  liked?: boolean;
}

interface TemplateCardProps {
  template: TemplateProps;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useShoppingContext();
  const [isWebsiteUrl, setIsWebsiteUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check if the image field contains a website URL
  useEffect(() => {
    const checkUrlType = () => {
      if (!template.image) return false;
      
      // Check if it's a URL (starts with http/https)
      const isUrl = template.image.startsWith('http://') || template.image.startsWith('https://');
      
      if (isUrl) {
        // Check if it's likely a website (not an image file)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const hasImageExtension = imageExtensions.some(ext => 
          template.image.toLowerCase().includes(ext)
        );
        
        // Also check for common image hosting patterns
        const isImageHosting = template.image.includes('/images/') || 
                               template.image.includes('image.') ||
                               template.image.includes('img.');
        
        setIsWebsiteUrl(!hasImageExtension && !isImageHosting);
      }
    };
    
    checkUrlType();
  }, [template.image]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(template);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(template);
  };

  const handlePreviewLoad = () => {
    setIsLoading(false);
  };

  const handleFullPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullPreview(!showFullPreview);
  };

  const getWebsiteHostname = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace(/https?:\/\//, '').split('/')[0];
    }
  };

  // Calculate dynamic iframe height based on view mode
  const getIframeHeight = () => {
    return showFullPreview ? "75vh" : "50vh";
  };

  return (
    <Card className="template-card group overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
      <Link to={`/template/${template.id}`} className="block">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Preview Container */}
          <div className="relative overflow-hidden" style={{ height: isWebsiteUrl ? getIframeHeight() : 'auto' }}>
            {isWebsiteUrl ? (
              <div className="relative h-full w-full">
                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      <span className="text-xs text-muted-foreground">Loading website preview...</span>
                    </div>
                  </div>
                )}
                
                {/* Website Preview */}
                <div className="relative h-full w-full rounded-t-lg overflow-hidden">
                  {/* Browser Frame */}
                  <div className="absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-r from-gray-200/90 to-gray-300/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border-b border-gray-300/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between px-3 h-full">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-red-400 cursor-pointer hover:opacity-80" />
                          <div className="h-3 w-3 rounded-full bg-yellow-400 cursor-pointer hover:opacity-80" />
                          <div className="h-3 w-3 rounded-full bg-green-400 cursor-pointer hover:opacity-80" />
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                            {getWebsiteHostname(template.image)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700"
                          onClick={handleFullPreview}
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Embedded Website */}
                  <div className="absolute inset-0 top-8 bottom-0">
                    <iframe
                      ref={iframeRef}
                      src={template.image}
                      className={`w-full h-full border-0 transition-all duration-300 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      loading="lazy"
                      title={`${template.title} preview`}
                      onLoad={handlePreviewLoad}
                      referrerPolicy="no-referrer"
                      style={{
                        pointerEvents: showFullPreview ? 'auto' : 'none',
                      }}
                    />
                    
                    {/* Overlay gradient */}
                    {!showFullPreview && (
                      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                    )}
                  </div>
                  
                  {/* Preview Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                      <Badge 
                        variant="secondary" 
                        className="gap-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs font-medium">Live Preview</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={handleFullPreview}
                      >
                        {showFullPreview ? 'Minimize' : 'Expand'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Loading Progress Bar */}
                {isLoading && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div className="h-full w-1/3 bg-primary animate-pulse rounded-full"></div>
                  </div>
                )}
              </div>
            ) : (
              // Regular Image Display
              <div className="relative h-64 w-full">
                <img
                  src={template.image}
                  alt={template.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onLoad={() => setIsLoading(false)}
                />
                {/* Image Indicator */}
                <div className="absolute bottom-3 right-3 z-20">
                  <Badge variant="secondary" className="gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm">
                    <ImageIcon className="h-3 w-3" />
                    <span className="text-xs">Image Preview</span>
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Hover Overlay */}
            {!isWebsiteUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            
            {/* Action Buttons */}
            <div className={`absolute top-10 right-3 flex flex-col gap-2 transition-all duration-300 ${
              isWebsiteUrl ? 'top-12' : 'top-3'
            } ${isLoading ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'}`}>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background hover:scale-105 transition-transform"
                onClick={handleLike}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isInWishlist(template.id)
                      ? "fill-red-500 text-red-500 animate-pulse"
                      : "hover:fill-red-200 hover:text-red-500"
                  }`}
                />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background hover:scale-105 transition-transform"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Category and Rating Badges */}
          <div className={`absolute flex flex-wrap gap-2 transition-all duration-300 ${
            isWebsiteUrl ? 'top-12 left-3' : 'top-3 left-3'
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Badge 
              variant="secondary" 
              className="px-3 py-1.5 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background transition-colors"
            >
              {template.category}
            </Badge>
            <Badge 
              variant="default" 
              className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white border-amber-400/30 hover:bg-amber-600 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse" />
                <StarIcon className="h-3 w-3 fill-current" />
                {template.rating.toFixed(1)}
              </span>
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {template.title}
            </h3>
            <p className="line-clamp-2 mt-2 text-sm text-muted-foreground leading-relaxed">
              {template.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {template.author.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Author</span>
                <span className="text-sm font-medium">{template.author.name}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Sales</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <TrendingIcon className="h-3.5 w-3.5 text-green-500" />
                {template.sales.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-border/50 p-5 bg-gradient-to-r from-background to-background/50">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Price</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-foreground">
                  ₹{template.price.toFixed(2)}
                </span>
                {template.sales > 100 && (
                  <Badge variant="outline" className="text-xs h-5">
                    🔥 Popular
                  </Badge>
                )}
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="default"
              className="rounded-lg px-6 py-2 font-medium bg-gradient-to-r from-primary to-brand-600 hover:from-primary/90 hover:to-brand-500 hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              View Details
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

// Helper components for icons
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const TrendingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </svg>
);

export default TemplateCard;