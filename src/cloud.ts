import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export interface CloudOptions {
  region?: string;
  functionName: string; // e.g., "aiten-robot-status"
}

export interface RobotStatusPayload<T = unknown> {
  topic: string;
  message: T | string;
  receivedAt: string; // ISO timestamp
  qos?: number;
  retain?: boolean;
}

export class Cloud {
  private client: LambdaClient;
  private functionName: string;

  constructor(opts: CloudOptions) {
    this.client = new LambdaClient({
      region: opts.region || process.env.AWS_REGION,
    });
    this.functionName = opts.functionName;
  }

  async publishStatus(payload: RobotStatusPayload): Promise<void> {
    const { message } = payload;
    const body = JSON.stringify(message);
    const cmd = new InvokeCommand({
      FunctionName: this.functionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(body),
    });
    await this.client.send(cmd);
  }
}
