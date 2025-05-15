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

export default function Page() {
  const { jobs } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.job;
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
        </CardContent>
      </Card>
    </div>
  );
}
