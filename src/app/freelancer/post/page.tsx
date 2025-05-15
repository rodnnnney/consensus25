"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SKILL_CATEGORIES = [
  { id: "software", name: "Software Engineering" },
  { id: "uiux", name: "UI/UX Design" },
  // Add more categories as needed
];

const FreelancerProfilePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase.from("jobs").insert({
      userid: user.data.user?.id,
      header: title,
      skills: skills,
      rate: hourlyRate,
      description: experience,
    });

    if (error) {
      console.error(error);
    }

    console.log(data);
    setTitle("");
    setSkills("");
    setExperience("");
    setHourlyRate("");
    setIsSubmitting(false);
    setShowSuccess(true);
    router.push("/freelancer");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Your Freelancer Profile</h1>
          <div className="flex gap-4">
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
        </div>
      </header>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Freelancer Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Profile</CardTitle>
              <CardDescription>
                Fill out the form below to create your freelancer profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                  Profile created successfully!
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fullstack and Mobile software engineer"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Primary Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_CATEGORIES.map((cat) => (
                        <Button
                          key={cat.id}
                          type="button"
                          variant={skills === cat.id ? "default" : "outline"}
                          onClick={() => setSkills(cat.id)}
                          className="flex-1 min-w-[150px]"
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (USDC)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="e.g., 50"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience">Experience & Bio</Label>
                    <textarea
                      id="experience"
                      rows={5}
                      className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      placeholder="Describe your experience, skills, and what makes you unique..."
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating profile..." : "Create Profile"}
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

export default FreelancerProfilePage;
