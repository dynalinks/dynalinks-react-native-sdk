// Export main class as default
export { default } from "./Dynalinks.js";

// Export types
export type { DynalinksConfig, DeepLinkResult, LinkData } from "./types.js";

export { DynalinksLogLevel } from "./types.js";

// Export errors
export {
  DynalinksError,
  NotConfiguredError,
  InvalidApiKeyError,
  SimulatorError,
  NetworkError,
  ServerError,
  InvalidResponseError,
  NoMatchError,
  InstallReferrerUnavailableError,
  InstallReferrerTimeoutError,
  InvalidUrlError,
} from "./errors.js";
