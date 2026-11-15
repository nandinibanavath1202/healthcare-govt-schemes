interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale rate limits every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    });
  }, 300000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInMs: Math.max(0, entry.resetAt - now),
  };
}

/**
 * Detects if a message appears to contain sensitive personal identifiers like Aadhaar numbers
 * (12 consecutive digits or 4-4-4 groupings) or bank account details.
 */
export function checkSensitiveInfo(message: string): {
  hasSensitiveInfo: boolean;
  warningMessage?: string;
} {
  // 12 digit Aadhaar pattern (e.g. 1234 5678 9012 or 1234-5678-9012 or 123456789012)
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/;
  // Credit / Debit card pattern
  const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/;

  if (aadhaarRegex.test(message) || cardRegex.test(message)) {
    return {
      hasSensitiveInfo: true,
      warningMessage:
        'Privacy Alert: Please do NOT share your 12-digit Aadhaar number, bank account details, or debit card numbers in the chat. This public portal does not require personal credentials to explain scheme guidelines.',
    };
  }

  return { hasSensitiveInfo: false };
}
