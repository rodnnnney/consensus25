"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<
    "employer" | "freelancer" | null
  >(null);
  const [step, setStep] = useState<"role" | "info">("role");
  const [userInfo, setUserInfo] = useState({
    // Employer fields
    companyName: "",
    headcount: "",
    employerCountry: "",
    // Freelancer fields
    firstName: "",
    lastName: "",
    taxId: "",
    freelancerCountry: "",
    // Shared
    walletAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const { connect, account, connected, wallets } = useWallet();

  // Add state for showing wallet options
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  // Add useEffect to update wallet address when connected
  useEffect(() => {
    if (connected && account) {
      setUserInfo((prev) => ({
        ...prev,
        walletAddress: account.address.toString(),
      }));
    }
  }, [connected, account]);

  const handleConfirm = () => {
    if (!selectedRole) return;
    setStep("info");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const key = crypto.randomUUID();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("User not found.");
      return;
    }
    let error = null;
    if (selectedRole === "employer") {
      if (
        !userInfo.companyName ||
        !userInfo.headcount ||
        !userInfo.employerCountry
      ) {
        setError("Please fill all employer fields.");
        setLoading(false);
        return;
      }
      ({ error } = await supabase.from("users").upsert({
        id: user.id,
        role: "employer",
      }));
      if (!error) {
        ({ error } = await supabase.from("employers").insert({
          id: user.id,
          company_name: userInfo.companyName,
          company_id: key,
          headcount: userInfo.headcount,
          country: userInfo.employerCountry,
        }));
      }
    } else if (selectedRole === "freelancer") {
      if (
        !userInfo.firstName ||
        !userInfo.lastName ||
        !userInfo.taxId ||
        !userInfo.freelancerCountry ||
        !userInfo.walletAddress
      ) {
        setError("Please fill all freelancer fields.");
        setLoading(false);
        return;
      }
      ({ error } = await supabase.from("users").upsert({
        id: user.id,
        role: "freelancer",
      }));
      if (!error) {
        ({ error } = await supabase.from("freelancers").insert({
          id: user.id,
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          tax_id: userInfo.taxId,
          country: userInfo.freelancerCountry,
          email: user.email,
          wallet_address: userInfo.walletAddress,
        }));
        console.log(error);
        if (!error) {
          console.log("Freelancer created successfully");
        }
      }
    }
    setLoading(false);
    if (error) {
      setError("Error updating user info. Please try again.");
      return;
    }
    router.push(`${selectedRole === "employer" ? "/employer" : "/freelancer"}`);
  };

  const connectWallet = async (walletName: string) => {
    try {
      connect(walletName);
      setShowWalletOptions(false);
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", error);
    }
  };

  if (step === "info") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Additional Information</h1>
            <p className="text-muted-foreground mt-2">
              Please provide your details to complete the setup
            </p>
          </div>
          <div className="space-y-4">
            {selectedRole === "employer" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={userInfo.companyName}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, companyName: e.target.value })
                    }
                    placeholder="Enter your company name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headcount">Headcount</Label>
                  <Input
                    id="headcount"
                    value={userInfo.headcount}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, headcount: e.target.value })
                    }
                    placeholder="Number of employees"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerCountry">Country</Label>
                  <Input
                    id="employerCountry"
                    value={userInfo.employerCountry}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        employerCountry: e.target.value,
                      })
                    }
                    placeholder="Country based out of"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userInfo.firstName}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, firstName: e.target.value })
                    }
                    placeholder="Enter your first name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userInfo.lastName}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, lastName: e.target.value })
                    }
                    placeholder="Enter your last name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={userInfo.taxId}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, taxId: e.target.value })
                    }
                    placeholder="Enter your tax ID"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freelancerCountry">Country</Label>
                  <Input
                    id="freelancerCountry"
                    value={userInfo.freelancerCountry}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        freelancerCountry: e.target.value,
                      })
                    }
                    placeholder="Country based out of"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="walletAddress"
                      value={userInfo.walletAddress}
                      placeholder="Connect your wallet"
                      disabled={loading}
                      readOnly
                    />
                    <Button
                      type="button"
                      onClick={() => setShowWalletOptions(true)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                  {showWalletOptions && (
                    <div className="mt-2 border rounded-md p-2">
                      {wallets.map((wallet) => (
                        <Button
                          key={wallet.name}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => connectWallet(wallet.name)}
                        >
                          {wallet.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
          <div className="flex flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("role")}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                loading ||
                (selectedRole === "employer"
                  ? !userInfo.companyName ||
                    !userInfo.headcount ||
                    !userInfo.employerCountry
                  : !userInfo.firstName ||
                    !userInfo.lastName ||
                    !userInfo.taxId ||
                    !userInfo.freelancerCountry ||
                    !userInfo.walletAddress)
              }
            >
              {loading ? "Submitting..." : "Complete Setup"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select your role</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to use our platform
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer hover:border-primary transition-colors ${
              selectedRole === "employer" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setSelectedRole("employer")}
          >
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Z"></path>
                  <path d="M8 6V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3"></path>
                </svg>
              </div>
              <h3 className="font-medium">Employer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hire talent for your projects
              </p>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer hover:border-primary transition-colors ${
              selectedRole === "freelancer" ? "border-2 border-primary" : ""
            }`}
            onClick={() => setSelectedRole("freelancer")}
          >
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="font-medium">Freelancer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Find work and showcase your skills
              </p>
            </div>
          </Card>
        </div>

        <Button
          className="w-full"
          disabled={!selectedRole}
          onClick={handleConfirm}
        >
          Confirm Selection
        </Button>
      </div>
    </div>
  );
}
