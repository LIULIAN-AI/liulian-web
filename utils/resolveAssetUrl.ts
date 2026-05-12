const KNOWN_ASSET_HOST_REWRITES: Record<string, string> = {
  // Current DB stores partner logos on a host that is often unreachable.
  // Rewrite to the public host that serves the same MinIO bucket paths.
  '124.193.170.132:9000': process.env.NEXT_PUBLIC_PUBLIC_ASSET_ORIGIN || 'http://47.83.183.119:9000',
};

function rewriteKnownAssetHost(urlValue: string): string {
  try {
    const parsedUrl = new URL(urlValue);
    const rewrittenOrigin = KNOWN_ASSET_HOST_REWRITES[parsedUrl.host];
    if (!rewrittenOrigin) {
      return urlValue;
    }

    const rewrittenUrl = new URL(parsedUrl.pathname + parsedUrl.search + parsedUrl.hash, rewrittenOrigin);
    return rewrittenUrl.toString();
  } catch {
    return urlValue;
  }
}

export function resolveAssetUrl(assetUrl: string | null | undefined, baseUrl: string): string {
  if (!assetUrl) {
    return '';
  }

  const normalizedAssetUrl = assetUrl.trim();
  if (!normalizedAssetUrl) {
    return '';
  }

  if (/^(https?:|data:|blob:)/i.test(normalizedAssetUrl)) {
    return rewriteKnownAssetHost(normalizedAssetUrl);
  }

  if (normalizedAssetUrl.startsWith('//')) {
    return rewriteKnownAssetHost(`https:${normalizedAssetUrl}`);
  }

  try {
    return rewriteKnownAssetHost(new URL(normalizedAssetUrl, baseUrl).toString());
  } catch {
    return normalizedAssetUrl;
  }
}
