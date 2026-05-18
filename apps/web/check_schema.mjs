import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const prisma = new PrismaClient();
try {
  const skins = JSON.parse(readFileSync('C:/Users/yiaam/Desktop/Fena Website/apps/web/data/skins_en.json', 'utf-8'));
  const defindexMap = {};
  for (const s of skins) {
    if (s.weapon_name && s.weapon_defindex) {
      defindexMap[s.weapon_name] = s.weapon_defindex;
    }
  }
  
  const rows = await prisma.$queryRawUnsafe("SELECT id, weapon FROM wp_player_skins");
  for (const row of rows) {
    const weapon = row.weapon;
    const defindex = defindexMap[weapon] || 0;
    if (defindex > 0) {
      await prisma.$executeRawUnsafe("UPDATE wp_player_skins SET weapon_defindex = ? WHERE id = ?", defindex, row.id);
    }
  }
  console.log('OK: updated defindexes from weapon names');

  const updated = await prisma.$queryRawUnsafe("SELECT id, weapon, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed FROM wp_player_skins");
  console.log('VERIFIED:', JSON.stringify(updated, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2));

  console.log('DONE');
} catch(e) {
  console.error('ERROR:', e.message || e);
} finally {
  await prisma.$disconnect();
}
