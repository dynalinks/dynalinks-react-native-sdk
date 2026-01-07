import { requireNativeModule } from "expo-modules-core";

/**
 * Native module interface.
 */
interface ExpoDynalinksSdkNativeModule {
  configure(config: {
    clientAPIKey: string;
    baseURL?: string;
    logLevel?: string;
    allowSimulator?: boolean;
  }): Promise<void>;

  checkForDeferredDeepLink(): Promise<any>;

  resolveLink(url: string): Promise<any>;
}

export default requireNativeModule<ExpoDynalinksSdkNativeModule>(
  "ExpoDynalinksSdk",
);
