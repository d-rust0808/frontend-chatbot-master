export const platformIcons = {
  whatsapp: '/icons/whatsapp.png',
  facebook: '/icons/messager.png',
  messenger: '/icons/messager.png',
  instagram: '/icons/instagram.png',
  tiktok: '/icons/tiktok.png',
  zalo: '/icons/zalo.png',
  shopee: '/icons/shopee.png',
  lazada: '/icons/shopee.png', // fallback to shopee icon if lazada icon not available
} as const;

export type PlatformIconKey = keyof typeof platformIcons;

export function getPlatformIcon(platform: string): string {
  const normalizedPlatform = platform.toLowerCase();
  return platformIcons[normalizedPlatform as PlatformIconKey] || platformIcons.whatsapp;
}

