"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Solidity", "Smart Contracts", "Web3", "UI/UX", "Blockchain", "Full Stack",
  "Frontend", "Backend", "DevOps", "Testing"
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "intermediate", label: "Intermediate (2-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "expert", label: "Expert/Lead (8+ years)" }
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "project", label: "One-time Project" }
];

const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    experienceLevel: "",
    jobType: "",
    location: "",
    timezone: "",
    skills: [] as string[],
    responsibilities: "",
    requirements: "",
    benefits: "",
    companyInfo: ""
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      skills: selectedSkills
    };
    console.log(submitData);
    alert("Job posted successfully! 🎉");
  };

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">✨ Create a Magical Job Posting ✨</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Find your perfect match in the world of Web3 talent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">📝 Basic Information</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Senior Smart Contract Developer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <select
                        id="jobType"
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full p-2 rounded-md border border-primary/20 focus:border-primary bg-background"
                        required
                      >
                        <option value="">Select Job Type</option>
                        {JOB_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel">Experience Level</Label>
                      <select
                        id="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        className="w-full p-2 rounded-md border border-primary/20 focus:border-primary bg-background"
                        required
                      >
                        <option value="">Select Experience Level</option>
                        {EXPERIENCE_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Compensation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">💰 Compensation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USDC)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 5000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Expected Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 3 months"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">🎯 Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedSkills.includes(skill) ? 'bg-primary text-white' : 'border-primary/20'
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Detailed Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">📋 Detailed Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of the role..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="min-h-[100px] border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Key Responsibilities</Label>
                    <Textarea
                      id="responsibilities"
                      placeholder="List the main responsibilities..."
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      required
                      className="min-h-[100px] border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="List specific requirements or qualifications..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      required
                      className="min-h-[100px] border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      placeholder="Describe the benefits and perks..."
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      className="min-h-[100px] border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-primary/10" />

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  ✨ Post Your Magical Job ✨
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PostJobPage;
