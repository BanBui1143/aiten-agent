import mqtt, { MqttClient } from 'mqtt';

export interface BrokerOptions {
    url: string; // e.g., mqtt://localhost:1883
    topic: string; // e.g., robot/status/#
    username?: string;
    password?: string;
}

export type MessageHandler = (args: {
    topic: string;
    payload: Buffer;
    qos?: number;
    retain?: boolean;
}) => void | Promise<void>;

export class Broker {
    private client: MqttClient | null = null;
    private opts: BrokerOptions;

    constructor(opts: BrokerOptions) {
        this.opts = opts;
    }

    connect(onMessage: MessageHandler): void {
        const { url, username, password, topic } = this.opts;
        this.client = mqtt.connect(url, {
            username,
            password,
            reconnectPeriod: 2000,
            clean: true,
        });

        this.client.on('connect', () => {
            console.log(`[broker] connected ${url}`);
            this.client?.subscribe(topic, (err) => {
                if (err) console.error('[broker] subscribe error', err);
                else console.log(`[broker] subscribed '${topic}'`);
            });
        });

        this.client.on('message', async (t, payload, packet) => {
            try {
                await onMessage({ topic: t, payload, qos: packet.qos, retain: packet.retain });
            } catch (e) {
                console.error('[broker] message handler error', e);
            }
        });

        this.client.on('reconnect', () => console.log('[broker] reconnecting...'));
        this.client.on('close', () => console.log('[broker] connection closed'));
        this.client.on('error', (e) => console.error('[broker] error', e));
    }

    async disconnect(): Promise<void> {
        if (!this.client) return;
        await new Promise<void>((resolve, reject) =>
            this.client!.end(false, {}, (err?: Error) => {
                if (err) reject(err);
                else resolve();
            })
        );
        this.client = null;
    }
}
