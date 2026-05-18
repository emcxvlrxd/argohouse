import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`ALTER TABLE wp_player_pins ADD UNIQUE KEY unique_steamid_weapon_team (steamid, weapon_team)`);
  console.log('UNIQUE KEY added successfully');
} catch (e) {
  console.log('Error:', e.message);
}

// Verify indexes
const idx = await prisma.$queryRawUnsafe(`SHOW INDEX FROM wp_player_pins`);
for (const i of idx) {
  console.log(`${i.Key_name}: ${i.Column_name} (${i.Non_unique == 0 ? 'UNIQUE' : 'INDEX'})`);
}

await prisma.$disconnect();
