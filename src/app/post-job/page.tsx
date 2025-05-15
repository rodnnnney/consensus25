"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PostJobPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = () => {
    // Replace with actual API call or blockchain interaction
    console.log({ title, description, budget });
    alert("Job posted!");
  };

  return (
    <main className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Proposed Budget (USDC)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            type="number"
          />
          <Button className="w-full" onClick={handleSubmit}>
            Submit Job
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default PostJobPage;
