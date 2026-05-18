import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  await p.$executeRawUnsafe('ALTER TABLE wp_player_music ADD UNIQUE KEY unique_steamid_team (steamid, weapon_team)');
  console.log('UNIQUE KEY added');
} catch(e) {
  console.log('Note:', e.message.includes('Duplicate') ? 'already exists or has dupes' : e.message);
}
await p.$disconnect();
