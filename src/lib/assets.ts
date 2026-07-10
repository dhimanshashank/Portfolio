const rawAssetBase = process.env.NEXT_PUBLIC_ASSET_URL?.trim() ?? "";

export const ASSET_URL = rawAssetBase.replace(/\/+$/, "");

export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  const normalized = path.startsWith("/")
    ? path
    : `/${path.replace(/^\.?\//, "")}`;

  return ASSET_URL ? `${ASSET_URL}${normalized}` : normalized;
}
