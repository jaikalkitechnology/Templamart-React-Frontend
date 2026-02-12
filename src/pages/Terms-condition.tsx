import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Scale, Building, MapPin, Phone, Mail, Calendar } from "lucide-react";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 py-16 md:py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <Scale className="mr-2 h-3 w-3" />
            Legal Agreement
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Terms & Conditions
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            Please read these terms carefully before using TemplaMart
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: January 17, 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          <Card className="border-2">
            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Introduction */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold">1. INTRODUCTION AND ACCEPTANCE</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Welcome to <strong>TemplaMart</strong> ("Platform"), a digital marketplace for website templates and related digital assets, 
                    operated by <strong>RootPay Private Limited</strong> ("Company," "we," "us," or "our").
                  </p>
                  <p>
                    By accessing, browsing, registering on, or using the Platform located at <strong>templamart.com</strong>, you ("User," "you," 
                    or "your") acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions ("Terms"), 
                    as well as our Privacy Policy, Cookie Policy, and Refund Policy.
                  </p>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR USE THE PLATFORM.
                    </p>
                  </div>
                  <p>
                    These Terms constitute a legally binding agreement between you and RootPay Private Limited. Your continued use of the Platform 
                    constitutes ongoing acceptance of these Terms, including any amendments we may make from time to time.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Definitions */}
              <div>
                <h2 className="text-2xl font-bold mb-4">2. DEFINITIONS</h2>
                <div className="space-y-3">
                  {[
                    { term: "Platform", def: "The website at templamart.com, including all subdomains, mobile apps, APIs, and associated services" },
                    { term: "User", def: "Any person or entity accessing the Platform (Buyers, Sellers, or visitors)" },
                    { term: "Buyer", def: "A User who purchases or downloads a Digital Product" },
                    { term: "Seller", def: "A User who uploads and sells Digital Products on the Platform" },
                    { term: "Digital Product", def: "Website templates, themes, UI kits, graphics, code, and other digital content" },
                    { term: "Account", def: "Registered user profile with login credentials and settings" },
                    { term: "Transaction", def: "Purchase, sale, or transfer of a Digital Product through the Platform" },
                    { term: "Commission", def: "Platform fee charged to Sellers for each successful Transaction" }
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg bg-accent">
                      <div className="font-semibold text-sm mb-1">{item.term}</div>
                      <div className="text-xs text-muted-foreground">{item.def}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Business Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">3. BUSINESS INFORMATION</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  In compliance with Consumer Protection (E-Commerce) Rules, 2020:
                </p>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-semibold mb-3">Legal Entity Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> RootPay Private Limited</p>
                      <p><strong>Nature:</strong> Digital marketplace operator</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Registered Office Address
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>RootPay Private Limited</p>
                      <p>Sh N B2/A, Ground Floor, Mahavir Nagar</p>
                      <p>Deepak Hospital Road Lane</p>
                      <p>Mira Road (E), Nr. Seven Square School</p>
                      <p>Thane, Maharashtra – 401107</p>
                      <p className="pt-2"><strong>Country:</strong> India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Topics */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Complete Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The full Terms and Conditions document covers:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {[
                        "User accounts & registration",
                        "Buyer responsibilities",
                        "Seller responsibilities",
                        "Product listings & quality",
                        "Transactions & payments",
                        "Commission structure",
                        "Intellectual property rights",
                        "Prohibited activities",
                        "Dispute resolution",
                        "Limitation of liability",
                        "Indemnification",
                        "Termination",
                        "Governing law",
                        "Changes to terms",
                        "Contact information",
                        "Miscellaneous provisions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-lg bg-accent border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </h3>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms and Conditions:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Email:</p>
                    <a href="mailto:legal@templamart.com" className="text-primary hover:underline">legal@templamart.com</a>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Support:</p>
                    <a href="mailto:support@templamart.com" className="text-primary hover:underline">support@templamart.com</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Terms;