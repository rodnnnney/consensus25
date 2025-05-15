"use client";

import { useState } from "react";
import { useKeylessAccounts } from "../core/useKeylessAccounts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Twitter, Globe } from "lucide-react";

const FreelancerDashboard = () => {
  const { activeAccount } = useKeylessAccounts();
  const { freelancer } = useAuth();
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const [aptBalance, setAptBalance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const router = useRouter();
  // Mock data for listings
  const activeListings = [
    {
      id: 1,
      title: "Smart Contract Development",
      description: "Looking for an experienced smart contract developer",
      budget: "1000 APT",
      status: "Active",
    },
    {
      id: 2,
      title: "UI/UX Design",
      description: "Need a designer for our dApp interface",
      budget: "500 APT",
      status: "Active",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
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
                {freelancer?.profile_image ? (
                  <Image
                    src={freelancer.profile_image}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {freelancer?.first_name?.[0] ||
                      freelancer?.last_name?.[0] ||
                      activeAccount?.accountAddress.toString().slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {freelancer?.first_name && freelancer?.last_name
                    ? `${freelancer.first_name} ${freelancer.last_name}`
                    : "Freelancer Account"}
                </h3>
                {freelancer?.bio && (
                  <p className="text-sm mt-4 max-w-[50%]">{freelancer.bio}</p>
                )}
                {(freelancer?.twitter ||
                  freelancer?.site ||
                  freelancer?.farcaster) && (
                  <div className="flex gap-4 mt-2">
                    {freelancer.twitter && (
                      <a
                        href={freelancer.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {freelancer.site && (
                      <a
                        href={freelancer.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                    {freelancer.farcaster && (
                      <a
                        href={freelancer.farcaster}
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

      {/* Balance Section */}
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
            <CardTitle>USDC Balance</CardTitle>
            <CardDescription>Your USDC token balance</CardDescription>
          </CardHeader>
          <CardContent>
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
      </Card>
    </div>
  );
};

export default FreelancerDashboard;
