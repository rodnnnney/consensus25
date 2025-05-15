"use client";

import React, { useState } from "react";
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

const JOB_CATEGORIES = [
  { id: "software", name: "Software Engineering" },
  { id: "uiux", name: "UI/UX" },
  { id: "blockchain", name: "Blockchain/Crypto" },
];

const FreelancerDashboard = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log({
        jobTitle,
        jobDescription,
        category,
        budget,
        deadline,
      });
      
      setJobTitle("");
      setJobDescription("");
      setCategory("");
      setBudget("");
      setDeadline("");
      setIsSubmitting(false);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Job Listing Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Job Listing</CardTitle>
              <CardDescription>
                Fill out the form below to create a new job listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                  Job listing created successfully!
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior React Developer"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>Select a category</option>
                      {JOB_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget (USDC)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 500"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <textarea
                      id="jobDescription"
                      rows={5}
                      className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder="Describe the job requirements, skills needed, and any other relevant details..."
                      required
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating job listing..." : "Create Job Listing"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default FreelancerDashboard;
