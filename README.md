# QR / Barcode Scanner

A modern web-based QR code and barcode scanner built with Vite + TypeScript. Optimized for mobile devices, especially iPhone Safari.

## Features

- 📱 **Mobile-First Design**: Optimized for iPhone and mobile browsers
- 📸 **Rear Camera Support**: Automatically selects rear-facing camera (environment)
- ⚡ **Real-Time Scanning**: Continuous QR code detection using jsQR
- 🎯 **Visual Feedback**: Scanning overlay with animated frame
- 🔊 **Audio Feedback**: Success beep on QR code detection
- 📋 **Copy to Clipboard**: One-click copy of scan results
- 🛡️ **Error Handling**: Comprehensive permission and error handling
- 🎨 **Responsive UI**: Works in portrait and landscape modes
- 🌓 **Dark/Light Mode**: Supports system color scheme preference

## Technology Stack

- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **jsQR**: Pure JavaScript QR code library
- **getUserMedia API**: Native browser camera access
- **Web Audio API**: Success sound feedback

## Browser Compatibility

### Recommended Browsers:
- ✅ Safari (iOS 14+) - **Primary target**
- ✅ Chrome (Android/iOS)
- ✅ Firefox (Android/iOS)
- ✅ Edge (Mobile)

### Requirements:
- HTTPS connection (required for camera access)
- Camera permissions granted

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit the displayed local URL (default: `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Grant Camera Permission**: Click "Start Scanning" and allow camera access when prompted
2. **Position QR Code**: Point the camera at a QR code or barcode
3. **Automatic Detection**: The app will automatically detect and display the result
4. **Copy Result**: Click the "Copy" button to copy the scanned data to clipboard

## iPhone Safari Compatibility

The app includes specific optimizations for iPhone Safari:

- `playsinline` attribute to prevent fullscreen video
- `facingMode: 'environment'` for rear camera selection
- Proper viewport meta tags to prevent zoom
- PWA-ready meta tags for home screen installation
- Fallback constraints for older iOS versions

## Error Handling

The app handles various error scenarios:

- **Permission Denied**: Clear instructions to enable camera access
- **No Camera**: Detection of missing camera hardware
- **Camera In Use**: Notification when camera is busy
- **Unsupported Browser**: Warning for incompatible browsers
- **HTTPS Required**: Alert for insecure connections

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
