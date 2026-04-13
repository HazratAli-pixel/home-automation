import mqtt, { MqttClient } from "mqtt";
import { prisma } from "@/lib/prisma";
import { realtimeEmitter, type SwitchUpdatedEvent } from "@/lib/services/realtime";

class MqttService {
  private client: MqttClient | null = null;
  private isConnecting = false;

  connect() {
    if (this.client || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.client = mqtt.connect(process.env.MQTT_BROKER_URL ?? "mqtt://localhost:1883", {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 2000,
      connectTimeout: 10_000
    });

    this.client.on("connect", () => {
      this.isConnecting = false;
      this.client?.subscribe("home/+/room/+/device/+/switch/+", { qos: 1 });
    });

    this.client.on("message", async (topic, payload) => {
      try {
        const incoming = JSON.parse(payload.toString()) as { state?: "ON" | "OFF" };
        if (!incoming.state) {
          return;
        }

        const ids = this.parseTopic(topic);
        if (!ids) {
          return;
        }

        await prisma.switch.update({
          where: { id: ids.switchId },
          data: { state: incoming.state }
        });

        const event: SwitchUpdatedEvent = {
          ...ids,
          state: incoming.state
        };
        realtimeEmitter.emit("switch-updated", event);
      } catch (error) {
        console.error("MQTT message handling error", error);
      }
    });

    this.client.on("error", (error) => {
      console.error("MQTT error", error);
    });
  }

  publishSwitchState(event: SwitchUpdatedEvent) {
    this.connect();
    const topic = `home/${event.homeId}/room/${event.roomId}/device/${event.deviceId}/switch/${event.switchId}`;
    this.client?.publish(topic, JSON.stringify({ state: event.state }), { qos: 1 });
  }

  private parseTopic(topic: string) {
    const matches = topic.match(/^home\/(.+)\/room\/(.+)\/device\/(.+)\/switch\/(.+)$/);
    if (!matches) {
      return null;
    }

    const [, homeId, roomId, deviceId, switchId] = matches;
    return { homeId, roomId, deviceId, switchId };
  }
}

export const mqttService = new MqttService();
