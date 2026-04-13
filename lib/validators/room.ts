import { z } from "zod";

export const createRoomSchema = z.object({
  homeId: z.string().cuid(),
  name: z.string().min(2)
});
