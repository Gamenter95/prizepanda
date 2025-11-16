import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gift, LogOut, Wallet } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [giftCode, setGiftCode] = useState("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/redeem", { code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Gift code redeemed!",
        description: `You earned ₹${data.prizeAmount}`,
      });
      setGiftCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption failed",
        description: error.message || "Invalid or expired gift code",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCode.trim()) {
      redeemMutation.mutate(giftCode.trim());
    }
  };

  const balance = parseFloat(user?.balance || "0");
  const canWithdraw = balance >= 5;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Prize Panda</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground" data-testid="text-username">
            {user?.username}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">
            Redeem gift codes to earn rewards
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Redeem Gift Code</CardTitle>
            <CardDescription>
              Enter a valid gift code to add prizes to your balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRedeem} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="giftCode" className="sr-only">Gift Code</Label>
                <Input
                  id="giftCode"
                  type="text"
                  placeholder="Enter gift code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  disabled={redeemMutation.isPending}
                  data-testid="input-gift-code"
                />
              </div>
              <Button
                type="submit"
                disabled={redeemMutation.isPending || !giftCode.trim()}
                data-testid="button-redeem"
              >
                {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-4xl font-bold" style={{ fontFeatureSettings: '"tnum"' }} data-testid="text-balance">
                <span className="text-2xl font-semibold">₹</span>
                {balance.toFixed(2)}
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!canWithdraw}
              onClick={() => setLocation("/withdraw")}
              data-testid="button-withdraw"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
            {!canWithdraw && (
              <p className="text-sm text-muted-foreground" data-testid="text-min-balance">
                Minimum withdrawal amount is ₹5.00
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
