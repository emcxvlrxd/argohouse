import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  await prisma.$executeRawUnsafe('ALTER TABLE wp_player_skins MODIFY COLUMN weapon_stattrak tinyint(1) NOT NULL DEFAULT 0');
  console.log('OK: weapon_stattrak changed to tinyint(1)');
} catch(e) {
  console.error('ERROR:', e.message || e);
} finally {
  await prisma.$disconnect();
}
