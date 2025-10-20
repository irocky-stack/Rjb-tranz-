 import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Upload,
  Camera,
  X,
  Check,
  Image as ImageIcon,
  Trash,
  ArrowCounterClockwise,
  Download,
  User,
  WarningCircle
} from '@phosphor-icons/react';

interface ProfilePictureUploadProps {
  currentUser?: string;
  onImageChange?: (imageUrl: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
}

interface ImageValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentUser = 'User',
  onImageChange,
  className = '',
  size = 'md',
  showControls = true
}) => {
  const [profileImage, setProfileImage] = useKV<string | null>('user-profile-image', null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Image validation rules
  const validation: ImageValidation = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    minWidth: 100,
    minHeight: 100,
    maxWidth: 2048,
    maxHeight: 2048
  };

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 'h-8 w-8', text: 'text-xs', button: 'h-8 px-2 text-xs' },
    md: { avatar: 'h-12 w-12', text: 'text-sm', button: 'h-10 px-3 text-sm' },
    lg: { avatar: 'h-16 w-16', text: 'text-base', button: 'h-12 px-4' },
    xl: { avatar: 'h-24 w-24', text: 'text-lg', button: 'h-14 px-6 text-lg' }
  };

  const config = sizeConfig[size];

  // Validate image file
  const validateImage = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!validation.allowedTypes.includes(file.type)) {
        reject(new Error(`Invalid file type. Allowed types: ${validation.allowedTypes.join(', ')}`));
        return;
      }

      // Check file size
      if (file.size > validation.maxSize) {
        reject(new Error(`File too large. Maximum size: ${(validation.maxSize / (1024 * 1024)).toFixed(1)}MB`));
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        if (validation.minWidth && width < validation.minWidth) {
          reject(new Error(`Image too small. Minimum width: ${validation.minWidth}px`));
          return;
        }
        
        if (validation.minHeight && height < validation.minHeight) {
          reject(new Error(`Image too small. Minimum height: ${validation.minHeight}px`));
          return;
        }
        
        if (validation.maxWidth && width > validation.maxWidth) {
          reject(new Error(`Image too large. Maximum width: ${validation.maxWidth}px`));
          return;
        }
        
        if (validation.maxHeight && height > validation.maxHeight) {
          reject(new Error(`Image too large. Maximum height: ${validation.maxHeight}px`));
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        reject(new Error('Invalid image file'));
      };

      img.src = URL.createObjectURL(file);
    });
  }, [validation]);

  // Compress image if needed
  const compressImage = useCallback((file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions (max 512x512 for profile pictures)
        const maxDimension = 512;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate image
      await validateImage(file);
      setUploadProgress(25);

      // Compress image
      const compressedBlob = await compressImage(file);
      setUploadProgress(50);

      // Convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadProgress(75);

        // Simulate processing time
        setTimeout(() => {
          setProfileImage(imageUrl);
          setUploadProgress(100);
          
          // Notify parent component
          onImageChange?.(imageUrl);
          
          toast.success('Profile picture updated successfully!', {
            description: 'Your new profile picture has been saved.',
            action: {
              label: 'View',
              onClick: () => setShowPreview(true)
            }
          });

          // Reset states
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }, 300);
      };

      reader.onerror = () => {
        throw new Error('Failed to process image');
      };

      reader.readAsDataURL(compressedBlob);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', {
        description: error instanceof Error ? error.message : 'Please try again with a different image.',
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateImage, compressImage, setProfileImage, onImageChange]);

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCountRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      } else {
        toast.error('Please drop an image file');
      }
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileUpload]);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Remove profile picture
  const removeProfilePicture = useCallback(() => {
    setProfileImage(null);
    onImageChange?.(null);
    toast.success('Profile picture removed');
  }, [setProfileImage, onImageChange]);

  // Download profile picture
  const downloadProfilePicture = useCallback(() => {
    if (profileImage) {
      const link = document.createElement('a');
      link.href = profileImage;
      link.download = `${currentUser}-profile-picture.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Profile picture downloaded');
    }
  }, [profileImage, currentUser]);

  // Generate initials fallback
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, []);

  return (
    <div className={`profile-picture-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload profile picture"
      />

      {/* Main upload area */}
      <div
        className={`relative group transition-all duration-300 ${
          isDragging ? 'scale-105 ring-2 ring-primary ring-offset-2' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Avatar display */}
        <Avatar 
          className={`${config.avatar} cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-primary/50 ${
            isUploading ? 'opacity-75' : ''
          } ${
            isDragging ? 'ring-2 ring-primary scale-110' : ''
          }`}
          onClick={openFilePicker}
        >
          <AvatarImage 
            src={profileImage || undefined}
            alt={`${currentUser}'s profile picture`}
            className="object-cover"
          />
          <AvatarFallback className={`bg-gradient-to-br from-primary to-secondary text-primary-foreground font-medium ${config.text}`}>
            {profileImage ? (
              <User className="w-1/2 h-1/2" weight="duotone" />
            ) : (
              getInitials(currentUser)
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
              <div className={`${config.text} font-medium`}>{uploadProgress}%</div>
            </div>
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary border-dashed">
            <Upload className="w-1/2 h-1/2 text-primary" weight="duotone" />
          </div>
        )}

        {/* Upload hint on hover */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click or drag to upload
        </div>
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div className="mt-3">
          <Progress value={uploadProgress} className="h-2" />
          <p className={`${config.text} text-muted-foreground mt-1 text-center`}>
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Controls */}
      {showControls && !isUploading && (
        <div className="flex items-center justify-center gap-1 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            className={`${config.button} transition-all duration-200 hover:scale-105`}
          >
            <Camera className="w-4 h-4 mr-1" weight="duotone" />
            Upload
          </Button>

          {profileImage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className={`${config.button} transition-all duration-200 hover:scale-105`}
              >
                <ImageIcon className="w-4 h-4" weight="duotone" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadProfilePicture}
                className={`${config.button} transition-all duration-200 hover:scale-105`}
              >
                <Download className="w-4 h-4" weight="duotone" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={removeProfilePicture}
                className={`${config.button} text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105`}
              >
                <Trash className="w-4 h-4" weight="duotone" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && profileImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Picture Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImage} alt="Profile preview" className="object-cover" />
                  <AvatarFallback>
                    {getInitials(currentUser)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={downloadProfilePicture}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => {
                    removeProfilePicture();
                    setShowPreview(false);
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage info */}
      {showControls && (
        <div className="mt-2 text-center">
          <p className={`${config.text} text-muted-foreground`}>
            Max {(validation.maxSize / (1024 * 1024)).toFixed(0)}MB • JPG, PNG, WebP
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;