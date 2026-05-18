import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tables = ['wp_player_skins', 'wp_player_knife', 'wp_player_gloves', 'wp_player_agents', 'wp_player_music', 'wp_player_pins'];
  for (const table of tables) {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION`
    );
    console.log(`\n=== ${table} ===`);
    for (const c of cols) {
      console.log(`  ${String(c.COLUMN_NAME).padEnd(22)} ${String(c.COLUMN_TYPE).padEnd(16)} nullable=${c.IS_NULLABLE} default=${c.COLUMN_DEFAULT}`);
    }
  }

  // Check actual data for all tables
  console.log('\n\n=== DATA ===');
  const tables2 = ['wp_player_skins', 'wp_player_knife', 'wp_player_gloves', 'wp_player_agents', 'wp_player_music', 'wp_player_pins'];
  for (const table of tables2) {
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM ${table} WHERE steamid = '76561198374121144'`);
    console.log(`\n${table}:`);
    for (const r of rows) {
      console.log(`  ${JSON.stringify(r)}`);
    }
  }
}
main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
