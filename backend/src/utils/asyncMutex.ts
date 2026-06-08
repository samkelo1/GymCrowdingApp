type Unlock = () => void;

export class AsyncMutex {
  private queues = new Map<string, (() => void)[]>();

  async runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
    await this.lock(key);
    try {
      return await fn();
    } finally {
      this.unlock(key);
    }
  }

  private lock(key: string): Promise<void> {
    return new Promise((resolve) => {
      const q = this.queues.get(key) || [];
      q.push(resolve);
      this.queues.set(key, q);
      if (q.length === 1) resolve();
    });
  }

  private unlock(key: string) {
    const q = this.queues.get(key);
    if (!q) return;
    q.shift();
    if (q.length === 0) this.queues.delete(key);
    else {
      const next = q[0];
      next();
    }
  }
}
