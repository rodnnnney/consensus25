"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: string;
  role: "employer" | "freelancer";
  email?: string;
};

export interface UserRow {
  id: string;
  role: "employer" | "freelancer";
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  created_at: string;
  userid: string;
  header: string;
  rate: string;
  skills: string;
}

export interface Employer {
  id: string;
  company_name: string;
  company_id: string;
  contract_address?: string | null;
  headcount?: string | null;
  country?: string | null;
  wallet_address?: string | null;
  profile_image?: string | null;
}

export interface Freelancer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  tax_id?: string | null;
  country?: string | null;
  bio?: string | null;
  twitter?: string | null;
  site?: string | null;
  farcaster?: string | null;
  wallet_address?: string | null;
  employer_id?: string | null;
  email?: string | null;
  profile_image?: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  employer_id?: string | null;
  company_id?: string | null;
  status?: string | null;
  expires_at: string;
  created_at?: string | null;
}

export interface Transaction {
  id: string;
  contractor_id: string;
  usdc_price: number;
  usdc_amount: number;
  fiat_equivalent?: string | null;
  created_at?: string | null;
  status?: string | null;
  tx_hash?: string | null;
  company_id?: string | null;
}

type AuthContextType = {
  user: User | null;
  userRow: UserRow | null;
  employer: Employer | null;
  Freelancer: Freelancer | null;
  contractors: Freelancer[];
  invitations: Invitation[];
  transactions: Transaction[];
  jobs: Job[];
  freelancers: Freelancer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRow, setUserRow] = useState<UserRow | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [Freelancer, setContractor] = useState<Freelancer | null>(null);
  const [contractors, setContractors] = useState<Freelancer[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = async () => {
    try {
      console.log("Starting data fetch...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, clearing state");
        setUser(null);
        setUserRow(null);
        setEmployer(null);
        setContractor(null);
        setContractors([]);
        setInvitations([]);
        setTransactions([]);
        setJobs([]);
        setFreelancers([]);
        setLoading(false);
        return;
      }

      // Fetch user role
      console.log("Fetching user role...");
      const userRowRes = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userRowRes.error) {
        console.error("Error fetching user role:", userRowRes.error);
        setError("Error fetching user data");
        setLoading(false);
        return;
      }

      setUserRow(userRowRes.data);
      setUser({
        id: user.id,
        role: userRowRes.data?.role === "employer" ? "employer" : "freelancer",
        email: user.email || undefined,
      });

      // Fetch employer data if user is an employer
      if (userRowRes.data?.role === "employer") {
        console.log("Fetching employer data...");
        const { data: employer, error: employerError } = await supabase
          .from("employers")
          .select("*")
          .eq("id", user.id)
          .single();

        if (employerError) {
          console.error("Error fetching employer data:", employerError);
        } else {
          console.log("Employer data:", employer);
          setEmployer(employer);

          // Fetch transactions for this employer's company
          console.log("Fetching transactions for employer company:", employer.id);
          
          // First check all transactions with company_ids
          const { data: allCompanyTx, error: allCompanyTxError } = await supabase
            .from("transactions")
            .select("*")
            .not("company_id", "is", null);
            
          console.log("All transactions with company_ids:", allCompanyTx);
          
          // Then fetch this employer's transactions
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .select(`
              id,
              contractor_id,
              usdc_price,
              usdc_amount,
              created_at,
              status,
              tx_hash,
              company_id,
              contractor:freelancers!contractor_id(
                id,
                first_name,
                last_name,
                email,
                profile_image,
                country
              )
            `)
            .eq("company_id", employer.id)
            .not("company_id", "is", null);

          if (txError) {
            console.error("Error fetching employer transactions:", txError);
            console.error("Error details:", {
              code: txError.code,
              message: txError.message,
              details: txError.details,
              hint: txError.hint
            });
          } else {
            console.log("Raw employer transaction data:", txData);
            console.log("Number of employer transactions found:", txData?.length || 0);
            if (txData?.length > 0) {
              console.log("Sample employer transaction:", txData[0]);
            }
            setTransactions(txData || []);
          }

          // Fetch contractors for this employer
          if (employer) {
            console.log("Fetching contractors...");
            const { data: contractorsData, error: contractorsError } =
              await supabase
                .from("freelancers")
                .select("*")
                .eq("employer_id", employer.id);

            if (contractorsError) {
              console.error("Error fetching contractors:", contractorsError);
            } else {
              console.log("Fetched contractors:", contractorsData);
              setContractors(contractorsData || []);
            }

            console.log("Fetching invitations...");
            const { data: invitationsData, error: invitationsError } =
              await supabase
                .from("invitations")
                .select("*")
                .eq("employer_id", employer.id);

            if (invitationsError) {
              console.error("Error fetching invitations:", invitationsError);
            } else {
              setInvitations(invitationsData || []);
            }
          }
        }
      }
      // Fetch freelancer data if user is a freelancer
      else if (userRowRes.data?.role === "freelancer") {
        const { data: freelancer, error: freelancerError } = await supabase
          .from("freelancers")
          .select("*")
          .eq("id", user.id)
          .single();

        if (freelancerError) {
          console.error("Error fetching freelancer data:", freelancerError);
        } else {
          setContractor(freelancer);

          // Fetch transactions for this freelancer
          console.log("Fetching transactions for freelancer:", freelancer.id);
          
          // First, let's check if there are any transactions at all
          const { data: allTx, error: allTxError } = await supabase
            .from("transactions")
            .select("*");
          
          console.log("All transactions in system:", allTx);
          
          // Now fetch transactions for this specific freelancer
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .select(`
              id,
              contractor_id,
              usdc_price,
              usdc_amount,
              created_at,
              status,
              tx_hash,
              company_id,
              employer:employers(
                id,
                company_name,
                profile_image,
                country
              )
            `)
            .eq("contractor_id", freelancer.id);

          if (txError) {
            console.error("Error fetching transactions:", txError);
            console.error("Error details:", {
              code: txError.code,
              message: txError.message,
              details: txError.details,
              hint: txError.hint
            });
          } else {
            console.log("Raw transaction data:", txData);
            console.log("Number of transactions found:", txData?.length || 0);
            if (txData?.length > 0) {
              console.log("Sample transaction:", txData[0]);
            }
            
            // If no transactions found for this freelancer, check if they have a different ID in the transactions table
            if (txData?.length === 0) {
              console.log("No transactions found for current ID, checking transactions table for this freelancer's transactions");
              
              // Get all transactions and check their contractor_ids
              const uniqueContractorIds = [...new Set(allTx?.map(tx => tx.contractor_id) || [])];
              console.log("Unique contractor IDs in transactions:", uniqueContractorIds);
              
              // Check if any of these IDs match a freelancer with the same email
              if (freelancer.email) {
                const { data: otherFreelancer, error: otherError } = await supabase
                  .from("freelancers")
                  .select("*")
                  .eq("email", freelancer.email)
                  .in("id", uniqueContractorIds)
                  .single();
                
                if (otherFreelancer) {
                  console.log("Found matching freelancer with transactions:", otherFreelancer);
                  // Fetch transactions for this ID instead
                  const { data: otherTxData, error: otherTxError } = await supabase
                    .from("transactions")
                    .select(`
                      id,
                      contractor_id,
                      usdc_price,
                      usdc_amount,
                      created_at,
                      status,
                      tx_hash,
                      company_id,
                      employer:employers(
                        id,
                        company_name,
                        profile_image,
                        country
                      )
                    `)
                    .eq("contractor_id", otherFreelancer.id);
                    
                  if (!otherTxError && otherTxData) {
                    console.log("Found transactions under different ID:", otherTxData);
                    setTransactions(otherTxData);
                    return;
                  }
                }
              }
            }
            
            setTransactions(txData || []);
          }
        }
      }

      // Fetch jobs for all users
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*");
      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        setJobs([]);
      } else {
        setJobs(jobsData || []);
      }

      // Fetch all freelancers
      const { data: freelancersData, error: freelancersError } = await supabase
        .from("freelancers")
        .select("*");
      if (freelancersError) {
        console.error("Error fetching freelancers:", freelancersError);
        setFreelancers([]);
      } else {
        setFreelancers(freelancersData || []);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRow,
        employer,
        Freelancer,
        contractors,
        invitations,
        transactions,
        jobs,
        freelancers,
        loading,
        error,
        refetch: fetchData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
