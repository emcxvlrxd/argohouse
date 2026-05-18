import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rows = await prisma.$queryRawUnsafe("SELECT id, steamid, weapon, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed, weapon_team FROM wp_player_skins WHERE steamid = '76561198374121144'");
  console.log(JSON.stringify(rows, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2));
}
main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
