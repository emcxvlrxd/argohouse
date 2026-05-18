import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const r = await p.$queryRawUnsafe("SELECT * FROM wp_player_music WHERE steamid = '76561198374121144'");
console.log('music:', JSON.stringify(r));
const a = await p.$queryRawUnsafe("SELECT * FROM wp_player_agents WHERE steamid = '76561198374121144'");
console.log('agents:', JSON.stringify(a));
await p.$disconnect();
