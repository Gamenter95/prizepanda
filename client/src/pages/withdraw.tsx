import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const balance = parseFloat(user?.balance || "0");

  useEffect(() => {
    if (balance < 5) {
      toast({
        title: "Insufficient balance",
        description: "You need at least ₹5 to make a withdrawal",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [balance, setLocation, toast]);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; upiId: string }) => {
      return await apiRequest("POST", "/api/withdraw", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted for approval",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 5) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is ₹5",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "Withdrawal amount exceeds your balance",
        variant: "destructive",
      });
      return;
    }

    if (!upiId.trim()) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount, upiId: upiId.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Prize Panda</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 md:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Withdraw Funds</CardTitle>
            <CardDescription>
              Enter the amount and your UPI ID to request a withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="balance">Available Balance</Label>
                <div className="text-2xl font-bold" style={{ fontFeatureSettings: '"tnum"' }} data-testid="text-balance">
                  ₹{balance.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="5"
                  step="0.01"
                  required
                  data-testid="input-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum: ₹5.00
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                  data-testid="input-upi-id"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={withdrawMutation.isPending}
                data-testid="button-submit"
              >
                {withdrawMutation.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
