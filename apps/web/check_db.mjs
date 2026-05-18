import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const k = await p.$queryRawUnsafe("SELECT * FROM wp_player_knife WHERE steamid = '76561198374121144'");
console.log('KNIFE:', JSON.stringify(k));
const g = await p.$queryRawUnsafe("SELECT * FROM wp_player_gloves WHERE steamid = '76561198374121144'");
console.log('GLOVES:', JSON.stringify(g));
const s = await p.$queryRawUnsafe("SELECT weapon, weapon_defindex, weapon_paint_id, weapon_team FROM wp_player_skins WHERE steamid = '76561198374121144' ORDER BY weapon_team, weapon_defindex");
console.log('SKINS:', JSON.stringify(s));
await p.$disconnect();
