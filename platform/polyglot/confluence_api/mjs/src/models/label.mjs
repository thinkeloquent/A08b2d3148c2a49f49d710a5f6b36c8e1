/**
 * @module models/label
 * @description Label domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Label resource representing a tag applied to content or spaces.
 */
export const LabelSchema = z.object({
  /** Label namespace prefix (e.g. "global", "my", "team"). */
  prefix: z.string().default(''),
  /** Name of the label (the tag text itself). */
  name: z.string().default(''),
  /** Numeric identifier for the label (string representation). */
  id: z.string().optional(),
  /** Full qualified label string (prefix:name). */
  label: z.string().optional(),
});
