"use client";

import { useState, useEffect } from "react";
import { useKeylessAccounts } from "../core/useKeylessAccounts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Bell, Check, DollarSign, Twitter, Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FreelancerDashboard = () => {
  const { activeAccount } = useKeylessAccounts();
  const { Freelancer, jobs, transactions } = useAuth();
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const [aptBalance, setAptBalance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [newPayments, setNewPayments] = useState<any[]>([]);
  const router = useRouter();

  // Track new payments
  useEffect(() => {
    const lastChecked = localStorage.getItem('lastPaymentCheck') || '0';
    const newTxs = transactions.filter(tx => 
      new Date(tx.created_at || '').getTime() > parseInt(lastChecked)
    );
    setNewPayments(newTxs);
    localStorage.setItem('lastPaymentCheck', Date.now().toString());
  }, [transactions]);

  // Mark payments as read
  const handleMarkAsRead = () => {
    setNewPayments([]);
    localStorage.setItem('lastPaymentCheck', Date.now().toString());
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Payment Notifications */}
      {newPayments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Bell className="w-6 h-6" />
              New Payments
            </h2>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.push('/freelancer/transactions')}
              >
                <DollarSign className="h-4 w-4" />
                Transaction History
              </Button>
              <Button variant="outline" onClick={handleMarkAsRead} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Mark all as read
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {newPayments.map((payment) => (
              <Alert key={payment.id} className="border-2 border-primary/20 bg-background">
                <DollarSign className="h-5 w-5 text-primary" />
                <AlertTitle className="text-primary font-semibold">
                  Payment Received! 🎉
                </AlertTitle>
                <AlertDescription className="mt-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <p>You've received a payment of <span className="font-bold text-primary">{payment.usdc_amount} USDC</span></p>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID: {payment.tx_hash?.slice(0, 8)}...{payment.tx_hash?.slice(-8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Received: {new Date(payment.created_at || '').toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/20">
                    {payment.status}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </div>
          <Separator className="bg-primary/10" />
        </div>
      )}

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Profile</CardTitle>
          <CardDescription>Your professional information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-16">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 overflow-hidden">
                {Freelancer?.profile_image ? (
                  <Image
                    src={Freelancer.profile_image}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {Freelancer?.first_name?.[0] ||
                      Freelancer?.last_name?.[0] ||
                      activeAccount?.accountAddress.toString().slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {Freelancer?.first_name && Freelancer?.last_name
                    ? `${Freelancer.first_name} ${Freelancer.last_name}`
                    : "Freelancer Account"}
                </h3>
                {Freelancer?.bio && (
                  <p className="text-sm mt-4 max-w-[50%]">{Freelancer.bio}</p>
                )}
                {(Freelancer?.twitter ||
                  Freelancer?.site ||
                  Freelancer?.farcaster) && (
                  <div className="flex gap-4 mt-2">
                    {Freelancer.twitter && (
                      <a
                        href={Freelancer.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {Freelancer.site && (
                      <a
                        href={Freelancer.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                    {Freelancer.farcaster && (
                      <a
                        href={Freelancer.farcaster}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Farcaster
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/freelancer/profile")}
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Section with Transaction History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>APT Balance</CardTitle>
            <CardDescription>Your Aptos token balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Image
                src="/aptos.png"
                alt="Aptos Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              {aptBalance} APT
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>USDC Balance</CardTitle>
                <CardDescription>Your USDC token balance</CardDescription>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
                onClick={() => router.push('/freelancer/transactions')}
              >
                View History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Image
                  src="/usdc.png"
                  alt="USDC Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                {usdcBalance} USDC
              </div>
              {/* Recent Transactions Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Transactions</h4>
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(tx.created_at || '').toLocaleDateString()}
                    </span>
                    <span className="font-medium text-primary">
                      +{tx.usdc_amount} USDC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your current job listings</CardDescription>
          </div>
          <Button onClick={() => router.push("/freelancer/post")}>
            Post New Listing
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <a
                key={job.id}
                onClick={() => router.push(`/freelancer/${job.id}`)}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.header}</CardTitle>
                        <CardDescription className="mt-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                        {job.rate} USDC/hr
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
            {jobs.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No active listings found. Click "Post New Listing" to create
                one!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerDashboard;
