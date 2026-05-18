import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
await p.$executeRawUnsafe("UPDATE wp_player_knife SET knife = 'weapon_bayonet' WHERE knife = 'weapon_knife_bayonet'");
console.log('Fixed knife name');
await p.$executeRawUnsafe("UPDATE wp_player_skins SET weapon = 'weapon_bayonet' WHERE weapon = 'weapon_knife_bayonet' AND weapon_defindex = 500");
console.log('Fixed skin weapon name for bayonet');
const r = await p.$queryRawUnsafe("SELECT * FROM wp_player_knife WHERE steamid = '76561198374121144'");
console.log(JSON.stringify(r));
await p.$disconnect();
