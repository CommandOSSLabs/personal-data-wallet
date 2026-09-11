/**
 * Delay before a remember-job poll.
 *
 * `baseMs <= 0` means no wait (`pollIntervalMs: 0`).
 * Attempt 0 is immediate so the first GET is not delayed.
 */
export function pollingDelayMs(baseMs: number, attempt: number): number {
    if (baseMs <= 0) return 0;
    if (attempt === 0) return 0;
    const capped = Math.min(1500, Math.max(100, baseMs));
    const jitter = 0.75 + Math.random() * 0.5;
    return Math.floor(capped * jitter);
}
