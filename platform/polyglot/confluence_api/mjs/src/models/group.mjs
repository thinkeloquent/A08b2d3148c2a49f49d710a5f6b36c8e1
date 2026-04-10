/**
 * @module models/group
 * @description Group domain schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Group resource representing a Confluence user group.
 */
export const GroupSchema = z.object({
  /** Name of the group (unique within the instance). */
  name: z.string().default(''),
  /** Entity type discriminator (always "group"). */
  type: z.string().default('group'),
});
