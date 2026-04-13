import { Role, SwitchState } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mqttService } from "@/lib/services/mqtt.service";
import { realtimeEmitter } from "@/lib/services/realtime";

export async function toggleSwitch(params: {
  switchId: string;
  userId: string;
  role: Role;
  forcedState?: SwitchState;
}) {
  const sw = await prisma.switch.findUnique({
    where: { id: params.switchId },
    include: {
      device: {
        include: {
          room: true
        }
      }
    }
  });

  if (!sw) {
    throw new Error("Switch not found");
  }

  if (params.role === "GUEST") {
    throw new Error("Guests cannot modify switch state");
  }

  const state = params.forcedState ?? (sw.state === "ON" ? "OFF" : "ON");

  const updated = await prisma.switch.update({
    where: { id: sw.id },
    data: { state }
  });

  await prisma.deviceLog.create({
    data: {
      deviceId: sw.deviceId,
      message: `Switch ${sw.name} changed to ${state}`,
      metadata: { userId: params.userId, switchId: sw.id }
    }
  });

  const event = {
    switchId: updated.id,
    deviceId: sw.deviceId,
    roomId: sw.device.roomId,
    homeId: sw.device.room.homeId,
    state
  } as const;

  mqttService.publishSwitchState(event);
  realtimeEmitter.emit("switch-updated", event);

  return updated;
}

export async function turnOffAll(homeId: string, userId: string, role: Role) {
  if (role === "GUEST") {
    throw new Error("Guests cannot perform turn off all");
  }

  const switches = await prisma.switch.findMany({
    where: {
      device: {
        room: {
          homeId
        }
      },
      state: "ON"
    },
    include: {
      device: {
        include: {
          room: true
        }
      }
    }
  });

  await Promise.all(
    switches.map((sw) =>
      toggleSwitch({ switchId: sw.id, userId, role, forcedState: SwitchState.OFF })
    )
  );

  return { updated: switches.length };
}

export async function runNightAutomation(homeId: string) {
  const hour = new Date().getHours();
  if (hour < 22 && hour > 5) {
    return { skipped: true, reason: "Outside night schedule" };
  }

  const owner = await prisma.user.findFirst({ where: { homeId, role: "OWNER" } });
  if (!owner) {
    return { skipped: true, reason: "No owner in home" };
  }

  return turnOffAll(homeId, owner.id, owner.role);
}
