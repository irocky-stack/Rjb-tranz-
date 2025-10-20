import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProfilePictureUpload from './ProfilePictureUpload';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Envelope,
  Phone,
  MapPin,
  Calendar,
  Shield,
  FloppyDisk,
  Camera,
  PencilSimple,
  Info
} from '@phosphor-icons/react';

interface ProfileSettingsProps {
  onBack: () => void;
  currentUser: string;
  onUserUpdate?: (userData: UserProfile) => void;
}

interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  role: string;
  joinDate: string;
  lastActive: string;
  profileImage?: string | null;
}

const defaultProfile: UserProfile = {
  displayName: 'Admin User',
  email: 'admin@rjbtranz.com',
  phone: '+233-123-456-789',
  location: 'Accra, Ghana',
  bio: 'System Administrator at RJB TRANZ',
  role: 'Administrator',
  joinDate: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  profileImage: null
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onBack,
  currentUser,
  onUserUpdate
}) => {
  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', {
    ...defaultProfile,
    displayName: currentUser || 'Admin User'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile || {
    ...defaultProfile,
    displayName: currentUser || 'Admin User'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Ensure we have a valid profile data
  const profileData = userProfile || defaultProfile;

  // Handle form field changes
  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile with current timestamp
      const updatedProfile = {
        ...tempProfile,
        lastActive: new Date().toISOString()
      };
      
      setUserProfile(updatedProfile);
      setIsEditing(false);
      onUserUpdate?.(updatedProfile);
      
      toast.success('Profile updated successfully', {
        description: 'Your profile information has been saved.',
      });
      
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'Please try again later.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setTempProfile(profileData);
    setIsEditing(false);
  };

  // Handle profile image change
  const handleProfileImageChange = (imageUrl: string | null) => {
    const updatedProfile = { ...profileData, profileImage: imageUrl };
    setUserProfile(updatedProfile);
    setTempProfile(updatedProfile);
    onUserUpdate?.(updatedProfile);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get display data
  const displayData = isEditing ? tempProfile : profileData;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" weight="duotone" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload and manage your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ProfilePictureUpload
                  currentUser={profileData.displayName}
                  size="xl"
                  showControls={true}
                  onImageChange={handleProfileImageChange}
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{displayData.displayName}</p>
                <Badge variant="secondary" className="text-xs">
                  {displayData.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" weight="duotone" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilSimple className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <FloppyDisk className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={tempProfile.displayName}
                      onChange={(e) => handleFieldChange('displayName', e.target.value)}
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{displayData.displayName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <Envelope className="h-4 w-4 text-muted-foreground" />
                      <span>{displayData.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={tempProfile.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{displayData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={tempProfile.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{displayData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    value={tempProfile.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    placeholder="Tell us about yourself"
                    className="w-full p-3 border rounded-md resize-none h-20 bg-background"
                  />
                ) : (
                  <div className="p-3 bg-muted/20 rounded-md">
                    <span>{displayData.bio || 'No bio provided'}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" weight="duotone" />
                  Account Information
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <Badge variant="outline">{displayData.role}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(displayData.joinDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>Last Active</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-md">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{formatTime(displayData.lastActive)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" weight="duotone" />
              Profile Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Profile Picture</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Use a clear, professional photo for best results. Square images work best.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Security</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Keep your contact information up to date for account security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <User className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Professional</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    A complete profile helps build trust with clients and colleagues.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;