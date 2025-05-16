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
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("company_id", employer.id);

          if (txError) {
            console.error("Error fetching transactions:", txError);
          } else {
            setTransactions(txData || []);
          }

          // Fetch contractors for this employer
          if (employer) {
            console.log("Fetching transactions for company_id:", employer.company_id);
            // Fetch transactions
            const { data: txData, error: txError } = await supabase
              .from("transactions")
              .select("*")
              .eq("company_id", employer.company_id);

            if (txError) {
              console.error("Error fetching transactions:", txError);
            } else {
              console.log("Fetched transactions:", txData);
              setTransactions(txData || []);
            }

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
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("contractor_id", freelancer.id);

          if (txError) {
            console.error("Error fetching transactions:", txError);
          } else {
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
