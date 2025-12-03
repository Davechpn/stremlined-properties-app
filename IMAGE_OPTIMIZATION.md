# Image Optimization Guide (T186)

## Current Image Inventory

### App Icons & Branding
- `icon.png` - 384KB (Main app icon, 1024x1024)
- `splash-icon.png` - 17KB
- `favicon.png` - 1.1KB
- `android-icon-foreground.png` - 77KB
- `android-icon-background.png` - 17KB
- `android-icon-monochrome.png` - 4KB

### UI Assets
- `react-logo.png` - 6.2KB
- `react-logo@2x.png` - 14KB
- `react-logo@3x.png` - 21KB
- `partial-react-logo.png` - 5KB

## Optimization Strategy

### ✅ Already Optimized
All current images are reasonably sized:
- Most icons are under 25KB ✅
- Responsive images (@2x, @3x) follow React Native conventions ✅
- PNG format appropriate for logos with transparency ✅

### Future Optimizations

#### 1. Icon.png (384KB → ~100KB target)
```bash
# If icon.png becomes too large, optimize with:
npx expo-optimize
# OR manually:
pngquant icon.png --quality=65-80 --output icon-optimized.png
```

#### 2. Use Expo Image for Remote Images
All remote images (profile photos, property images) should use `expo-image` which provides:
- Automatic caching
- Progressive loading
- Placeholder support
- WebP support on compatible devices

**Implementation:**
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: photoUrl }}
  placeholder={require('@/assets/images/placeholder.png')}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

#### 3. SVG for Icons
Icon-based illustrations now use MaterialCommunityIcons (vector-based) instead of raster images:
- ✅ Scalable without quality loss
- ✅ Minimal file size
- ✅ Theme-aware colors
- ✅ Implemented in `empty-state-illustration.tsx`

#### 4. Image Loading Best Practices

**Always use Image component for remote images:**
```typescript
import { Image } from 'expo-image';

// With blurhash placeholder
<Image
  source={profilePhotoUrl}
  placeholder={blurhash}
  contentFit="cover"
  style={styles.avatar}
/>
```

**Always provide dimensions to prevent layout shift:**
```typescript
<Image
  source={imageUrl}
  style={{ width: 300, height: 200 }}
  contentFit="cover"
/>
```

#### 5. Lazy Loading for Lists
FlatList already implements virtualization, but for image-heavy lists:

```typescript
<FlatList
  data={items}
  renderItem={({ item, index }) => (
    <PropertyCard
      {...item}
      // Only load images for visible items
      loadImage={index < 10}
    />
  )}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews
/>
```

#### 6. Image Compression Guidelines
For any new images added to the project:

**Profile Photos:**
- Max dimensions: 400x400px
- Format: JPEG at 80% quality
- Max size: 100KB

**Property Photos:**
- Max dimensions: 1200x900px
- Format: JPEG at 85% quality
- Max size: 300KB

**Thumbnails:**
- Max dimensions: 200x200px
- Format: JPEG at 75% quality
- Max size: 30KB

#### 7. Build-Time Optimization
Expo automatically optimizes images during build:
```json
// app.json
{
  "expo": {
    "assetBundlePatterns": ["**/*"],
    "plugins": [
      ["expo-image-picker", {
        "photosPermission": "Allow access to photos"
      }]
    ]
  }
}
```

## Monitoring

### Performance Targets
- Image load time: <500ms on 3G
- Total image payload per screen: <1MB
- First Contentful Paint: <1.5s

### Tracking in Sentry
```typescript
// Track large image loads
Sentry.captureMessage('Large image loaded', {
  level: 'warning',
  extra: {
    imageUrl,
    sizeKB: imageSize / 1024,
  },
});
```

## Tools & Resources

### Compression Tools
- **pngquant**: PNG compression with transparency
- **jpegoptim**: JPEG compression
- **expo-optimize**: Automated Expo asset optimization
- **imagemagick**: Batch image processing

### Online Tools
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **SVGOMG**: https://jakearchibald.github.io/svgomg/

## Checklist

- [x] Audit current images (all under 400KB)
- [x] Use vector icons for empty states (MaterialCommunityIcons)
- [x] Use expo-image for all remote images (implemented in PhotoUpload)
- [x] Implement image caching (expo-image handles this)
- [ ] Add compression for user-uploaded photos (future: server-side)
- [ ] Add blurhash placeholders for remote images (future enhancement)
- [ ] Monitor image performance in Sentry (future enhancement)

## Conclusion

**Current Status**: ✅ Optimized
- All static assets are reasonably sized
- Empty states now use vector-based illustrations
- expo-image used for remote images with caching
- No immediate optimization needed

**Future Work**:
- Implement server-side image compression for uploads
- Add blurhash placeholders for better UX
- Monitor and alert on large image payloads
