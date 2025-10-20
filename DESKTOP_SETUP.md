# RJB TRANZ CRM - Desktop Application Setup Guide

This guide will help you convert and set up the RJB TRANZ CRM web application as a desktop application using Electron with automatic updates.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Python 3.x (for building native modules)
- Build tools for your platform:
  - **Windows**: Microsoft Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: build-essential package

### Installation

1. **Clone or navigate to your project directory**
   ```bash
   cd /path/to/your/rjb-tranz-project
   ```

2. **Install dependencies** (already done if you ran the setup)
   ```bash
   npm install
   ```

3. **Add app icons** (required for production builds)
   ```bash
   # Add these files to electron/assets/
   # - icon.png (512x512 PNG for Linux)
   # - icon.ico (256x256 ICO for Windows) 
   # - icon.icns (512x512 ICNS for macOS)
   ```

## 🛠️ Development

### Running in Development Mode

**Option 1: Run web version in Electron** (recommended for development)
```bash
npm run electron-dev
```
This starts the Vite dev server and opens it in Electron with hot reload.

**Option 2: Run pre-built version in Electron**
```bash
npm run build
npm run electron-build
```

**Option 3: Web development only**
```bash
npm run dev
```

### Development Features

- **Hot Reload**: Changes to React code automatically update
- **DevTools**: Electron DevTools available in development
- **Menu Integration**: Desktop menu bar with keyboard shortcuts
- **Native File Dialogs**: For importing/exporting data
- **Notifications**: Native desktop notifications
- **Auto-updater**: Automatic updates from GitHub releases

## 📦 Building for Production

### Build for Current Platform
```bash
npm run dist
```

### Build for Specific Platforms
```bash
# Windows (creates installer and portable)
npm run dist-win

# macOS (creates DMG and ZIP)
npm run dist-mac

# Linux (creates AppImage, DEB, and RPM)
npm run dist-linux
```

### Build Directory Only (for testing)
```bash
npm run dist-dir
```

## 🔄 Auto-Updates Setup

### 1. GitHub Repository Setup

1. **Create a GitHub repository** for your desktop app
2. **Update package.json** with your repository details:
   ```json
   {
     "repository": {
       "type": "git",
       "url": "https://github.com/YOUR_USERNAME/rjb-tranz-desktop.git"
     },
     "build": {
       "publish": {
         "provider": "github",
         "owner": "YOUR_USERNAME",
         "repo": "rjb-tranz-desktop"
       }
     }
   }
   ```

### 2. GitHub Token Setup

1. **Generate Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate token with `repo` scope
   
2. **Set environment variable**:
   ```bash
   export GH_TOKEN="your-github-token"
   # Or on Windows:
   set GH_TOKEN=your-github-token
   ```

### 3. Publishing Releases

```bash
# Build and publish to GitHub releases
npm run dist
```

The auto-updater will:
- Check for updates on app startup
- Download updates in background
- Prompt user to restart when ready
- Automatically install updates

### 4. Update Process for Users

When users open the app:
1. App checks GitHub for new releases
2. Downloads update in background if available
3. Shows notification when download complete
4. Prompts to restart with new version
5. Automatically applies update on restart

## 🎯 Platform-Specific Features

### Windows
- **Installer**: NSIS installer with options
- **Auto Start**: Option to start with Windows
- **File Associations**: Associate file types with your app
- **Notifications**: Windows native notifications

### macOS
- **DMG**: Drag-and-drop installer
- **Code Signing**: Sign app for distribution
- **Notarization**: Apple notarization support
- **Menu Bar**: Native macOS menu integration

### Linux
- **Multiple Formats**: AppImage, DEB, RPM packages
- **Desktop Integration**: .desktop file creation
- **System Tray**: Linux system tray support

## 🔧 Configuration

### Electron Configuration

Edit `electron/main.js` to customize:
- Window size and behavior
- Menu structure
- Auto-updater settings
- Security policies

### Build Configuration

Edit `package.json` build section for:
- Output directories
- File inclusions/exclusions
- Platform-specific settings
- Code signing configuration

### App Icon Setup

Add icons to `electron/assets/`:
```
electron/assets/
├── icon.png    # 512x512 PNG (Linux)
├── icon.ico    # 256x256 ICO (Windows)
└── icon.icns   # 512x512 ICNS (macOS)
```

## 🚨 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm run postinstall
```

**Permission Issues on macOS**
```bash
# Sign the app (requires Apple Developer account)
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
npm run dist-mac
```

**Auto-updater Not Working**
- Ensure GitHub token is set
- Check repository URL in package.json
- Verify release is published on GitHub
- Check console for error messages

### Debug Mode

Enable debugging:
```bash
export DEBUG=electron-builder
npm run dist
```

## 📱 Mobile-like Features

The desktop app includes mobile-optimized features:
- Touch-friendly UI elements
- Responsive design
- Gesture support (where applicable)
- Mobile-style notifications

## 🔒 Security Features

- **Context Isolation**: Prevents code injection
- **Disabled Node Integration**: Secure renderer process
- **Content Security Policy**: Prevents XSS attacks
- **Secure External Links**: Opens links in default browser

## 📊 App Features

### Desktop-Specific Enhancements

1. **Menu Bar Integration**
   - File operations (New, Export, Settings)
   - Navigation shortcuts (Ctrl+1-4)
   - View controls (Refresh, Full Screen)

2. **Keyboard Shortcuts**
   - `Ctrl/Cmd + N`: New Transaction
   - `Ctrl/Cmd + E`: Export Data
   - `Ctrl/Cmd + ,`: Settings
   - `Ctrl/Cmd + 1-4`: Navigate tabs
   - `Ctrl/Cmd + R`: Refresh
   - `F11`: Toggle Fullscreen

3. **Native File Operations**
   - Save/Open dialogs
   - CSV/JSON export
   - File associations

4. **System Integration**
   - Desktop notifications
   - System tray (optional)
   - Auto-start capability

## 🎨 Customization

### Splash Screen
Edit `electron/splash.html` to customize the loading screen.

### App Icons
Replace icons in `electron/assets/` with your branding.

### Window Behavior
Modify `electron/main.js` to change window properties.

## 📈 Performance

### Optimization Tips

1. **Bundle Size**: Use `npm run dist-dir` to check bundle size
2. **Memory Usage**: Monitor with Task Manager/Activity Monitor
3. **Startup Time**: Optimize by reducing initial load
4. **Updates**: Delta updates reduce download size

### Production Checklist

- [ ] App icons added
- [ ] GitHub repository configured
- [ ] Auto-updater tested
- [ ] All platforms built and tested
- [ ] Code signing certificates configured
- [ ] Release notes prepared

## 🆘 Support

For issues specific to the desktop version:
1. Check the Electron logs in DevTools
2. Verify all dependencies are installed
3. Test in development mode first
4. Check GitHub repository configuration

The desktop app maintains full compatibility with the web version while adding native desktop features and automatic updates.