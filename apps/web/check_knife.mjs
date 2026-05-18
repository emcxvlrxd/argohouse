import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const k = await p.$queryRawUnsafe("SELECT * FROM wp_player_knife WHERE steamid = '76561198374121144'");
console.log('KNIFE:', JSON.stringify(k));
const s = await p.$queryRawUnsafe("SELECT weapon, weapon_defindex, weapon_paint_id, weapon_team FROM wp_player_skins WHERE steamid = '76561198374121144' AND weapon_defindex >= 500");
console.log('KNIFE IN SKINS:', JSON.stringify(s));
await p.$disconnect();
