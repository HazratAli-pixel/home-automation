import { z } from "zod";

export const createDeviceSchema = z.object({
  roomId: z.string().cuid(),
  name: z.string().min(2),
  type: z.string().min(2),
  switches: z.array(z.object({ name: z.string().min(1) })).min(1)
});
