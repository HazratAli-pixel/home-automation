import { EventEmitter } from "node:events";

export type SwitchUpdatedEvent = {
  switchId: string;
  deviceId: string;
  roomId: string;
  homeId: string;
  state: "ON" | "OFF";
};

export const realtimeEmitter = new EventEmitter();
