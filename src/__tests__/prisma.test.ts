import backup from "../backupers/prisma";
import temp from "temp";
import { readFileSync } from "fs";

// Automatically track and cleanup files at exit
temp.track();

const { SCALEWAY_DB_SANDBOX_ID, SCALEWAY_DB_PROD_ID } = process.env;

test("sandbox backup", async () => {
  const writer = temp.createWriteStream();
  await backup(SCALEWAY_DB_SANDBOX_ID, writer);
  const buff = readFileSync(writer.path);
  expect(Buffer.byteLength(buff)).toBeGreaterThan(0);
}, 10000);

test("prod backup", async () => {
  const writer = temp.createWriteStream();
  await backup(SCALEWAY_DB_PROD_ID, writer);
  const buff = readFileSync(writer.path);
  expect(Buffer.byteLength(buff)).toBeGreaterThan(0);
}, 10000);
