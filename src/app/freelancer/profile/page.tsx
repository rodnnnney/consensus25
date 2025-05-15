"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Home,
  Twitter,
  Globe,
  MessageCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { freelancer, refetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    taxId: "",
    country: "",
    email: "",
    bio: "",
    twitter: "",
    site: "",
    farcaster: "",
  });

  useEffect(() => {
    if (freelancer) {
      setFormData({
        firstName: freelancer.first_name || "",
        lastName: freelancer.last_name || "",
        taxId: freelancer.tax_id || "",
        country: freelancer.country || "",
        email: freelancer.email || "",
        bio: freelancer.bio || "",
        twitter: freelancer.twitter || "",
        site: freelancer.site || "",
        farcaster: freelancer.farcaster || "",
      });
      if (freelancer.profile_image) {
        setPreviewUrl(freelancer.profile_image);
      }
    }
  }, [freelancer]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileExt = profileImage.name.split(".").pop();
      const fileName = `${freelancer?.id}-${Date.now()}.${fileExt}`;
      const filePath = `freelancer/${freelancer?.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("pfp")
        .upload(filePath, profileImage);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("pfp").getPublicUrl(filePath);

      // Update profile information
      const { error: updateError } = await supabase
        .from("freelancers")
        .update({
          profile_image: publicUrl,
        })
        .eq("id", freelancer?.id);

      if (updateError) throw updateError;

      await refetch();
      setProfileImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profileImageUrl = freelancer?.profile_image;

      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop();
        const fileName = `${freelancer?.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("pfp")
          .upload(fileName, profileImage);

        if (uploadError) throw uploadError;
        console.log(data);

        const {
          data: { publicUrl },
        } = supabase.storage.from("pfp").getPublicUrl(fileName);

        profileImageUrl = publicUrl;
      }

      // Update profile information
      const { error: updateError } = await supabase
        .from("freelancers")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          tax_id: formData.taxId,
          country: formData.country,
          profile_image: profileImageUrl,
          bio: formData.bio,
          twitter: formData.twitter,
          site: formData.site,
          farcaster: formData.farcaster,
        })
        .eq("id", freelancer?.id);

      if (updateError) throw updateError;

      await refetch();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {formData.firstName?.[0] || formData.lastName?.[0] || "?"}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-500">
                    {profileImage
                      ? `Selected: ${profileImage.name}`
                      : "No file selected"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Recommended: Square image, at least 500x500px
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-row gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center mb-1 text-xs"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Choose image</span>
                    </Button>

                    <Button
                      onClick={handleImageUpload}
                      disabled={!profileImage}
                      className="flex items-center text-xs"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Upload image</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  placeholder="https://twitter.com/username"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Personal Site
                </Label>
                <Input
                  id="site"
                  value={formData.site}
                  onChange={(e) =>
                    setFormData({ ...formData, site: e.target.value })
                  }
                  placeholder="https://yourwebsite.com"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farcaster" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Farcaster
                </Label>
                <Input
                  id="farcaster"
                  value={formData.farcaster}
                  onChange={(e) =>
                    setFormData({ ...formData, farcaster: e.target.value })
                  }
                  placeholder="https://warpcast.com/username"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself, your skills, and experience..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
