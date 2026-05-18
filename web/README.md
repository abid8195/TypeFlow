# TypeFlow - Typing Speed Test

A modern, fast, and offline-first typing speed test web application. Built with React 19, TypeScript, Vite, and Tailwind CSS 4.

## Features

- ⚡ **Lightning Fast** - Instant feedback with no lag
- 🚀 **Progressive Web App** - Install and use offline
- 📊 **Real-time Analytics** - WPM, accuracy, and error tracking
- 🎯 **Multiple Modes** - 30s, 60s, and 120s tests with three difficulty levels
- 🎨 **Dark-first UI** - Beautiful, modern design with smooth animations
- 📱 **Responsive Design** - Perfect on desktop, tablet, and mobile
- 🔒 **Privacy First** - No tracking, no ads, no accounts, no backend
- 💾 **Local Persistence** - Save your stats and progress locally
- 🎯 **Typing Streak** - Track your daily typing streak

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first CSS
- **pnpm** - Fast package manager
- **Service Workers** - Offline support

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Navigate to project directory
cd web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
# Build the project
pnpm build

# Preview production build
pnpm preview
```

The built files will be in the `dist/` directory.

## Usage

1. **Select Duration** - Choose between 30s, 60s, or 120s tests
2. **Select Difficulty** - Pick from Easy, Medium, or Hard word lists
3. **Start Test** - Click "Start Test" to begin
4. **Type** - Type the words as they appear
5. **View Results** - See your WPM, accuracy, and error count

### Keyboard Shortcuts

- **Tab** - Skip current word
- **Space** - Move to next word (auto)
- **ESC** (future) - End test early

## Project Structure

```
web/
├── src/
│   ├── components/        # React components
│   │   ├── Navbar.tsx
│   │   ├── TypingArea.tsx
│   │   ├── Timer.tsx
│   │   ├── StatsBar.tsx
│   │   ├── Controls.tsx
│   │   ├── ResultsModal.tsx
│   │   └── SettingsModal.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useTypingTest.ts
│   │   └── usePersistence.ts
│   ├── utils/            # Utility functions
│   │   ├── typing.ts     # Typing calculations
│   │   └── storage.ts    # localStorage utilities
│   ├── data/             # Static data
│   │   └── words.ts      # Word lists
│   ├── styles/           # Global styles
│   │   └── globals.css
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies

```

## Features Explained

### Real-time Typing Analytics

- **WPM (Words Per Minute)** - Gross WPM calculated from characters typed
- **Accuracy** - Percentage of correctly typed characters
- **Error Count** - Number of mistakes made
- **Typing Streak** - Consecutive days of typing

### Test Modes

#### Durations
- 30 seconds - Quick practice
- 60 seconds - Standard test
- 120 seconds - Extended challenge

#### Difficulty Levels
- **Easy** - Common simple words
- **Medium** - Everyday vocabulary
- **Hard** - Complex challenging words

### Local Persistence

All data is stored locally in your browser:
- Best WPM score
- Complete typing history
- User settings and preferences
- Typing streak tracking

Data never leaves your device.

### PWA Features

- **Offline Support** - Works completely offline
- **Installable** - Install as an app on mobile/desktop
- **App-like Experience** - Full-screen mode on mobile
- **Fast Loading** - Service worker caching
- **Add to Home Screen** - Works on iOS and Android

## Design Philosophy

TypeFlow follows the FreeAppStore philosophy:

✓ **Free Forever** - No premium features, no paywall
✓ **No Tracking** - No analytics, no user data collection
✓ **No Ads** - Pure, uninterrupted experience
✓ **Browser-First** - Works in any modern browser
✓ **Lightweight** - Minimal bundle size, fast loading
✓ **Privacy First** - All data stored locally

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance

- Initial Load: ~50KB (gzipped)
- No external dependencies (React + Tailwind only)
- 60 FPS animations
- Offline-first caching

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- ARIA labels and roles
- High contrast dark theme
- 44px+ touch targets
- Screen reader friendly

## Mobile Optimization

- Viewport-fit for notch devices
- Safe area insets
- Touch-friendly spacing
- No zoom on input focus
- Responsive typography
- Optimized for all screen sizes

## Local Development

### Development Server

```bash
pnpm dev
```

Runs with hot module replacement (HMR)

### Type Checking

```bash
pnpm type-check
```

Validates TypeScript types

### Production Build

```bash
pnpm build
```

Optimized production build with:
- Tree-shaking
- Code splitting
- Asset optimization
- Service worker bundling

## Contributing

This is a free, open-source project. Suggestions and improvements are welcome!

## License

MIT License - See LICENSE file for details

## Credits

Built with ❤️ using:
- React 19 by Meta
- Vite by Evan You
- Tailwind CSS by Tailwind Labs
- Inspired by Monkeytype

## Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Review the code - it's well-commented
3. Test in different browsers
4. Create an issue or PR on GitHub

## Roadmap

Planned features (future updates):
- [ ] Theme customization
- [ ] Sound effects
- [ ] Practice modes
- [ ] Detailed statistics
- [ ] Typing history charts
- [ ] Multiplayer mode (local)
- [ ] Custom word lists
- [ ] Dark/Light mode toggle

## FAQ

**Q: Does TypeFlow collect my data?**
A: No. All data is stored locally in your browser. Nothing is sent to any server.

**Q: Can I use TypeFlow offline?**
A: Yes! TypeFlow is a Progressive Web App (PWA). Install it and it works completely offline.

**Q: How is WPM calculated?**
A: Standard WPM calculation: (characters typed / 5) / time in minutes. Gross WPM without accuracy penalty.

**Q: What word lists are used?**
A: Easy words are common, Medium are everyday vocabulary, Hard are challenging complex words.

**Q: Can I install this as an app?**
A: Yes! Click the install button in your browser or "Add to Home Screen" on mobile.

---

Made with passion for typing enthusiasts. Happy typing! ⌨️
