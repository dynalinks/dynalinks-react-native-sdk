import DynalinksModule from './DynalinksModule';
import { DynalinksConfig, DynalinksLogLevel, DeepLinkResult } from './types';
import { fromNativeError } from './errors';

/**
 * Main entry point for the Dynalinks SDK.
 *
 * Configure the SDK early in your app's lifecycle and use it to check
 * for deferred deep links and resolve incoming URLs.
 *
 * @example
 * ```typescript
 * await Dynalinks.configure({
 *   clientAPIKey: 'your-api-key',
 *   logLevel: DynalinksLogLevel.debug,
 * });
 *
 * const result = await Dynalinks.checkForDeferredDeepLink();
 * if (result.matched) {
 *   // Navigate based on result.link.deepLinkValue
 * }
 * ```
 */
class DynalinksClass {
  /** SDK version */
  public readonly version = '1.0.0';

  /**
   * Configure the Dynalinks SDK.
   *
   * Call this method as early as possible in your app's lifecycle,
   * typically in your app's entry point before rendering.
   *
   * @param config - Configuration options
   * @throws {InvalidApiKeyError} If the API key format is invalid
   *
   * @example
   * ```typescript
   * await Dynalinks.configure({
   *   clientAPIKey: 'your-client-api-key',
   *   logLevel: DynalinksLogLevel.debug,
   * });
   * ```
   */
  async configure(config: DynalinksConfig): Promise<void> {
    try {
      await DynalinksModule.configure({
        clientAPIKey: config.clientAPIKey,
        baseURL: config.baseURL,
        logLevel: config.logLevel || DynalinksLogLevel.error,
        allowSimulator: config.allowSimulator || false,
      });
    } catch (error: any) {
      throw fromNativeError(error.code || 'UNKNOWN', error.message);
    }
  }

  /**
   * Check for a deferred deep link.
   *
   * This method should be called once after the first app launch.
   * It will check if the user came from a Dynalinks link before installing.
   *
   * The SDK automatically prevents duplicate checks - subsequent calls
   * will return the cached result.
   *
   * @returns Promise resolving to DeepLinkResult
   * @throws {NotConfiguredError} If SDK is not configured
   * @throws {SimulatorError} If running on simulator/emulator
   * @throws {NetworkError} On network failures
   * @throws {ServerError} On server errors
   *
   * @example
   * ```typescript
   * try {
   *   const result = await Dynalinks.checkForDeferredDeepLink();
   *   if (result.matched && result.link?.deepLinkValue) {
   *     navigation.navigate(result.link.deepLinkValue);
   *   }
   * } catch (error) {
   *   if (error.code === 'SIMULATOR') {
   *     // Running on simulator
   *   }
   * }
   * ```
   */
  async checkForDeferredDeepLink(): Promise<DeepLinkResult> {
    try {
      const result = await DynalinksModule.checkForDeferredDeepLink();
      return this.parseResult(result, true);
    } catch (error: any) {
      throw fromNativeError(error.code || 'UNKNOWN', error.message);
    }
  }

  /**
   * Resolve a URL to link data.
   *
   * Use this method to manually resolve incoming URLs captured by
   * React Native's Linking API.
   *
   * @param url - The URL to resolve
   * @returns Promise resolving to DeepLinkResult
   * @throws {NotConfiguredError} If SDK is not configured
   * @throws {NetworkError} On network failures
   * @throws {ServerError} On server errors
   *
   * @example
   * ```typescript
   * import { Linking } from 'react-native';
   *
   * Linking.addEventListener('url', async (event) => {
   *   const result = await Dynalinks.resolveLink(event.url);
   *   if (result.matched) {
   *     navigation.navigate(result.link?.deepLinkValue);
   *   }
   * });
   * ```
   */
  async resolveLink(url: string): Promise<DeepLinkResult> {
    try {
      const result = await DynalinksModule.resolveLink(url);
      return this.parseResult(result, false);
    } catch (error: any) {
      throw fromNativeError(error.code || 'UNKNOWN', error.message);
    }
  }

  /**
   * Parse native result to DeepLinkResult.
   * @internal
   */
  private parseResult(nativeResult: any, isDeferred: boolean): DeepLinkResult {
    return {
      matched: nativeResult.matched || false,
      confidence: nativeResult.confidence,
      matchScore: nativeResult.match_score,
      link: nativeResult.link ? {
        id: nativeResult.link.id,
        name: nativeResult.link.name,
        path: nativeResult.link.path,
        shortenedPath: nativeResult.link.shortened_path,
        url: nativeResult.link.url,
        fullUrl: nativeResult.link.full_url,
        deepLinkValue: nativeResult.link.deep_link_value,
        iosFallbackUrl: nativeResult.link.ios_fallback_url,
        androidFallbackUrl: nativeResult.link.android_fallback_url,
        enableForcedRedirect: nativeResult.link.enable_forced_redirect,
        socialTitle: nativeResult.link.social_title,
        socialDescription: nativeResult.link.social_description,
        socialImageUrl: nativeResult.link.social_image_url,
        clicks: nativeResult.link.clicks,
      } : undefined,
      isDeferred,
    };
  }
}

export default new DynalinksClass();
