import { z } from "zod";

export const createHomeSchema = z.object({
  name: z.string().min(2)
});
