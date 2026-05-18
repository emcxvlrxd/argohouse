import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Just add unique key on (steamid, weapon_team) - plugin's ON DUPLICATE KEY UPDATE needs this
try {
  await prisma.$executeRawUnsafe(`ALTER TABLE wp_player_pins ADD UNIQUE KEY unique_steamid_weapon_team (steamid, weapon_team)`);
  console.log('Added UNIQUE KEY');
} catch (e) {
  console.log('Note:', e.message.includes('Duplicate') ? 'UNIQUE KEY already exists or has duplicate data' : e.message);
}

// Clean up duplicate rows - keep only latest for each (steamid, weapon_team)
await prisma.$executeRawUnsafe(`DELETE t1 FROM wp_player_pins t1 INNER JOIN wp_player_pins t2 WHERE t1.id > t2.id AND t1.steamid = t2.steamid AND t1.weapon_team = t2.weapon_team`);
console.log('Cleaned duplicates');

// Verify
const cols = await prisma.$queryRawUnsafe(`SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_NAME = 'wp_player_pins' ORDER BY ORDINAL_POSITION`);
console.log('Columns:', cols.map(c=>`${c.COLUMN_NAME}(${c.COLUMN_TYPE}) KEY=${c.COLUMN_KEY}`).join(', '));

const data = await prisma.$queryRawUnsafe(`SELECT * FROM wp_player_pins WHERE steamid = '76561198374121144'`);
console.log('Data:', JSON.stringify(data));

await prisma.$disconnect();
