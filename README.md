# expo-dynalinks-sdk

The official React Native SDK for [Dynalinks](https://dynalinks.app) - deferred deep linking and attribution for iOS and Android apps.

## Features

- **Deferred Deep Linking**: Track users who click links before installing your app
- **Manual Link Resolution**: Resolve Dynalinks URLs to link data
- **Cross-Platform**: Single API for both iOS and Android
- **Type-Safe**: Full TypeScript support with comprehensive error handling

## Requirements

- React Native 0.70.0 or later
- Expo SDK 49 or later
- iOS 16.0 or later
- Android API 21 or later

## Installation

```bash
npx expo install expo-dynalinks-sdk
```

## Setup

### iOS Setup

1. **Register your iOS app** in the [Dynalinks Console](https://dynalinks.app/console):
   - Bundle Identifier (from Xcode project settings)
   - Team ID (from Apple Developer account)
   - App Store ID (from your app's App Store URL)

2. **Configure Associated Domains** in Xcode:
   - Open your iOS project > Signing & Capabilities
   - Add the "Associated Domains" capability
   - Add your domain: `applinks:yourproject.dynalinks.app`

See the [iOS integration guide](https://docs.dynalinks.app/integrations/ios.html) for detailed instructions.

### Android Setup

1. **Register your Android app** in the [Dynalinks Console](https://dynalinks.app/console):
   - Package identifier (from `build.gradle` applicationId)
   - SHA-256 certificate fingerprint (run `./gradlew signingReport`)

2. **Add intent filter** to your `AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask">

    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="yourproject.dynalinks.app" />
    </intent-filter>
</activity>
```

See the [Android integration guide](https://docs.dynalinks.app/integrations/android.html) for detailed instructions.

## Usage

### Initialize the SDK

Configure the SDK as early as possible in your app's lifecycle:

```typescript
import Dynalinks, { DynalinksLogLevel } from 'expo-dynalinks-sdk';

// In your App.tsx or index.js
await Dynalinks.configure({
  clientAPIKey: 'your-client-api-key',
  logLevel: DynalinksLogLevel.debug, // Use .error in production
});
```

### Check for Deferred Deep Links

Check if the user came from a Dynalinks link before installing:

```typescript
import Dynalinks from 'expo-dynalinks-sdk';

async function checkDeferredDeepLink() {
  try {
    const result = await Dynalinks.checkForDeferredDeepLink();

    if (result.matched && result.link?.deepLinkValue) {
      // User came from a deep link - navigate accordingly
      navigation.navigate(result.link.deepLinkValue);
    }
  } catch (error) {
    if (error.code === 'SIMULATOR') {
      // Running on simulator - deferred deep linking not available
    } else {
      console.error('Error checking deferred deep link:', error);
    }
  }
}
```

### Handle Incoming Deep Links

Use React Native's built-in `Linking` API to capture URLs, then resolve them with Dynalinks:

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import Dynalinks from 'expo-dynalinks-sdk';

function App() {
  useEffect(() => {
    // Listen for links while app is running
    const subscription = Linking.addEventListener('url', async (event) => {
      const result = await Dynalinks.resolveLink(event.url);

      if (result.matched && result.link?.deepLinkValue) {
        navigation.navigate(result.link.deepLinkValue);
      }
    });

    return () => subscription.remove();
  }, []);

  return <YourApp />;
}
```

### Complete Example

```typescript
import { useEffect } from 'react';
import { Linking } from 'react-native';
import Dynalinks, { DynalinksLogLevel } from 'expo-dynalinks-sdk';

function App() {
  useEffect(() => {
    initializeDynalinks();
  }, []);

  async function initializeDynalinks() {
    try {
      // 1. Configure SDK
      await Dynalinks.configure({
        clientAPIKey: 'your-api-key',
        logLevel: DynalinksLogLevel.debug,
      });

      // 2. Check for deferred deep link
      const result = await Dynalinks.checkForDeferredDeepLink();
      if (result.matched) {
        handleDeepLink(result.link?.deepLinkValue);
      }

      // 3. Listen for incoming links
      Linking.addEventListener('url', async (event) => {
        const result = await Dynalinks.resolveLink(event.url);
        if (result.matched) {
          handleDeepLink(result.link?.deepLinkValue);
        }
      });
    } catch (error) {
      console.error('Dynalinks initialization error:', error);
    }
  }

  function handleDeepLink(deepLinkValue?: string) {
    if (!deepLinkValue) return;

    // Navigate based on deep link value
    if (deepLinkValue.startsWith('product/')) {
      const productId = deepLinkValue.replace('product/', '');
      navigation.navigate('ProductDetails', { productId });
    }
  }

  return <YourApp />;
}
```

## API Reference

### Dynalinks

| Method | Description |
|--------|-------------|
| `configure(config)` | Initialize the SDK with your API key |
| `checkForDeferredDeepLink()` | Check for deferred deep link (first launch) |
| `resolveLink(url)` | Resolve a URL to link data |
| `version` | SDK version string |

### DeepLinkResult

| Property | Type | Description |
|----------|------|-------------|
| `matched` | `boolean` | Whether a link was matched |
| `confidence` | `'high' \| 'medium' \| 'low'` | Match confidence |
| `matchScore` | `number` | Match score (0-100) |
| `link` | `LinkData` | The matched link data |
| `isDeferred` | `boolean` | Whether from deferred deep link |

### LinkData

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique link identifier |
| `name` | `string` | Link name (for display) |
| `path` | `string` | Link path |
| `shortenedPath` | `string` | Shortened path |
| `url` | `string` | Original URL the link points to |
| `fullUrl` | `string` | Full Dynalinks URL |
| `deepLinkValue` | `string` | Value for in-app navigation |
| `iosFallbackUrl` | `string` | iOS fallback URL |
| `androidFallbackUrl` | `string` | Android fallback URL |
| `enableForcedRedirect` | `boolean` | Whether forced redirect is enabled |
| `socialTitle` | `string` | Social sharing title |
| `socialDescription` | `string` | Social sharing description |
| `socialImageUrl` | `string` | Social sharing image |
| `clicks` | `number` | Number of clicks on this link |

### Exceptions

| Exception | Description |
|-----------|-------------|
| `NotConfiguredError` | SDK not configured |
| `InvalidApiKeyError` | Invalid API key format |
| `SimulatorError` | Running on simulator/emulator |
| `NetworkError` | Network request failed |
| `ServerError` | Server returned an error |
| `InvalidResponseError` | Invalid server response |
| `NoMatchError` | No matching link found |

## Configuration Options

```typescript
await Dynalinks.configure({
  clientAPIKey: 'your-api-key',     // Required
  logLevel: DynalinksLogLevel.debug, // Optional, default: .error
  allowSimulator: false,             // Optional, default: false
});
```

### Log Levels

- `DynalinksLogLevel.none` - No logging
- `DynalinksLogLevel.error` - Errors only (default)
- `DynalinksLogLevel.warning` - Warnings and errors
- `DynalinksLogLevel.info` - Info, warnings, and errors
- `DynalinksLogLevel.debug` - All logs

## Migration from v0.1.0

**Before (v0.1.0):**
```typescript
import { configureDynalinks, addDeferredDeepLinkListener } from 'expo-dynalinks-sdk';

const subscription = addDeferredDeepLinkListener((event) => {
  if (event.matched) {
    navigate(event.link?.deep_link_value);
  }
});

await configureDynalinks('api-key');
```

**After (v1.0.0):**
```typescript
import Dynalinks from 'expo-dynalinks-sdk';

await Dynalinks.configure({ clientAPIKey: 'api-key' });

const result = await Dynalinks.checkForDeferredDeepLink();
if (result.matched && result.link?.deepLinkValue) {
  navigate(result.link.deepLinkValue);
}
```

## Support

- [Documentation](https://docs.dynalinks.app)
- [GitHub Issues](https://github.com/dynalinks/dynalinks-react-native-sdk/issues)
- [Email Support](mailto:admins@dynalinks.app)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
