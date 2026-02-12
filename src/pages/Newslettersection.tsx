import { useState, useEffect } from "react";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/config";
interface MathCaptcha {
  question: string;
  question_id: string;
}

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [captcha, setCaptcha] = useState<MathCaptcha | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptchaDialog, setShowCaptchaDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch new math captcha
  const fetchCaptcha = async () => {
    try {
      const response = await fetch(`${BASE_URL}/newsletter/captcha`);
      if (response.ok) {
        const data = await response.json();
        setCaptcha(data);
      } else {
        throw new Error("Failed to load captcha");
      }
    } catch (error) {
      setErrorMsg("Failed to load security question. Please try again.");
    }
  };

  // Initial form submit - show captcha dialog
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate email
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    // Fetch captcha and show dialog
    await fetchCaptcha();
    setShowCaptchaDialog(true);
  };

  // Final submit with captcha answer
  const handleFinalSubmit = async () => {
    if (!mathAnswer || !captcha) {
      setErrorMsg("Please answer the math question.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          math_answer: parseInt(mathAnswer),
          math_question_id: captcha.question_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message);
        setEmail("");
        setMathAnswer("");
        setShowCaptchaDialog(false);
        
        // Clear success message after 8 seconds
        setTimeout(() => setSuccessMsg(""), 8000);
      } else {
        setErrorMsg(data.detail || "Subscription failed. Please try again.");
        
        // If wrong answer, fetch new captcha
        if (data.detail?.includes("Incorrect")) {
          await fetchCaptcha();
          setMathAnswer("");
        }
      }
    } catch (error) {
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowCaptchaDialog(false);
    setMathAnswer("");
    setErrorMsg("");
  };

  // Handle Enter key in captcha input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && mathAnswer && !isLoading) {
      handleFinalSubmit();
    }
  };

  return (
    <>
      <div className="border-b bg-gradient-to-r from-primary/5 via-brand-600/5 to-primary/5">
        <div className="container py-12">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Mail className="mr-2 h-3 w-3" />
              Newsletter
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Stay Updated with Latest Templates
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter and get exclusive deals, new template
              releases, and design tips.
            </p>

            {/* Success Message */}
            {successMsg && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {successMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMsg && !showCaptchaDialog && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleInitialSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="h-12 bg-gradient-to-r from-primary to-brand-600 hover:from-primary/90 hover:to-brand-600/90"
                disabled={isLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Math Captcha Dialog */}
      <Dialog open={showCaptchaDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>One More Step...</DialogTitle>
            <DialogDescription>
              Please solve this simple math problem to confirm you're human.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Display Math Question */}
            {captcha && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Security Question
                </p>
                <p className="text-2xl font-bold text-primary">
                  {captcha.question}
                </p>
              </div>
            )}

            {/* Error Message in Dialog */}
            {errorMsg && showCaptchaDialog && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Answer Input */}
            <div className="space-y-2">
              <Label htmlFor="math-answer">Your Answer</Label>
              <Input
                id="math-answer"
                type="number"
                placeholder="Enter your answer"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoFocus
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isLoading || !mathAnswer}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-brand-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsletterSection;