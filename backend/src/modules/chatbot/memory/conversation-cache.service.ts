import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatTurn {
  role: 'human' | 'ai';
  content: string;
}

const DEFAULT_TTL_SECONDS = 1800;
const MAX_TURNS = 12;

@Injectable()
export class ConversationCacheService {
  private readonly store = new Map<
    string,
    { turns: ChatTurn[]; expiresAt: number }
  >();
  private readonly ttlMs: number;

  constructor(config: ConfigService) {
    this.ttlMs =
      Number(
        config.get<string>('CHATBOT_MEMORY_TTL_SECONDS') ?? DEFAULT_TTL_SECONDS,
      ) * 1000;
  }

  get(userId: string): ChatTurn[] | null {
    const entry = this.store.get(userId);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(userId);
      return null;
    }
    return entry.turns;
  }

  set(userId: string, turns: ChatTurn[]): void {
    this.store.set(userId, {
      turns: turns.slice(-MAX_TURNS),
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}
