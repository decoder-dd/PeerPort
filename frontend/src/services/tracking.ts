// Observability: logging + error tracking abstraction

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
}

const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER = 500;

function createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: Date.now(),
  };
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    const entry = createLogEntry('info', message, context);
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
    console.log(`[PeerPort] ${message}`, context ?? '');
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const entry = createLogEntry('warn', message, context);
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
    console.warn(`[PeerPort] ${message}`, context ?? '');
  },

  error: (message: string, context?: Record<string, unknown>) => {
    const entry = createLogEntry('error', message, context);
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
    console.error(`[PeerPort] ${message}`, context ?? '');

    // Error tracking abstraction: send to external service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      trackError(message, context);
    }
  },

  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      const entry = createLogEntry('debug', message, context);
      logBuffer.push(entry);
      if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
      console.debug(`[PeerPort] ${message}`, context ?? '');
    }
  },

  getRecentLogs: (limit = 50): LogEntry[] => {
    return logBuffer.slice(-limit);
  },
};

// Error tracking abstraction - replace with Sentry, Datadog, etc. in production
function trackError(message: string, context?: Record<string, unknown>) {
  // Placeholder: integrate Sentry.captureException or similar
  logger.debug('[ErrorTracker] Would report to external service:', { message, context });
}

// Transaction monitoring
export function trackTransactionEvent(
  txHash: string,
  event: 'submitted' | 'confirmed' | 'failed',
  metadata?: Record<string, unknown>
) {
  logger.info(`Transaction ${event}: ${txHash}`, metadata);
}

// Contract event monitoring
export function trackContractEvent(
  contractId: string,
  eventType: string,
  data?: Record<string, unknown>
) {
  logger.info(`Contract event [${eventType}] on ${contractId.slice(0, 8)}...`, data);
}
