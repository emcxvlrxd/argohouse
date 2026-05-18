import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Check indexes
  const indexes = await prisma.$queryRawUnsafe("SHOW INDEX FROM wp_player_skins");
  console.log('=== INDEXES ===');
  for (const idx of indexes) {
    console.log(`  ${idx.Key_name}: ${idx.Column_name} (${idx.Non_unique == 0 ? 'UNIQUE' : 'non-unique'}) seq=${idx.Seq_in_index}`);
  }

  // Check the actual row data for stickers and keychain
  const rows = await prisma.$queryRawUnsafe("SELECT id, weapon_defindex, weapon_keychain, weapon_sticker_0 FROM wp_player_skins WHERE steamid = '76561198374121144'");
  console.log('\n=== ROW DATA ===');
  for (const r of rows) {
    console.log(`  id=${r.id} def=${r.weapon_defindex} keychain="${r.weapon_keychain}" sticker0="${r.weapon_sticker_0}"`);
  }
}
main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
