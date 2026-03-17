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
  private messageCallback: ((message: OpenClawMessage) => void) | null = null;

  constructor(config: OpenClawConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.config.host}:${this.config.port}`;
      this.ws = new WebSocket(url);
      let handshakeComplete = false;

      this.ws.onopen = () => {
        console.log('WebSocket opened, sending handshake');

        const connectMessage = {
          type: 'connect',
          params: {
            auth: {
              token: this.config.token,
            },
            device: {
              id: 'clawmate-' + Math.random().toString(36).substr(2, 9),
            },
            role: 'client',
          },
        };
        this.ws?.send(JSON.stringify(connectMessage));
      };

      this.ws.onmessage = (event) => {
        if (!handshakeComplete) {
          try {
            const message = JSON.parse(event.data);
            console.log('Handshake response:', message.type);

            if (message.type === 'connected' || message.type === 'ready' || message.type === 'connect_ack') {
              handshakeComplete = true;
              this.reconnectAttempts = 0;
              console.log('Handshake complete');
              resolve();
            }
          } catch (e) {
            console.error('Handshake parse error:', e);
          }
        } else if (this.messageCallback) {
          const message = JSON.parse(event.data);
          this.messageCallback(message);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from OpenClaw Gateway');
        if (!handshakeComplete) {
          reject(new Error('Connection closed before handshake'));
        }
      };

      setTimeout(() => {
        if (!handshakeComplete) {
          reject(new Error('Handshake timeout'));
        }
      }, 10000);
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
    this.messageCallback = callback;
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
