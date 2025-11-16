
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, ArrowLeft, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Donate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const upiId = "althafx@fam";

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "UPI ID Copied!",
      description: "The UPI ID has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code URL using Google Charts API
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=upi://pay?pa=${upiId}&pn=PrizePanda&cu=INR`;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Prize Panda</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Support Us ❤️</CardTitle>
            <CardDescription className="text-base">
              Even a little support helps us keep Prize Panda running!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">UPI ID</h3>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-4 py-2 bg-muted rounded-md text-lg font-mono">
                    {upiId}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUPI}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-64 h-64 border-2 border-border rounded-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Scan this QR code with any UPI app to donate
                </p>
              </div>

              <div className="pt-6">
                <p className="text-muted-foreground">
                  Your support helps us create more gift codes and improve the platform for everyone. Thank you! 🙏
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
