import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const idx = await p.$queryRawUnsafe(`SHOW INDEX FROM wp_player_music`);
console.log('wp_player_music indexes:', idx);
await p.$disconnect();
