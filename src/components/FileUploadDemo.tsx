import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfilePictureUpload from './ProfilePictureUpload';
import { 
  Camera, 
  User, 
  Image as ImageIcon, 
  Upload,
  CheckCircle,
  Star
} from '@phosphor-icons/react';

const FileUploadDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Custom Profile Picture Upload</h2>
        <p className="text-muted-foreground">
          Advanced file upload system with drag & drop, image validation, compression, and preview
        </p>
      </div>

      {/* Feature showcase */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" weight="duotone" />
            <h3 className="font-semibold">Drag & Drop</h3>
            <p className="text-sm text-muted-foreground">
              Simply drag and drop images to upload
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" weight="duotone" />
            <h3 className="font-semibold">Smart Validation</h3>
            <p className="text-sm text-muted-foreground">
              Automatic size, format, and dimension checks
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" weight="duotone" />
            <h3 className="font-semibold">Auto Compression</h3>
            <p className="text-sm text-muted-foreforeground">
              Optimizes images for better performance
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" weight="duotone" />
            <h3 className="font-semibold">Preview & Controls</h3>
            <p className="text-sm text-muted-foreground">
              Full preview with download and delete options
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Small size demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" weight="duotone" />
              Small (Header)
            </CardTitle>
            <CardDescription>
              Perfect for navigation headers and compact spaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentUser="Admin"
                size="sm"
                showControls={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                32x32px • Minimal controls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medium size demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" weight="duotone" />
              Medium (Standard)
            </CardTitle>
            <CardDescription>
              Standard size for most profile displays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentUser="John Doe"
                size="md"
                showControls={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                48x48px • Full controls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Large size demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" weight="duotone" />
              Large (Profile Page)
            </CardTitle>
            <CardDescription>
              Large format for dedicated profile pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentUser="Sarah Wilson"
                size="lg"
                showControls={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                64x64px • Enhanced preview
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features list */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Features</CardTitle>
          <CardDescription>
            Advanced file handling capabilities built-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Drag and drop upload</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Click to browse files</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Image format validation (JPG, PNG, WebP, GIF)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>File size limits (5MB max)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Dimension validation (100x100 min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Automatic image compression</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Upload progress indicator</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Full-screen preview modal</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Download uploaded image</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Remove/delete functionality</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Persistent storage with useKV</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <span>Responsive design for all screen sizes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical specs */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
          <CardDescription>
            Implementation details and constraints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JPEG/JPG</li>
                <li>• PNG</li>
                <li>• WebP</li>
                <li>• GIF</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Size Limits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Max file size: 5MB</li>
                <li>• Min dimensions: 100x100px</li>
                <li>• Max dimensions: 2048x2048px</li>
                <li>• Compressed to: 512x512px</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Storage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Uses Spark's useKV hook</li>
                <li>• Base64 encoded storage</li>
                <li>• Persistent across sessions</li>
                <li>• Automatic fallback initials</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadDemo;