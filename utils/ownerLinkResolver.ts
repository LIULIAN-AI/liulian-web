interface OwnerLike {
  name?: string;
  url?: string;
  website?: string;
  link?: string;
}

const OWNER_NAME_TO_URL: Record<string, string> = {
  '眾安科技': 'https://zhongan.io/',
  '众安科技': 'https://zhongan.io/',
};

function normalizeUrl(url: string): string {
  if (!url) {
    return '';
  }

  const trimmedUrl = url.trim();
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

export function resolveOwnerLink(owner?: OwnerLike): string {
  if (!owner) {
    return '';
  }

  const inlineUrl = owner.url || owner.website || owner.link || '';
  const normalizedInlineUrl = normalizeUrl(inlineUrl);
  if (normalizedInlineUrl) {
    return normalizedInlineUrl;
  }

  const ownerName = owner.name?.trim() || '';
  if (!ownerName) {
    return '';
  }

  return OWNER_NAME_TO_URL[ownerName] || '';
}
