/**
 * OpenClaw WebSocket Client
 * 连接到 OpenClaw Gateway (默认端口 18789)
 */

export interface OpenClawConfig {
  host: string;
  port: number;
  token: string;
}

export interface OpenClawMessage {
  type: string;
  content: string;
  timestamp: number;
}

export class OpenClawClient {
  private ws: WebSocket | null = null;
  private config: OpenClawConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: OpenClawConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.config.host}:${this.config.port}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('Connected to OpenClaw Gateway');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from OpenClaw Gateway');
        this.handleReconnect();
      };
    });
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to OpenClaw Gateway');
    }

    const message: OpenClawMessage = {
      type: 'chat',
      content,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  onMessage(callback: (message: OpenClawMessage) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        callback(message);
      };
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }
}
