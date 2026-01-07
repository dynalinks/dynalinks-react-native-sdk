/**
 * Base error class for all Dynalinks SDK errors.
 */
export class DynalinksError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DynalinksError';
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DynalinksError);
    }
  }
}

/**
 * SDK has not been configured.
 */
export class NotConfiguredError extends DynalinksError {
  constructor() {
    super('NOT_CONFIGURED', 'Dynalinks SDK has not been configured. Call Dynalinks.configure() first.');
    this.name = 'NotConfiguredError';
  }
}

/**
 * Invalid API key format.
 */
export class InvalidApiKeyError extends DynalinksError {
  constructor(message: string = 'Invalid API key format') {
    super('INVALID_API_KEY', message);
    this.name = 'InvalidApiKeyError';
  }
}

/**
 * Running on simulator/emulator without permission.
 */
export class SimulatorError extends DynalinksError {
  constructor() {
    super('SIMULATOR', 'Deferred deep linking is not available on simulator/emulator. Set allowSimulator: true in configuration for testing.');
    this.name = 'SimulatorError';
  }
}

/**
 * Network request failed.
 */
export class NetworkError extends DynalinksError {
  constructor(message: string = 'Network request failed') {
    super('NETWORK_ERROR', message);
    this.name = 'NetworkError';
  }
}

/**
 * Server returned an error.
 */
export class ServerError extends DynalinksError {
  constructor(message: string = 'Server error') {
    super('SERVER_ERROR', message);
    this.name = 'ServerError';
  }
}

/**
 * Invalid response from server.
 */
export class InvalidResponseError extends DynalinksError {
  constructor() {
    super('INVALID_RESPONSE', 'Received invalid response from server');
    this.name = 'InvalidResponseError';
  }
}

/**
 * No matching link found.
 */
export class NoMatchError extends DynalinksError {
  constructor() {
    super('NO_MATCH', 'No matching link found');
    this.name = 'NoMatchError';
  }
}

/**
 * Convert native error code to DynalinksError.
 */
export function fromNativeError(code: string, message: string): DynalinksError {
  switch (code) {
    case 'NOT_CONFIGURED':
      return new NotConfiguredError();
    case 'INVALID_API_KEY':
      return new InvalidApiKeyError(message);
    case 'SIMULATOR':
      return new SimulatorError();
    case 'NETWORK_ERROR':
      return new NetworkError(message);
    case 'SERVER_ERROR':
      return new ServerError(message);
    case 'INVALID_RESPONSE':
      return new InvalidResponseError();
    case 'NO_MATCH':
      return new NoMatchError();
    default:
      return new DynalinksError('UNKNOWN', message || 'Unknown error occurred');
  }
}
