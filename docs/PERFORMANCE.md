# Performance report

> Fill in the measured values on a real device/simulator (release build). The
> tables below are what to capture; nothing here is estimated.

## Targets (from the brief)
| Metric | Target | Measured |
|---|---|---|
| Initial load with cached data | < 3 s to interactive | _TODO_ |
| List scroll | 60 fps sustained | _TODO_ |
| Memory under normal use | < 150 MB | _TODO_ |

## How to measure

**Bundle size** (main JS bundle)
```bash
npx react-native bundle --platform ios --dev false --entry-file index.js \
  --bundle-output /tmp/main.jsbundle --assets-dest /tmp/assets
ls -lh /tmp/main.jsbundle
# Android: use --platform android
```
| Platform | Bundle size |
|---|---|
| iOS | _TODO_ |
| Android | _TODO_ |

**FPS**: Release build, open the Perf Monitor (dev menu) or use Flashlight on Android. Scroll top-to-bottom fast on the full list, with and without a search/filter applied.

**Memory**: Xcode Instruments (Allocations / Activity Monitor) or Android Studio Profiler while scrolling the whole list and opening a few detail/gallery screens. Save screenshots to `docs/img/`.

**Time to interactive**: kill the app, then launch offline with a warm cache; record time until the list is scrollable.

## Screenshots to add
- `docs/img/profiler-list.png` (full list render)
- `docs/img/memory.png` (memory during scroll)

## Design choices that support these targets
See "Performance trade-off: rich rows, not many rows" in `DECISIONS.md`.
