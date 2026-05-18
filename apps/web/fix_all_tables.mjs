import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function alter(sql) {
  try { await prisma.$executeRawUnsafe(sql); console.log('OK:', sql.slice(0, 80)); }
  catch(e) { console.log('SKIP:', e.message?.slice(0, 80)); }
}
async function main() {
  // 1. Drop the UNIQUE KEY we created (wrong columns)
  await alter("ALTER TABLE wp_player_skins DROP INDEX uk_steamid_weapon_team");

  // 2. Add the CORRECT UNIQUE KEY like the plugin expects: (steamid, weapon_team, weapon_defindex)
  await alter("ALTER TABLE wp_player_skins ADD UNIQUE KEY uk_player_skin (steamid, weapon_team, weapon_defindex)");

  // 3. Update sticker defaults to match what plugin expects
  await alter("ALTER TABLE wp_player_skins ALTER weapon_keychain SET DEFAULT '0;0;0;0;0'");
  await alter("ALTER TABLE wp_player_skins ALTER weapon_sticker_0 SET DEFAULT '0;0;0;0;0;0;0'");
  await alter("ALTER TABLE wp_player_skins ALTER weapon_sticker_1 SET DEFAULT '0;0;0;0;0;0;0'");
  await alter("ALTER TABLE wp_player_skins ALTER weapon_sticker_2 SET DEFAULT '0;0;0;0;0;0;0'");
  await alter("ALTER TABLE wp_player_skins ALTER weapon_sticker_3 SET DEFAULT '0;0;0;0;0;0;0'");
  await alter("ALTER TABLE wp_player_skins ALTER weapon_sticker_4 SET DEFAULT '0;0;0;0;0;0;0'");

  // 4. Update existing empty stickers/keychain to proper defaults
  await alter("UPDATE wp_player_skins SET weapon_keychain = '0;0;0;0;0' WHERE weapon_keychain = ''");
  await alter("UPDATE wp_player_skins SET weapon_sticker_0 = '0;0;0;0;0;0;0' WHERE weapon_sticker_0 = ''");
  await alter("UPDATE wp_player_skins SET weapon_sticker_1 = '0;0;0;0;0;0;0' WHERE weapon_sticker_1 = ''");
  await alter("UPDATE wp_player_skins SET weapon_sticker_2 = '0;0;0;0;0;0;0' WHERE weapon_sticker_2 = ''");
  await alter("UPDATE wp_player_skins SET weapon_sticker_3 = '0;0;0;0;0;0;0' WHERE weapon_sticker_3 = ''");
  await alter("UPDATE wp_player_skins SET weapon_sticker_4 = '0;0;0;0;0;0;0' WHERE weapon_sticker_4 = ''");
  await alter("UPDATE wp_player_skins SET weapon_nametag = NULL WHERE weapon_nametag = ''");

  // 5. Add CT rows (weapon_team = 3) for each skin - plugin expects BOTH T and CT rows!
  const rows = await prisma.$queryRawUnsafe("SELECT * FROM wp_player_skins WHERE steamid = '76561198374121144' AND weapon_team = 2");
  for (const row of rows) {
    await prisma.$executeRawUnsafe(
      "INSERT IGNORE INTO wp_player_skins (steamid, weapon, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed, weapon_team, paint, wear, seed, stattrak, weapon_nametag, weapon_stattrak, weapon_stattrak_count, weapon_keychain, weapon_sticker_0, weapon_sticker_1, weapon_sticker_2, weapon_sticker_3, weapon_sticker_4) VALUES (?, ?, ?, ?, ?, ?, 3, ?, ?, ?, 0, NULL, 0, 0, '0;0;0;0;0', '0;0;0;0;0;0;0', '0;0;0;0;0;0;0', '0;0;0;0;0;0;0', '0;0;0;0;0;0;0', '0;0;0;0;0;0;0')",
      row.steamid, row.weapon, row.weapon_defindex, row.weapon_paint_id, row.weapon_wear, row.weapon_seed,
      row.paint, row.wear, row.seed
    );
    console.log('OK: added CT row for', row.weapon);
  }

  // 6. Add UNIQUE KEY to wp_player_knife (missing!)
  await alter("ALTER TABLE wp_player_knife ADD UNIQUE KEY uk_knife (steamid, weapon_team)");

  // 7. Also add rows for knife with weapon_team = 3 (CT)
  const knifeRows = await prisma.$queryRawUnsafe("SELECT * FROM wp_player_knife WHERE steamid = '76561198374121144' AND weapon_team = 2");
  for (const row of knifeRows) {
    await prisma.$executeRawUnsafe(
      "INSERT IGNORE INTO wp_player_knife (steamid, knife, weapon_team, paint, wear, seed, stattrak) VALUES (?, ?, 3, ?, ?, ?, 0)",
      row.steamid, row.knife, row.paint, row.wear, row.seed
    );
    console.log('OK: added CT knife row for', row.knife);
  }

  // 8. Clean up duplicate pins (we had 2 rows with id 2 and 3 - keep only one per team)
  await alter("DELETE FROM wp_player_pins WHERE steamid = '76561198374121144' AND id IN (2,3)");
  // Re-insert proper pin row with column 'id' as the pin value (not auto-increment)
  await alter("INSERT IGNORE INTO wp_player_pins (steamid, weapon_team, id) VALUES ('76561198374121144', 2, 0)");
  await alter("INSERT IGNORE INTO wp_player_pins (steamid, weapon_team, id) VALUES ('76561198374121144', 3, 0)");

  console.log('\nALL FIXES APPLIED');

  // Verify
  const final = await prisma.$queryRawUnsafe("SELECT weapon, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed, weapon_team, weapon_keychain, weapon_sticker_0 FROM wp_player_skins WHERE steamid = '76561198374121144' ORDER BY weapon_team, weapon_defindex");
  console.log('FINAL DATA:', JSON.stringify(final, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2));
}
main().catch(e => console.error('ERROR:', e.message || e)).finally(() => prisma.$disconnect());
