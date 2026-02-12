import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle, Mail } from "lucide-react";
import { BASE_URL } from "@/config";
const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-unsubscribe when page loads
  useEffect(() => {
    const autoUnsubscribe = async () => {
      if (!token) {
        setErrorMsg("Invalid unsubscribe link. No token provided.");
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/newsletter/unsubscribe/${token}`);
        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setEmail(data.email);
        } else {
          setErrorMsg(data.detail || "Failed to unsubscribe. Please try again.");
        }
      } catch (error) {
        setErrorMsg("An error occurred. Please try again later.");
      } finally {
        setIsProcessing(false);
      }
    };

    autoUnsubscribe();
  }, [token]);

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing your request...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Successfully Unsubscribed</CardTitle>
            <CardDescription>
              You've been removed from our mailing list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {email ? (
                  <>
                    <strong>{email}</strong> will no longer receive our newsletter.
                    You'll receive a confirmation email shortly.
                  </>
                ) : (
                  "You will no longer receive our newsletter."
                )}
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                We're sorry to see you go! If you change your mind, you can always
                resubscribe from our homepage.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link to="/" className="w-full">
              <Button className="w-full" variant="default">
                Return to Homepage
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Questions? Contact us at support@example.com
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Unsubscribe Failed</CardTitle>
          <CardDescription>
            We couldn't process your request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>The unsubscribe link has expired</li>
              <li>You're already unsubscribed</li>
              <li>The link is invalid or incomplete</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link to="/" className="w-full">
            <Button className="w-full" variant="outline">
              Return to Homepage
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            Need help? Contact us at support@example.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnsubscribePage;