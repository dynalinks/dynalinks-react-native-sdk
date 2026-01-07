/**
 * Configuration options for Dynalinks SDK.
 */
export interface DynalinksConfig {
  /** Your project's client API key from Dynalinks console */
  clientAPIKey: string;
  /** Base API URL (internal use only) */
  baseURL?: string;
  /** Logging verbosity level */
  logLevel?: DynalinksLogLevel;
  /** Allow running on simulator/emulator (for testing) */
  allowSimulator?: boolean;
}

/**
 * Log level for SDK logging.
 */
export enum DynalinksLogLevel {
  none = 'none',
  error = 'error',
  warning = 'warning',
  info = 'info',
  debug = 'debug',
}

/**
 * Result from checking for deferred deep link or resolving a URL.
 */
export interface DeepLinkResult {
  /** Whether a matching link was found */
  matched: boolean;
  /** Confidence level of the match */
  confidence?: 'high' | 'medium' | 'low';
  /** Match score (0-100) */
  matchScore?: number;
  /** The matched link data */
  link?: LinkData;
  /** Whether this is from a deferred deep link check */
  isDeferred: boolean;
}

/**
 * Link data from a matched Dynalinks URL.
 */
export interface LinkData {
  /** Unique link identifier */
  id: string;
  /** Link name */
  name?: string;
  /** Link path */
  path?: string;
  /** Shortened path */
  shortenedPath?: string;
  /** Original URL the link points to */
  url?: string;
  /** Full Dynalinks URL */
  fullUrl?: string;
  /** Deep link value for in-app navigation */
  deepLinkValue?: string;
  /** iOS fallback URL */
  iosFallbackUrl?: string;
  /** Android fallback URL */
  androidFallbackUrl?: string;
  /** Whether forced redirect is enabled */
  enableForcedRedirect?: boolean;
  /** Social sharing title */
  socialTitle?: string;
  /** Social sharing description */
  socialDescription?: string;
  /** Social sharing image URL */
  socialImageUrl?: string;
  /** Number of clicks */
  clicks?: number;
}
