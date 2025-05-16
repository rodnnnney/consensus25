"use client";

import { useState } from "react";
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
import { ArrowLeft, ArrowUpDown, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const { transactions } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
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

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter((tx) => {
    const matchesSearch =
      tx.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.usdc_amount.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || tx.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/freelancer")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payments</CardTitle>
          <CardDescription>
            View and manage your payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by transaction hash or amount..."
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
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.created_at || "").toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium text-primary">
                          <DollarSign className="h-4 w-4" />
                          {tx.usdc_amount} USDC
                        </div>
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
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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