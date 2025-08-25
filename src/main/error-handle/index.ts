const DEVELOPMENT_MODE = true;

function logInfo(message: string, source: string = 'Default'): string {
  if (DEVELOPMENT_MODE) {
    console.log(`[INFO] [${source}] ${message}`);
  }
  return `[INFO] [${source}] ${message}`;
}

function logError(message: string, source: string = 'Default'): string {
  if (DEVELOPMENT_MODE) {
    console.error(`[ERROR] [${source}] ${message}`);
  }
  return `[ERROR] [${source}] ${message}`;
}

// Status codes for API responses.
// Extend or add new codes as needed.
export enum StatusCode {
  OK = 200, // Success
  InvalidModelSetting = 400, // Model setting is invalid
  InvalidKey = 401, // Key is not valid
  ModelNotFound = 404, // Model is not found
  NoModelResponse = 422, // Model did not respond (Unprocessable Entity)
  InternetError = 503, // Internet/network issue
  LMStudioNotWorking = 550, // LM Studio is not working
  InternalError = 500 // Generic internal error
  // Extend here for more codes
}

// Standard reply interface for backend-frontend communication
export interface Reply {
  statusCode: number; // e.g. 200 for success, 400+ for errors
  message: string;
  data?: any;
  error?: any;
}

export { logInfo, logError };
