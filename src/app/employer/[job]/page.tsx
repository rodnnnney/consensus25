"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Job, Freelancer } from "@/contexts/AuthContext";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useKeylessAccounts } from "@/app/core/useKeylessAccounts";
import { testnetClient } from "@/app/core/constants";
import { decodeIdToken } from "@/app/core/idToken";
import { PostgrestError } from "@supabase/supabase-js";

export default function Page() {
  const { jobs, refetch, employer } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.job;
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { activeAccount, accounts, ephemeralKeyPair, switchKeylessAccount } =
    useKeylessAccounts();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const job = jobs.find((j: Job) => Number(j.id) === Number(jobId));

  useEffect(() => {
    const fetchFreelancer = async () => {
      if (!job?.userid) return;

      try {
        const { data, error } = await supabase
          .from("freelancers")
          .select("*")
          .eq("id", job.userid)
          .single();

        if (error) {
          console.error("Error fetching freelancer:", error);
          return;
        }

        setFreelancer(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [job?.userid]);

  useEffect(() => {
    console.log("Active Account:", activeAccount);
    console.log("Accounts:", accounts);
    console.log("Ephemeral Key Pair:", ephemeralKeyPair);
  }, [activeAccount, accounts, ephemeralKeyPair]);

  useEffect(() => {
    if (!activeAccount && accounts && accounts.length > 0) {
      const lastAccount = accounts[accounts.length - 1];
      const rawIdToken = lastAccount.idToken.raw;
      try {
        const decoded = decodeIdToken(rawIdToken);
        if (decoded.exp && Date.now() / 1000 < decoded.exp) {
          switchKeylessAccount(rawIdToken).catch((err) => {
            console.error("Failed to restore keyless account:", err);
          });
        }
      } catch (e) {
        // Invalid token, do nothing
      }
    }
  }, [activeAccount, accounts, switchKeylessAccount]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setTxError(null);
    setTxHash(null);
    setIsRateLimited(false);

    try {
      if (!job) return;
      if (!freelancer) return;
      if (!employer) return;
      if (!activeAccount) {
        setTxError("Please connect your wallet first");
        return;
      }
      const amount = Number(job.rate);

      const aptos = testnetClient;

      console.log("Building transaction...");
      const USDC_ADDRESS =
        "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832";

      // Now proceed with the transfer
      const transaction = await aptos.transaction.build.simple({
        sender: activeAccount.accountAddress,
        data: {
          function: "0x1::primary_fungible_store::transfer",
          typeArguments: ["0x1::object::ObjectCore"],
          functionArguments: [
            USDC_ADDRESS,
            freelancer.wallet_address,
            amount * 1e6,
          ],
        },
      });
      console.log("Transaction built:", transaction);

      console.log("Submitting transaction...");
      // Sign and submit in one step
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: activeAccount,
        transaction,
      });
      console.log("Transaction submitted, hash:", committedTxn.hash);

      console.log("Waiting for transaction confirmation...");
      const result = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      console.log("Transaction result:", result);

      if (result.success) {
        setTxHash(result.hash);
        console.log("Recording transaction in database...");
        
        // Log the current employer state for debugging
        console.log("Current employer state:", {
          id: employer.id,
          company_id: employer.company_id
        });

        // First verify the employer exists by their ID
        const { data: employerCheck, error: employerCheckError } = await supabase
          .from("employers")
          .select("id")
          .eq("id", employer.id)
          .single();

        if (employerCheckError || !employerCheck) {
          console.error("Failed to verify employer:", employerCheckError);
          throw new Error("Failed to verify employer details. Please try again.");
        }

        console.log("Verified employer details:", employerCheck);
        
        console.log("Transaction data to insert:", {
          contractor_id: freelancer.id,
          usdc_price: job.rate,
          usdc_amount: amount,
          status: "completed",
          tx_hash: result.hash,
          company_id: employer.id, // Use employer.id instead of company_id
        });
        
        // Check if transaction already exists
        const { data: existingTx, error: existingTxError } = await supabase
          .from("transactions")
          .select("*")
          .eq("tx_hash", result.hash)
          .single()
          .throwOnError();

        if (existingTxError) {
          console.error("Error checking existing transaction:", existingTxError);
        }

        if (existingTx) {
          console.log("Transaction already recorded:", existingTx);
          return; // Skip insertion if transaction exists
        }
        
        // Insert new transaction
        const { data: insertedTx, error: insertError } = await supabase
          .from("transactions")
          .insert({
            contractor_id: freelancer.id,
            usdc_price: job.rate,
            usdc_amount: amount,
            status: "completed",
            tx_hash: result.hash,
            company_id: employer.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
          .throwOnError();

        if (insertError) {
          console.error("Error inserting transaction:", insertError);
          const pgError = insertError as PostgrestError;
          console.error("Error details:", {
            code: pgError.code,
            message: pgError.message,
            details: pgError.details
          });
          throw new Error(`Failed to record transaction in database: ${pgError.message}`);
        }

        console.log("Inserted transaction:", insertedTx);
        
        try {
          console.log("Attempting to refresh data...");
          await refetch();
          console.log("Data refresh completed");
        } catch (error) {
          if (error instanceof Error && error.message.includes("429")) {
            setIsRateLimited(true);
            console.log("Rate limited, please wait 5 minutes before viewing updated transactions");
          } else {
            console.error("Error refreshing data:", error);
          }
        }
        
        alert("Payment successful! Note: Due to rate limiting, the transaction history may take a few minutes to update. Please check back in 5 minutes.");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      if (error instanceof Error && error.message.includes("429")) {
        setIsRateLimited(true);
        setTxError("Rate limit reached. Please wait 5 minutes before making another payment.");
      } else {
        setTxError(
          error instanceof Error
            ? error.message
            : "Payment failed. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!job) {
    return <div className="p-8 text-center">Job not found.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6 flex gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/freelancer")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            {freelancer?.profile_image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={freelancer.profile_image}
                  alt={`${freelancer.first_name} ${freelancer.last_name}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {freelancer?.first_name} {freelancer?.last_name}
              </h2>
              {freelancer?.country && (
                <p className="text-sm text-muted-foreground">
                  {freelancer.country}
                </p>
              )}
              {freelancer?.email && (
                <p className="text-sm text-muted-foreground">
                  {freelancer.email}
                </p>
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">{job.header}</CardTitle>
          <CardDescription className="mt-2 prose prose-sm max-w-none">
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.split(",").map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
          <div className="text-lg font-semibold mb-2">{job.rate} USDC/hr</div>
          <div className="text-sm text-muted-foreground">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </div>
          {freelancer?.bio && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">About the Freelancer</h3>
              <p className="text-sm text-muted-foreground">{freelancer.bio}</p>
            </div>
          )}
          <div className="mt-4 flex gap-4">
            {freelancer?.twitter && (
              <a
                href={freelancer.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Twitter
              </a>
            )}
            {freelancer?.site && (
              <a
                href={freelancer.site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Website
              </a>
            )}
            {freelancer?.farcaster && (
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
          <div className="mt-8 border-t pt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  Pay {job.rate} USDC/hr
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Payment</DialogTitle>
                  <DialogDescription>
                    You are about to pay {job.rate} USDC/hr to{" "}
                    {freelancer?.first_name} {freelancer?.last_name} for the job
                    "{job.header}".
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {txError && (
                    <div className="text-red-500 text-sm">{txError}</div>
                  )}
                  {isRateLimited && (
                    <div className="text-amber-500 text-sm">
                      Rate limit reached. Please wait 5 minutes before making another payment or viewing updated transactions.
                    </div>
                  )}
                  {txHash && (
                    <div className="text-green-500 text-sm">
                      Transaction successful! Hash: {txHash}
                      {isRateLimited && (
                        <div className="mt-2 text-amber-500">
                          Note: Due to rate limiting, the transaction history may take a few minutes to update. Please check back in 5 minutes.
                        </div>
                      )}
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={handlePayment}
                    disabled={isProcessing || isRateLimited}
                  >
                    {isProcessing ? "Processing..." : isRateLimited ? "Please wait 5 minutes..." : "Confirm Payment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
