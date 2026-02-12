import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, AlertCircle, CheckCircle, XCircle, FileText, Mail, Clock, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 py-16 md:py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <RotateCcw className="mr-2 h-3 w-3" />
            Refund Terms
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Refund Policy
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            Understanding our refund policy for digital products
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
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
              {/* Important Notice */}
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Due to the digital nature of our products, all sales are generally final and non-refundable. 
                  Please read this policy carefully before making a purchase.
                </AlertDescription>
              </Alert>

              {/* Introduction */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold">1. INTRODUCTION AND GENERAL POLICY</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>www.templamart.com</strong> ("Platform") operated by RootPay Private Limited offers digital products that are 
                    delivered electronically and are non-returnable by nature. Due to the instant delivery and accessibility of Digital Products 
                    upon purchase, <strong>all sales are generally final and non-refundable.</strong>
                  </p>
                  <p>
                    However, we recognize that exceptional circumstances may arise, and we have established this Refund Policy to address 
                    specific situations where refunds may be considered.
                  </p>
                </div>
              </div>

              <Separator />

              {/* No Refund Policy */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold">2. NO REFUND POLICY - DIGITAL PRODUCTS</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h3 className="font-semibold mb-3 text-red-700 dark:text-red-400">2.1 Nature of Digital Products</h3>
                    <p className="text-sm text-muted-foreground mb-3">Digital Products sold on the Platform are:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[
                        { label: "Instantly Accessible", desc: "Available for immediate download upon payment" },
                        { label: "Non-Returnable", desc: "Cannot be \"returned\" once downloaded or accessed" },
                        { label: "License-Based", desc: "You purchase a license to use, not ownership" },
                        { label: "Reproducible", desc: "Can be copied or used within license limits" }
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5" />
                          <div>
                            <strong>{item.label}:</strong> {item.desc}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h3 className="font-semibold mb-3 text-amber-700 dark:text-amber-400">2.2 All Sales Final</h3>
                    <p className="text-sm text-muted-foreground mb-3">By completing a purchase, you acknowledge and agree that:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[
                        "You have reviewed the product description, screenshots, and demos",
                        "You understand the license terms and restrictions",
                        "You have assessed whether the product meets your needs",
                        "Refunds are issued only in exceptional circumstances",
                        "You waive any right to cancel after download/access"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">2.3 Pre-Purchase Due Diligence</h3>
                    <p className="text-sm text-muted-foreground mb-3">Before purchasing, Buyers are strongly encouraged to:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {[
                        "Read product description carefully",
                        "Review screenshots & preview images",
                        "Check license terms",
                        "Review seller ratings",
                        "Read buyer reviews",
                        "Contact seller with questions",
                        "Verify system requirements",
                        "Check compatibility"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Alert className="mt-3 border-blue-500/50 bg-blue-500/5">
                      <ShieldAlert className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-xs">
                        <strong>Buyer Responsibility:</strong> It is the Buyer's sole responsibility to ensure that the Digital Product 
                        meets their requirements before completing the purchase.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Eligibility for Refund */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">3. ELIGIBILITY FOR REFUND</h2>
                </div>

                <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    While our general policy is "no refunds," we will consider refund requests <strong>only</strong> in the following 
                    exceptional circumstances, at our sole discretion.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      3.1 Defective Product
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">A refund may be granted if the Digital Product is:</p>
                    
                    <div className="space-y-3">
                      {[
                        { title: "Corrupted or Damaged", items: ["File is corrupted or incomplete", "Files cannot be extracted", "Product cannot be opened due to corruption"] },
                        { title: "Technically Broken", items: ["Does not function as described", "Contains critical bugs/errors", "Essential features are non-functional"] },
                        { title: "Not as Described", items: ["Materially differs from description", "Advertised features are missing", "Product is entirely different"] },
                        { title: "Security Concerns", items: ["Contains malicious code/viruses", "Poses security risks", "Contains backdoors"] },
                        { title: "Licensing Issues", items: ["Infringes third-party IP rights", "Contains unlicensed components", "Copyright violations"] }
                      ].map((section, i) => (
                        <div key={i} className="p-3 rounded bg-accent/50">
                          <h4 className="font-medium text-sm mb-2">{section.title}:</h4>
                          <ul className="space-y-1">
                            {section.items.map((item, j) => (
                              <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                <div className="h-1 w-1 rounded-full bg-orange-500 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Notice */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-brand-600/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Refund Request Process</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The complete refund policy includes detailed sections on:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {[
                        "How to request a refund",
                        "Refund review process",
                        "Processing timeframes",
                        "Refund methods",
                        "Partial refunds",
                        "Chargebacks",
                        "Seller responsibilities",
                        "Final decisions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6 rounded-lg bg-accent border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Refund Requests & Support
                </h3>
                <p className="text-muted-foreground mb-4">
                  For refund requests or questions about this policy, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:refunds@templamart.com" className="text-primary hover:underline">refunds@templamart.com</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@templamart.com" className="text-primary hover:underline">support@templamart.com</a></p>
                  <p className="pt-2 text-muted-foreground">Response time: Within 48-72 business hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;