"use client";

import React from "react";
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
import type { Job } from "@/contexts/AuthContext";

export default function Page() {
  const { jobs } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.job;

  console.log("job id:", jobId);
  const job = jobs.find((j: Job) => Number(j.id) === Number(jobId));

  console.log(jobs);

  if (!job) {
    return <div className="p-8 text-center">Job not found.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.push("/freelancer")}>
        Back to Dashboard
      </Button>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">{job.header}</CardTitle>
          <CardDescription className="mt-2">{job.description}</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
}
