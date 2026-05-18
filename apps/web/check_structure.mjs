import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Show the actual table structure
  const cols = await prisma.$queryRawUnsafe("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_NAME = 'wp_player_skins' ORDER BY ORDINAL_POSITION");
  console.log('=== wp_player_skins CURRENT STRUCTURE ===');
  for (const c of cols) {
    console.log(`  ${c.COLUMN_NAME.padEnd(22)} ${String(c.COLUMN_TYPE).padEnd(18)} nullable=${c.IS_NULLABLE} default=${c.COLUMN_DEFAULT} key=${c.COLUMN_KEY}`);
  }

  // Show UNIQUE KEYS
  const keys = await prisma.$queryRawUnsafe("SHOW CREATE TABLE wp_player_skins");
  console.log('\n=== CREATE TABLE ===');
  console.log(keys[0]['Create Table']);
}
main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
