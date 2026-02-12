import { useState } from "react";
import logo from "../../img/templamart-logo.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  ShoppingCart,
  Brush,
  BookOpen,
  MonitorSmartphone,
  UtensilsCrossed,
  GraduationCap,
  Stethoscope,
  Home,
  Plane,
  Film,
  Dumbbell,
  PartyPopper,
  Shirt,
  Car,
  DollarSign,
  HandHeart,
  Megaphone,
  BarChart3,
  Smartphone,
  FolderOpen,
  MessageSquare,
  Gamepad2,
  HardHat,
  Scale,
  User,
  Music,
  Camera,
  Wheat,
  Minimize2,
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import NewsletterSection from "@/pages/Newslettersection";
const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  // Top Categories (Featured)
  const topCategories = [
    { name: "Business & Corporate", slug: "business-corporate", icon: <Building2 className="h-4 w-4" /> },
    { name: "E-commerce & Shopping", slug: "ecommerce-shopping", icon: <ShoppingCart className="h-4 w-4" /> },
    { name: "Portfolio & Creative", slug: "portfolio-creative", icon: <Brush className="h-4 w-4" /> },
    { name: "SaaS & Technology", slug: "saas-technology", icon: <MonitorSmartphone className="h-4 w-4" /> },
    { name: "Restaurant & Food", slug: "restaurant-food", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { name: "Education & Learning", slug: "education-learning", icon: <GraduationCap className="h-4 w-4" /> }
  ];

  // All 30 Categories
  const allCategories = [
    { name: "Business & Corporate", slug: "business-corporate" },
    { name: "E-commerce & Shopping", slug: "ecommerce-shopping" },
    { name: "Portfolio & Creative", slug: "portfolio-creative" },
    { name: "Blog & Magazine", slug: "blog-magazine" },
    { name: "SaaS & Technology", slug: "saas-technology" },
    { name: "Restaurant & Food", slug: "restaurant-food" },
    { name: "Education & Learning", slug: "education-learning" },
    { name: "Health & Medical", slug: "health-medical" },
    { name: "Real Estate & Property", slug: "real-estate" },
    { name: "Travel & Tourism", slug: "travel-tourism" },
    { name: "Entertainment & Media", slug: "entertainment-media" },
    { name: "Fitness & Sports", slug: "fitness-sports" },
    { name: "Wedding & Events", slug: "wedding-events" },
    { name: "Fashion & Beauty", slug: "fashion-beauty" },
    { name: "Automotive", slug: "automotive" },
    { name: "Finance & Banking", slug: "finance-banking" },
    { name: "Non-Profit & Charity", slug: "non-profit" },
    { name: "Landing Pages", slug: "landing-pages" },
    { name: "Dashboard & Admin", slug: "dashboard-admin" },
    { name: "Mobile App UI", slug: "mobile-app" },
    { name: "Directory & Listing", slug: "directory-listing" },
    { name: "Community & Social", slug: "community-social" },
    { name: "Gaming & Esports", slug: "gaming-esports" },
    { name: "Construction & Architecture", slug: "construction-architecture" },
    { name: "Legal & Law", slug: "legal-law" },
    { name: "Personal & Resume", slug: "personal-resume" },
    { name: "Music & Audio", slug: "music-audio" },
    { name: "Photography & Video", slug: "photography-video" },
    { name: "Agriculture & Farming", slug: "agriculture-farming" },
    { name: "Minimal & Clean", slug: "minimal-clean" }
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/aboutus" },
    { name: "Browse Templates", path: "/templates" },
    { name: "Pricing", path: "/pricing" },
    { name: "Become a Seller", path: "/become-seller" },
    { name: "Contact Us", path: "/contact" }
  ];

  const legalLinks = [
    { name: "Terms of Service", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Refund Policy", path: "/refund" },
    { name: "License Agreement", path: "/license" },
    { name: "Cookies Policy", path: "/cookies-policy" }
  ];

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, url: "https://www.facebook.com/share/185pq4Uhkr/" },
   // { name: "Twitter", icon: <Twitter className="h-5 w-5" />, url: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, url: "https://www.instagram.com/templamart/ " },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, url: "https://www.linkedin.com/company/templamart/" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, url: "https://youtube.com/@templamart?si=WfcLImhL1EA66bPn" }
  ];

  return (
    <footer className="border-t bg-gradient-to-b from-background to-accent/30">
      {/* Newsletter Section */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-brand-600/5 to-primary/5">
      
         <NewsletterSection />
      
      </div>

      {/* Main Footer Content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Company Info */}
          <div className="lg:col-span-3 space-y-4">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="TemplaMart Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier marketplace for high-quality website templates and digital assets. Empowering designers and developers worldwide.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p>Sh N B2/A, Ground Floor</p>
                  <p>Mahavir Nagar, Deepak Hospital</p>
                  <p>Mira Road, Thane, MH - 401107</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+912235039927" className="hover:text-primary transition-colors">
                  +91 22 350 399 27
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@templamart.com" className="hover:text-primary transition-colors">
                  contact@templamart.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent hover:bg-primary hover:text-white transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Popular Categories</h3>
            <ul className="space-y-2">
              {topCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                      {category.icon}
                    </div>
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/categories"
                  className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                >
                  View All Categories
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* All Categories (Mega List) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-semibold">All Categories</h3>
            <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {allCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors py-1 hover:translate-x-1 transition-transform"
                >
                  • {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Support */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Legal & Support</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust Badges */}
            <div className="pt-4 space-y-2">
              <Badge variant="outline" className="text-xs">
                🔒 Secure Payments
              </Badge>
              <Badge variant="outline" className="text-xs">
                ✓ Quality Guaranteed
              </Badge>
              
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="border-t bg-accent/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} TemplaMart. All rights reserved. Operated by{" "}
              <a
                href="https://rootpay.in/"
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                RootPay Pvt. Ltd.
              </a>
            </p>
            <div className="flex items-center gap-12 text-xs text-muted-foreground">
              <span className="hover:text-primary transition-colors">
                CIN: U66190MH2026PTC464982
              </span>
          
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.2);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.3);
        }
      `}</style>
    </footer>
  );
};

export default Footer;