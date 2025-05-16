"use client";

import React, { useEffect, useState } from "react";
import { useKeylessAccounts } from "../core/useKeylessAccounts";
import { GOOGLE_CLIENT_ID, testnetClient } from "../core/constants";
import useEphemeralKeyPair from "../core/useEphemeralKeyPair";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { shortenString } from "./util/shorten";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { Job, useAuth } from "@/contexts/AuthContext";
import { decodeIdToken } from "../core/idToken";
import { DollarSign } from "lucide-react";

const USDC_FAUCET_URL = "https://faucet.circle.com/";
const APT_FAUCET_URL = "https://aptos.dev/en/network/faucet";

const EmployerDashboard = () => {
  const { activeAccount, switchKeylessAccount, accounts } =
    useKeylessAccounts();
  const { jobs, employer } = useAuth();
  const ephemeralKeyPair = useEphemeralKeyPair();
  const [loginUrl, setLoginUrl] = useState<string>("");
  const [aptBalance, setAptBalance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<KeylessAccount | null>(null);
  console.log(jobs);

  useEffect(() => {
    if (activeAccount) {
      setPrivateKey(activeAccount);
      // Only store the account address, which is a string
      localStorage.setItem(
        "ephemeralPrivateKey",
        activeAccount.accountAddress.toString()
      );
    }

    const fetchBalances = async () => {
      if (!activeAccount?.accountAddress) return;

      try {
        // Fetch all coins for the account
        const accountCoinsData = await testnetClient.getAccountCoinsData({
          accountAddress: activeAccount.accountAddress,
          options: { limit: 10 },
        });

        // Find APT and USDC balances
        let aptBalance = "0";
        let usdcBalance = "0";

        for (const coin of accountCoinsData) {
          if (
            coin.asset_type === "0x1::aptos_coin::AptosCoin" ||
            coin.metadata?.symbol === "APT"
          ) {
            aptBalance = (Number(coin.amount) / 1e8).toString(); // Adjust decimals if needed
          }
          if (
            coin.metadata?.symbol === "USDC" ||
            (coin.asset_type && coin.asset_type.toLowerCase().includes("usdc"))
          ) {
            usdcBalance = (Number(coin.amount) / 1e6).toString(); // USDC is usually 6 decimals
          }
        }

        setAptBalance(aptBalance);
        setUsdcBalance(usdcBalance);
      } catch (error) {
        console.error("Error fetching balances:", error);
        setAptBalance("0");
        setUsdcBalance("0");
      }
    };

    fetchBalances();
  }, [activeAccount?.accountAddress]);

  useEffect(() => {
    const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/employer/callback`,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: ephemeralKeyPair.nonce,
    });
    redirectUrl.search = searchParams.toString();
    setLoginUrl(redirectUrl.toString());
  }, [ephemeralKeyPair.nonce]);

  // Toast auto-hide effect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Restore keyless session on mount if possible
  useEffect(() => {
    if (!activeAccount && accounts && accounts.length > 0) {
      // Try the most recent account
      const lastAccount = accounts[accounts.length - 1];
      const rawIdToken = lastAccount.idToken.raw;
      try {
        const decoded = decodeIdToken(rawIdToken);
        // Check expiration (exp is in seconds)
        if (decoded.exp && Date.now() / 1000 < decoded.exp) {
          switchKeylessAccount(rawIdToken).catch((err) => {
            if (err.message.includes("429")) {
              setError(
                "Rate limit exceeded. Please wait 5 minutes before trying again."
              );
            } else {
              setError(
                "Failed to restore session. Please try signing in again."
              );
            }
          });
        }
      } catch (e) {
        // Invalid token, do nothing
      }
    }
  }, [activeAccount, accounts, switchKeylessAccount]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employer Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push('/employer/transactions')}
            >
              <DollarSign className="h-4 w-4" />
              Transaction History
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!activeAccount ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome to Employer Dashboard</CardTitle>
              <CardDescription>
                Sign in with your Google account to access your employer
                features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href={loginUrl}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Toast Notification */}
            {showToast && (
              <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                Address copied to clipboard!
              </div>
            )}
            {error && (
              <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6">
              {/* Account Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your keyless account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">Address:</div>
                      <div className="text-sm">
                        {shortenString(
                          activeAccount?.accountAddress.toString()
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            activeAccount?.accountAddress.toString() || ""
                          );
                          setShowToast(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="14"
                            height="14"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"
                          />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <div className="px-2 pb-1 bg-green-100 border border-green-500 text-green-700 rounded-md animate-pulse">
                        <span className="text-green-700 text-xs">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* APT Balance Card */}
              <Card>
                <CardHeader>
                  <CardTitle>APT Balance</CardTitle>
                  <CardDescription>Your Aptos token balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    <p className="text-sm text-muted-foreground underline">
                      <a
                        href={APT_FAUCET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Need more Testnet Aptos?
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* USDC Balance Card */}
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
                      onClick={() => router.push('/employer/transactions')}
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
                    <p className="text-sm text-muted-foreground underline">
                      <a
                        href={USDC_FAUCET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Need more Testnet USDC?
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default EmployerDashboard;
