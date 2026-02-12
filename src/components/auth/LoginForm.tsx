import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config";

const LoginForm = () => {
  const [username, setUsername] = useState(""); // used as username or email
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setNeedsVerification(false);

    try {
      await login(username, password);
    } catch (error: any) {
      console.error("Login failed:", error);

      const errorDetail = error.response?.data?.detail || error.message;

      // Check if error is due to unverified email
      if (
        errorDetail.includes("verify your email") ||
        errorDetail.includes("not verified")
      ) {
        setNeedsVerification(true);
        setUnverifiedEmail(username);
        setErrorMsg(
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
      } else if (errorDetail.includes("deactivated")) {
        setErrorMsg(
          "Your account has been deactivated. Please contact support."
        );
      } else if (errorDetail.includes("Invalid credentials")) {
        setErrorMsg("Invalid email/username or password. Please try again.");
      } else {
        setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/resend-verification`,
        {
          email: unverifiedEmail,
        }
      );

      setErrorMsg(""); // Clear error
      setNeedsVerification(false); // Hide verification section
      alert(response.data.message); // Show success message
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.detail || "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Message */}
          {errorMsg && (
            <Alert variant={needsVerification ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Email Verification Notice */}
          {needsVerification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Email Verification Required
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    We sent a verification email when you registered. Please
                    check your inbox and spam folder.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;