export function normalizeExternalUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) {
    return '';
  }

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    return '';
  }

  const withProtocol = /^(https?:)?\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return '';
  }
}
