"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Job, useAuth } from "@/contexts/AuthContext";

export default function JobListingsPage() {
  const router = useRouter();
  const { jobs } = useAuth();

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Available Job Listings</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job: Job) => (
          <Card
            key={job.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/employer/job/${job.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.header}</CardTitle>
                  <CardDescription className="mt-2">
                    {job.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Posted {new Date(job.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No active job listings found. Click "Post New Job" to create one!
          </div>
        )}
      </div>
    </div>
  );
}
