import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle, Mail } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Auto-verify when page loads
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setErrorMsg("Invalid verification link. No token provided.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/auth/verify-email?token=${token}`);

        // Success
        setIsSuccess(true);
        setEmail(response.data.email);

        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate("/login");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error: any) {
        console.error("Verification failed:", error.response?.data || error.message);
        setErrorMsg(
          error.response?.data?.detail || "Failed to verify email. Please try again."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="text-muted-foreground text-center">
                Please wait while we verify your email address
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Email Verified Successfully!
            </CardTitle>
            <CardDescription>
              Your account is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <strong>{email}</strong> has been verified successfully!
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-r from-primary/5 via-brand-600/5 to-primary/5 border rounded-lg p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Welcome Aboard! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                Your account is now active and you can start using all features.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Redirecting to login in</span>
                <span className="font-bold text-primary text-lg">{countdown}</span>
                <span>seconds...</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link to="/login" className="w-full">
              <Button className="w-full" size="lg">
                Go to Login Now
              </Button>
            </Link>
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Homepage
              </Button>
            </Link>
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
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address
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
              <li>The verification link has expired (valid for 24 hours)</li>
              <li>The link has already been used</li>
              <li>The link is invalid or incomplete</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Need a new verification link?
                </h3>
                <p className="text-sm text-blue-700">
                  Go to the signup page and register again, or contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link to="/signup" className="w-full">
            <Button className="w-full" variant="default">
              Go to Signup
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Homepage
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;