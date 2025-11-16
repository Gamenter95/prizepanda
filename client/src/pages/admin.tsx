import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Users, Gift, Wallet, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User, GiftCode, WithdrawalRequest } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newCode, setNewCode] = useState({
    code: "",
    prizeAmount: "",
    usageLimit: "",
    expiresAt: "",
  });

  // No frontend auth check needed - server will enforce via isAdmin middleware

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: giftCodes = [] } = useQuery<GiftCode[]>({
    queryKey: ["/api/admin/gift-codes"],
  });

  const { data: withdrawals = [] } = useQuery<WithdrawalRequest[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const createCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/gift-codes", data);
    },
    onSuccess: () => {
      toast({
        title: "Gift code created",
        description: "New gift code has been created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewCode({ code: "", prizeAmount: "", usageLimit: "", expiresAt: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create gift code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/gift-codes/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Gift code cancelled",
        description: "Gift code has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel gift code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/withdrawals/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal updated",
        description: "Withdrawal request has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update withdrawal",
        description: error.message,
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

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      code: newCode.code,
      prizeAmount: newCode.prizeAmount,
      usageLimit: parseInt(newCode.usageLimit),
      expiresAt: new Date(newCode.expiresAt).toISOString(),
    };

    createCodeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold" data-testid="text-total-users">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Codes</p>
                <p className="text-2xl font-bold" data-testid="text-active-codes">
                  {giftCodes.filter((c) => c.isActive).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                <p className="text-2xl font-bold" data-testid="text-pending-withdrawals">
                  {withdrawals.filter((w) => w.status === "pending").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>₹{parseFloat(user.balance).toFixed(2)}</TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle>Gift Codes</CardTitle>
              <CardDescription>Create and manage gift codes</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-code">
                  <Gift className="w-4 h-4 mr-2" />
                  Create Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Gift Code</DialogTitle>
                  <DialogDescription>
                    Enter details for the new gift code
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                      required
                      data-testid="input-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeAmount">Prize Amount (₹)</Label>
                    <Input
                      id="prizeAmount"
                      type="number"
                      step="0.01"
                      value={newCode.prizeAmount}
                      onChange={(e) => setNewCode({ ...newCode, prizeAmount: e.target.value })}
                      required
                      data-testid="input-prize-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={newCode.usageLimit}
                      onChange={(e) => setNewCode({ ...newCode, usageLimit: e.target.value })}
                      required
                      data-testid="input-usage-limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiry Date & Time</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={newCode.expiresAt}
                      onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                      required
                      data-testid="input-expires-at"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createCodeMutation.isPending}
                    data-testid="button-submit-code"
                  >
                    {createCodeMutation.isPending ? "Creating..." : "Create Gift Code"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giftCodes.map((code) => (
                  <TableRow key={code.id} data-testid={`row-code-${code.id}`}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>₹{parseFloat(code.prizeAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      {code.usedCount}/{code.usageLimit}
                    </TableCell>
                    <TableCell>
                      {new Date(code.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.isActive ? "default" : "secondary"}>
                        {code.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelCodeMutation.mutate(code.id)}
                          disabled={cancelCodeMutation.isPending}
                          data-testid={`button-cancel-${code.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {giftCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No gift codes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>Review and manage withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UPI ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => {
                  const user = users.find((u) => u.id === withdrawal.userId);
                  return (
                    <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`}>
                      <TableCell className="font-medium">{user?.username || "Unknown"}</TableCell>
                      <TableCell>₹{parseFloat(withdrawal.amount).toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{withdrawal.upiId}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            withdrawal.status === "approved"
                              ? "default"
                              : withdrawal.status === "declined"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                updateWithdrawalMutation.mutate({
                                  id: withdrawal.id,
                                  status: "approved",
                                })
                              }
                              disabled={updateWithdrawalMutation.isPending}
                              data-testid={`button-approve-${withdrawal.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateWithdrawalMutation.mutate({
                                  id: withdrawal.id,
                                  status: "declined",
                                })
                              }
                              disabled={updateWithdrawalMutation.isPending}
                              data-testid={`button-decline-${withdrawal.id}`}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
