"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpDown, DollarSign, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function TransactionsPage() {
  const { transactions, freelancers } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Debug logs
  useEffect(() => {
    console.log("Raw transactions from context:", transactions);
    console.log("Available freelancers:", freelancers);
  }, [transactions, freelancers]);

  // Sort transactions
  const sortedTransactions = [...(transactions || [])].sort((a, b) => {
    console.log("Sorting transaction:", { a, b });
    if (sortConfig.key === "created_at") {
      return sortConfig.direction === "asc"
        ? new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
        : new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime();
    }
    if (sortConfig.key === "usdc_amount") {
      return sortConfig.direction === "asc"
        ? a.usdc_amount - b.usdc_amount
        : b.usdc_amount - a.usdc_amount;
    }
    return 0;
  });

  console.log("Sorted transactions:", sortedTransactions);

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter((tx) => {
    console.log("Filtering transaction:", tx);
    const freelancer = freelancers.find((f) => f.id === tx.contractor_id);
    console.log("Found freelancer for transaction:", freelancer);
    const matchesSearch =
      tx.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.usdc_amount.toString().includes(searchTerm) ||
      freelancer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tx.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  console.log("Filtered transactions:", filteredTransactions);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getFreelancerInfo = (contractorId: string) => {
    return freelancers.find((f) => f.id === contractorId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/employer")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Payment History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payments</CardTitle>
          <CardDescription>
            View and manage your payment history to freelancers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by freelancer name, transaction hash, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("usdc_amount")}
                        className="flex items-center gap-1"
                      >
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const freelancer = getFreelancerInfo(tx.contractor_id);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {new Date(tx.created_at || "").toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {freelancer?.profile_image ? (
                                <Image
                                  src={freelancer.profile_image}
                                  alt="Profile"
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <User className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {freelancer?.first_name} {freelancer?.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {freelancer?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium text-primary">
                            <DollarSign className="h-4 w-4" />
                            {tx.usdc_amount} USDC
                          </div>
                          {tx.fiat_equivalent && (
                            <div className="text-sm text-muted-foreground">
                              ≈ ${tx.fiat_equivalent}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.tx_hash ? (
                            <a
                              href={`https://explorer.aptoslabs.com/txn/${tx.tx_hash}?network=testnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-8)}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : tx.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 