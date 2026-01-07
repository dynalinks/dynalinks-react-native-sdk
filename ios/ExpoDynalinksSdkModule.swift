import ExpoModulesCore
import DynalinksSDK

public class ExpoDynalinksSdkModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoDynalinksSdk")

        AsyncFunction("configure") { (config: [String: Any]) throws in
            try await self.configure(config: config)
        }

        AsyncFunction("checkForDeferredDeepLink") { () -> [String: Any] in
            return try await self.checkForDeferredDeepLink()
        }

        AsyncFunction("resolveLink") { (url: String) -> [String: Any] in
            return try await self.resolveLink(url: url)
        }
    }

    private func configure(config: [String: Any]) async throws {
        guard let clientAPIKeyRaw = config["clientAPIKey"] as? String else {
            throw Exception(name: "INVALID_API_KEY", description: "Missing clientAPIKey in configuration")
        }

        let clientAPIKey = clientAPIKeyRaw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clientAPIKey.isEmpty else {
            throw Exception(name: "INVALID_API_KEY", description: "Invalid clientAPIKey in configuration: API key must be a non-empty string")
        }

        let logLevelString = config["logLevel"] as? String ?? "error"
        let allowSimulator = config["allowSimulator"] as? Bool ?? false

        let logLevel: DynalinksLogLevel
        switch logLevelString {
        case "none": logLevel = .none
        case "error": logLevel = .error
        case "warning": logLevel = .warning
        case "info": logLevel = .info
        case "debug": logLevel = .debug
        default: logLevel = .error
        }

        do {
            // Build configuration - only pass baseURL if provided
            if let baseURLString = (config["baseURL"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
               !baseURLString.isEmpty {
                guard let baseURL = URL(string: baseURLString) else {
                    throw Exception(name: "INVALID_CONFIG", description: "Invalid baseURL in configuration")
                }
                try Dynalinks.configure(
                    clientAPIKey: clientAPIKey,
                    baseURL: baseURL,
                    logLevel: logLevel,
                    allowSimulator: allowSimulator
                )
            } else {
                // Use native SDK's default baseURL
                try Dynalinks.configure(
                    clientAPIKey: clientAPIKey,
                    logLevel: logLevel,
                    allowSimulator: allowSimulator
                )
            }
        } catch let error as DynalinksError {
            throw convertError(error)
        } catch {
            throw Exception(name: "UNKNOWN", description: "Unexpected error: \(error.localizedDescription)")
        }
    }

    private func checkForDeferredDeepLink() async throws -> [String: Any] {
        do {
            let result = try await Dynalinks.checkForDeferredDeepLink()
            return encodeResult(result, isDeferred: true)
        } catch let error as DynalinksError {
            throw convertError(error)
        } catch {
            throw Exception(name: "UNKNOWN", description: "Unexpected error: \(error.localizedDescription)")
        }
    }

    private func resolveLink(url: String) async throws -> [String: Any] {
        guard let urlObj = URL(string: url) else {
            throw Exception(name: "INVALID_URL", description: "Invalid URL format")
        }

        do {
            let result = try await Dynalinks.handleUniversalLink(url: urlObj)
            return encodeResult(result, isDeferred: false)
        } catch let error as DynalinksError {
            throw convertError(error)
        } catch {
            throw Exception(name: "UNKNOWN", description: "Unexpected error: \(error.localizedDescription)")
        }
    }

    private func encodeResult(_ result: DeepLinkResult, isDeferred: Bool) -> [String: Any] {
        var dict: [String: Any] = [
            "matched": result.matched,
            "is_deferred": isDeferred,
        ]

        if let confidence = result.confidence {
            dict["confidence"] = confidence.rawValue
        }

        if let matchScore = result.matchScore {
            dict["match_score"] = matchScore
        }

        if let link = result.link {
            dict["link"] = encodeLinkData(link)
        }

        return dict
    }

    private func encodeLinkData(_ link: DeepLinkResult.LinkData) -> [String: Any?] {
        return [
            "id": link.id,
            "name": link.name,
            "path": link.path,
            "shortened_path": link.shortenedPath,
            "url": link.url?.absoluteString,
            "full_url": link.fullURL?.absoluteString,
            "deep_link_value": link.deepLinkValue,
            "ios_deferred_deep_linking_enabled": link.iosDeferredDeepLinkingEnabled,
            "ios_fallback_url": link.iosFallbackURL?.absoluteString,
            "android_fallback_url": link.androidFallbackURL?.absoluteString,
            "enable_forced_redirect": link.enableForcedRedirect,
            "social_title": link.socialTitle,
            "social_description": link.socialDescription,
            "social_image_url": link.socialImageURL?.absoluteString,
            "clicks": link.clicks,
        ]
    }

    private func convertError(_ error: DynalinksError) -> Exception {
        let code: String
        let message: String

        switch error {
        case .notConfigured:
            code = "NOT_CONFIGURED"
            message = error.errorDescription ?? "SDK not configured"
        case .invalidAPIKey(let msg):
            code = "INVALID_API_KEY"
            message = msg
        case .simulator:
            code = "SIMULATOR"
            message = error.errorDescription ?? "Not available on simulator"
        case .networkError:
            code = "NETWORK_ERROR"
            message = error.errorDescription ?? "Network error"
        case .invalidResponse:
            code = "INVALID_RESPONSE"
            message = error.errorDescription ?? "Invalid response"
        case .serverError(let statusCode, let msg):
            code = "SERVER_ERROR"
            message = msg ?? "Server error: \(statusCode)"
        case .noMatch:
            code = "NO_MATCH"
            message = error.errorDescription ?? "No match"
        }

        return Exception(name: code, description: message)
    }
}
