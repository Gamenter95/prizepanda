import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Wallet, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { data: config } = useQuery<{ subscribeUrl: string }>({
    queryKey: ["/api/config"],
  });

  const handleSubscribe = () => {
    if (config?.subscribeUrl) {
      window.location.href = config.subscribeUrl;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-20 border-b flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Gift className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-semibold">Prize Panda</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleSubscribe}
            variant="default"
            size="default"
            data-testid="button-subscribe"
          >
            Subscribe
          </Button>
          <Button
            onClick={() => window.location.href = "/login"}
            variant="outline"
            size="default"
            data-testid="button-login"
          >
            Login
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-5xl font-bold tracking-tight">
            Win Rewards with Gift Codes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Redeem gift codes, earn prizes, and withdraw your balance instantly. Join Prize Panda today!
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={() => window.location.href = "/register"}
              size="lg"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button
              onClick={handleSubscribe}
              variant="outline"
              size="lg"
              data-testid="button-hero-subscribe"
            >
              Subscribe Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Redeem Gift Codes</h3>
              <p className="text-muted-foreground">
                Enter valid gift codes and instantly add prizes to your balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Withdraw Earnings</h3>
              <p className="text-muted-foreground">
                Cash out your balance to your UPI ID with minimum ₹5 withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Track Balance</h3>
              <p className="text-muted-foreground">
                Monitor your earnings and withdrawal history in real-time
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
