import { realtimeEmitter } from "@/lib/services/realtime";

export async function GET() {
  let listener: ((data: unknown) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      listener = (data: unknown) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      realtimeEmitter.on("switch-updated", listener);
      controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
    },
    cancel() {
      if (listener) {
        realtimeEmitter.off("switch-updated", listener);
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache"
    }
  });
}
