// Export main class as default
export { default } from "./Dynalinks";

// Export types
export type { DynalinksConfig, DeepLinkResult, LinkData } from "./types";

export { DynalinksLogLevel } from "./types";

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
} from "./errors";
