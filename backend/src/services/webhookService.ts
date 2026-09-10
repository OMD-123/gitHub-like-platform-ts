import { Server } from 'socket.io';
import axios from 'axios';

export class WebhookService {
  private io: Server;
  private webhooks: Map<string, Array<{ url: string; events: string[]; secret: string }>>;

  constructor(io: Server) {
    this.io = io;
    this.webhooks = new Map();
  }

  async addWebhook(repoId: string, url: string, events: string[] = ['push', 'pull_request'], secret: string = ''): Promise<void> {
    if (!this.webhooks.has(repoId)) {
      this.webhooks.set(repoId, []);
    }
    this.webhooks.get(repoId)!.push({ url, events, secret });
    console.log(`Webhook added for repo ${repoId}: ${url}`);
  }

  async removeWebhook(repoId: string, url: string): Promise<void> {
    if (this.webhooks.has(repoId)) {
      const updated = this.webhooks.get(repoId)!.filter(wh => wh.url !== url);
      if (updated.length === 0) {
        this.webhooks.delete(repoId);
      } else {
        this.webhooks.set(repoId, updated);
      }
    }
    console.log(`Webhook removed for repo ${repoId}: ${url}`);
  }

  async triggerWebhooks(repoId: string, event: string, payload: any): Promise<void> {
    if (!this.webhooks.has(repoId)) return;
    
    const hooks = this.webhooks.get(repoId)!;
    for (const hook of hooks) {
      if (hook.events.includes(event)) {
        try {
          // In a real implementation, we would sign the payload with the secret
          await axios.post(hook.url, payload, {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'GitPlatform-Webhook/1.0'
            }
          });
          console.log(`Webhook triggered: ${hook.url} for event ${event}`);
        } catch (error) {
          console.error(`Failed to trigger webhook ${hook.url}:`, error.message);
        }
      }
    }
  }
}

export default WebhookService;
