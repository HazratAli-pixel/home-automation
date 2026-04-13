"use client";

import { useEffect, useMemo, useState } from "react";

type SwitchDto = { id: string; name: string; state: "ON" | "OFF" };
type DeviceDto = { id: string; name: string; type: string; switches: SwitchDto[] };
type RoomDto = { id: string; name: string; devices: DeviceDto[] };

export function Dashboard({ rooms: initialRooms, homeId }: { rooms: RoomDto[]; homeId: string }) {
  const [rooms, setRooms] = useState(initialRooms);

  useEffect(() => {
    const es = new EventSource("/api/realtime");
    es.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { switchId: string; state: "ON" | "OFF" };
      setRooms((prev) =>
        prev.map((room) => ({
          ...room,
          devices: room.devices.map((device) => ({
            ...device,
            switches: device.switches.map((sw) =>
              sw.id === payload.switchId ? { ...sw, state: payload.state } : sw
            )
          }))
        }))
      );
    };
    return () => es.close();
  }, []);

  const totalOn = useMemo(
    () => rooms.flatMap((r) => r.devices).flatMap((d) => d.switches).filter((s) => s.state === "ON").length,
    [rooms]
  );

  async function toggle(switchId: string) {
    await fetch(`/api/switches/${switchId}/toggle`, { method: "POST" });
  }

  async function turnOffAll() {
    await fetch("/api/switches/off-all", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ homeId })
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Active switches: {totalOn}</h2>
        <button className="rounded bg-red-600 px-4 py-2 text-sm" onClick={turnOffAll}>
          Turn OFF ALL
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <section key={room.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="mb-4 text-xl font-semibold">{room.name}</h3>
            <div className="space-y-3">
              {room.devices.map((device) => (
                <div key={device.id} className="rounded border border-slate-800 p-3">
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs uppercase text-slate-400">{device.type}</p>
                  <div className="mt-3 space-y-2">
                    {device.switches.map((sw) => (
                      <button
                        key={sw.id}
                        onClick={() => toggle(sw.id)}
                        className={`w-full rounded px-3 py-2 text-left ${sw.state === "ON" ? "bg-emerald-600" : "bg-slate-700"}`}
                      >
                        {sw.name}: {sw.state}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
