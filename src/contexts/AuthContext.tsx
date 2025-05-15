"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

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

export interface Contractor {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  tax_id?: string | null;
  country?: string | null;
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
  contractor: Contractor | null;
  contractors: Contractor[];
  invitations: Invitation[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRow, setUserRow] = useState<UserRow | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUser(null);
      setUserRow(null);
      setEmployer(null);
      setContractor(null);
      setContractors([]);
      setInvitations([]);
      setTransactions([]);
      setLoading(false);
      return;
    }
    const userRowRes = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserRow(userRowRes.data);
    setUser({
      id: user.id,
      role: userRowRes.data?.role === "employer" ? "employer" : "freelancer",
      email: user.email || undefined,
    });

    const { data: employer } = await supabase
      .from("employers")
      .select("*")
      .eq("id", user.id)
      .single();
    setEmployer(employer);

    const { data: contractor } = await supabase
      .from("freelancers")
      .select("*")
      .eq("id", user.id)
      .single();
    setContractor(contractor);

    let contractors: any[] = [];
    if (employer) {
      const { data: contractorsData } = await supabase
        .from("freelancers")
        .select("*")
        .eq("employer_id", employer.id);
      contractors = contractorsData || [];
    }
    setContractors(contractors);

    let invitations: any[] = [];
    if (employer) {
      const { data: invitationsData } = await supabase
        .from("invitations")
        .select("*")
        .eq("employer_id", employer.id);
      invitations = invitationsData || [];
    }
    setInvitations(invitations);

    let transactions: any[] = [];
    if (employer) {
      const contractorIds = contractors.map((c) => c.id);
      if (contractorIds.length > 0) {
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .in("contractor_id", contractorIds);
        transactions = txData || [];
      }
    } else if (contractor) {
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("contractor_id", contractor.id);
      transactions = txData || [];
    }
    setTransactions(transactions);

    setLoading(false);
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
        contractor,
        contractors,
        invitations,
        transactions,
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
