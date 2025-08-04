import { Injectable } from '@nestjs/common';

export interface SessionData {
  address: string;
  personalMessage: string;
  expiresAt: number;
  signature?: string;
}

/**
 * Simple in-memory session store for SEAL SessionKeys
 * In production, this should be replaced with Redis or another persistent store
 */
@Injectable()
export class SessionStore {
  private sessions = new Map<string, SessionData>();

  /**
   * Store session data for an address
   */
  set(address: string, data: SessionData): void {
    this.sessions.set(address, data);
  }

  /**
   * Get session data for an address
   */
  get(address: string): SessionData | undefined {
    const data = this.sessions.get(address);
    if (data && data.expiresAt < Date.now()) {
      // Session expired, remove it
      this.sessions.delete(address);
      return undefined;
    }
    return data;
  }

  /**
   * Check if a session exists for an address
   */
  has(address: string): boolean {
    return this.get(address) !== undefined;
  }

  /**
   * Delete session data for an address
   */
  delete(address: string): void {
    this.sessions.delete(address);
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): void {
    const now = Date.now();
    for (const [address, data] of this.sessions.entries()) {
      if (data.expiresAt < now) {
        this.sessions.delete(address);
      }
    }
  }
}