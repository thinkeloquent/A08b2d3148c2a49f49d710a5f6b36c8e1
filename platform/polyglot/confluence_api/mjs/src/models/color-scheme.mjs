/**
 * @module models/color-scheme
 * @description Color scheme and theme schemas for the Confluence API.
 */
import { z } from 'zod';

/**
 * Color scheme model defining the primary UI colors for a Confluence
 * space or global theme.
 */
export const ColorSchemeModelSchema = z.object({
  /** Background color of the top navigation bar. */
  topBar: z.string().default(''),
  /** Background color of the selected item in the top bar menu. */
  topBarMenuSelectedBackground: z.string().default(''),
  /** Text color of the selected item in the top bar menu. */
  topBarMenuSelectedText: z.string().default(''),
  /** Text color of items in the top bar menu. */
  topBarMenuItemText: z.string().default(''),
  /** Base background color for header buttons. */
  headerButtonBaseBg: z.string().default(''),
  /** Base text color for header buttons. */
  headerButtonBaseText: z.string().default(''),
  /** Color used for heading text. */
  headingText: z.string().default(''),
  /** Color used for hyperlinks. */
  links: z.string().default(''),
  /** Color used for borders and dividers. */
  borderColor: z.string().default(''),
  /** Background color of the left-side navigation panel. */
  navBackground: z.string().default(''),
});

/**
 * Color scheme paired with its parent theme key.
 */
export const ColorSchemeThemeBasedModelSchema = z.object({
  /** Key identifying the parent theme (e.g. "default", "documentation"). */
  themeKey: z.string().default(''),
  /** Color scheme overrides for the specified theme. */
  colorScheme: ColorSchemeModelSchema.optional(),
});

/**
 * Type descriptor indicating whether a space uses a custom or inherited
 * color scheme.
 */
export const SpaceColorSchemeTypeModelSchema = z.object({
  /** Type of color scheme assignment (e.g. "custom", "theme"). */
  type: z.string().default(''),
});
