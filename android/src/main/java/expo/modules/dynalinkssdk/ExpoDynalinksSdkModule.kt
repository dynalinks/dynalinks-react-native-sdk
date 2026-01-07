package expo.modules.dynalinkssdk

import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.CodedException
import com.dynalinks.sdk.Dynalinks
import com.dynalinks.sdk.DeepLinkResult
import com.dynalinks.sdk.DynalinksError
import com.dynalinks.sdk.DynalinksLogLevel
import com.dynalinks.sdk.LinkData

class ExpoDynalinksSdkModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDynalinksSdk")

    AsyncFunction("configure") { config: Map<String, Any?> ->
      configure(config)
    }

    AsyncFunction("checkForDeferredDeepLink") {
      checkForDeferredDeepLink()
    }

    AsyncFunction("resolveLink") { url: String ->
      resolveLink(url)
    }
  }

  private suspend fun configure(config: Map<String, Any?>) {
    val context = appContext.reactContext ?: throw CodedException("Context not available")

    val clientAPIKey = (config["clientAPIKey"] as? String)?.takeIf { it.isNotBlank() }
      ?: throw CodedException("INVALID_API_KEY", "Missing or empty clientAPIKey", null)

    val logLevelString = config["logLevel"] as? String ?: "error"
    val allowSimulator = config["allowSimulator"] as? Boolean ?: false

    val logLevel = when (logLevelString) {
      "none" -> DynalinksLogLevel.NONE
      "error" -> DynalinksLogLevel.ERROR
      "warning" -> DynalinksLogLevel.WARNING
      "info" -> DynalinksLogLevel.INFO
      "debug" -> DynalinksLogLevel.DEBUG
      else -> DynalinksLogLevel.ERROR
    }

    try {
      // Only pass baseURL if provided - let native SDK use its default otherwise
      val baseURLString = (config["baseURL"] as? String)?.takeIf { it.isNotBlank() }

      if (baseURLString != null) {
        // Validate baseURL format if provided
        val baseUri = Uri.parse(baseURLString)
        if (baseUri.scheme.isNullOrEmpty() || baseUri.host.isNullOrEmpty()) {
          throw CodedException("INVALID_CONFIG", "Invalid baseURL format", null)
        }

        Dynalinks.configure(
          context = context,
          clientAPIKey = clientAPIKey,
          baseURL = baseURLString,
          logLevel = logLevel,
          allowEmulator = allowSimulator
        )
      } else {
        // Use native SDK's default baseURL
        Dynalinks.configure(
          context = context,
          clientAPIKey = clientAPIKey,
          logLevel = logLevel,
          allowEmulator = allowSimulator
        )
      }
    } catch (e: DynalinksError) {
      throw convertError(e)
    }
  }

  private suspend fun checkForDeferredDeepLink(): Map<String, Any?> {
    return try {
      val result = Dynalinks.checkForDeferredDeepLink()
      encodeResult(result, isDeferred = true)
    } catch (e: DynalinksError) {
      throw convertError(e)
    }
  }

  private suspend fun resolveLink(url: String): Map<String, Any?> {
    return try {
      val uri = Uri.parse(url)

      // Validate the parsed URI
      if (uri.scheme.isNullOrEmpty() || uri.host.isNullOrEmpty()) {
        throw CodedException("INVALID_URL", "URL must have a valid scheme and host", null)
      }

      val result = Dynalinks.handleAppLink(uri)
      encodeResult(result, isDeferred = false)
    } catch (e: CodedException) {
      throw e
    } catch (e: DynalinksError) {
      throw convertError(e)
    } catch (e: Exception) {
      throw CodedException("UNKNOWN", "Unexpected error: ${e.message}", e)
    }
  }

  private fun encodeResult(result: DeepLinkResult, isDeferred: Boolean): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>(
      "matched" to result.matched,
      "is_deferred" to isDeferred
    )

    result.confidence?.let {
      map["confidence"] = it.name.lowercase()
    }

    result.matchScore?.let {
      map["match_score"] = it
    }

    result.link?.let { link ->
      map["link"] = encodeLinkData(link)
    }

    return map
  }

  private fun encodeLinkData(linkData: LinkData): Map<String, Any?> {
    return mapOf(
      "id" to linkData.id,
      "name" to linkData.name,
      "path" to linkData.path,
      "shortened_path" to linkData.shortenedPath,
      "url" to linkData.url,
      "full_url" to linkData.fullUrl,
      "deep_link_value" to linkData.deepLinkValue,
      "android_fallback_url" to linkData.androidFallbackUrl,
      "ios_fallback_url" to linkData.iosFallbackUrl,
      "enable_forced_redirect" to linkData.enableForcedRedirect,
      "social_title" to linkData.socialTitle,
      "social_description" to linkData.socialDescription,
      "social_image_url" to linkData.socialImageUrl,
      "clicks" to linkData.clicks
    ).filterValues { it != null }
  }

  private fun convertError(error: DynalinksError): CodedException {
    val code = when (error) {
      is DynalinksError.NotConfigured -> "NOT_CONFIGURED"
      is DynalinksError.InvalidAPIKey -> "INVALID_API_KEY"
      is DynalinksError.Emulator -> "SIMULATOR"
      is DynalinksError.InvalidIntent -> "INVALID_URL"
      is DynalinksError.NetworkError -> "NETWORK_ERROR"
      is DynalinksError.InvalidResponse -> "INVALID_RESPONSE"
      is DynalinksError.ServerError -> "SERVER_ERROR"
      is DynalinksError.NoMatch -> "NO_MATCH"
      is DynalinksError.InstallReferrerUnavailable -> "INSTALL_REFERRER_UNAVAILABLE"
      is DynalinksError.InstallReferrerTimeout -> "INSTALL_REFERRER_TIMEOUT"
    }
    return CodedException(code, error.message ?: "Unknown error", null)
  }
}
