export class RateLimitError extends Error {
  override name = 'RateLimitError';
  resetTime: number | null;
  remaining: number;

  constructor(message: string, resetTime: number | null, remaining = 0) {
    super(message);
    this.resetTime = resetTime;
    this.remaining = remaining;
  }
}
