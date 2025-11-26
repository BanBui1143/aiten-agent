import { Broker } from "./broker";
import { Cloud } from "./cloud";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

const MQTT_URL = required("MQTT_URL", process.env.MQTT_URL);
const LAMBDA_FUNCTION_NAME =
  process.env.LAMBDA_FUNCTION_NAME || "aiten-robot-status";
const AWS_REGION = process.env.AWS_REGION; // optional: uses default chain if unset
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

async function main() {
  const cloud = new Cloud({
    region: AWS_REGION,
    functionName: "robot-service-dev-on-agent-robot-status",
  });
  const broker = new Broker({
    url: MQTT_URL,
    topic: "robot/+/+/+/state",
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  });

  broker.connect(async ({ topic, payload, qos, retain }) => {
    const receivedAt = new Date().toISOString();
    let message: unknown = payload.toString();
    console.log(`[broker] Got status at topic: ${topic} at ${receivedAt}`);
    try {
      // try parse JSON if possible
      message = JSON.parse(message as string);
    } catch {
      // keep as string
    }
    await cloud.publishStatus({ topic, message, receivedAt, qos, retain });
  });

  const shutdown = async () => {
    console.log("\nShutting down...");
    try {
      await broker.disconnect();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
