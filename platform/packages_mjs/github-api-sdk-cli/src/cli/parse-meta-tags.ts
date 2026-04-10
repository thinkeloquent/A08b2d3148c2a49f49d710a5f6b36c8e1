/**
 * Parse meta tag key=value pairs into an object.
 */
export function parseMetaTags(tags: string[] = []): Record<string, string> {
  const metaTags: Record<string, string> = {};
  tags.forEach((tag) => {
    const [key, value] = tag.split("=");
    if (key && value) {
      metaTags[key] = value;
    }
  });
  return metaTags;
}
