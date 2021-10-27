// import backup from "../backupers/prisma";
import temp from "temp";
import { readFileSync } from "fs";
import backup from "../backupers/prisma";

// Automatically track and cleanup files at exit
temp.track();

const { SCALINGO_PRODUCTION_APP, SCALINGO_SANDBOX_APP } = process.env;

test("sandbox backup", async () => {
  const writer = temp.createWriteStream();
  await backup(SCALINGO_SANDBOX_APP, writer);
  const buff = readFileSync(writer.path);
  expect(Buffer.byteLength(buff)).toBeGreaterThan(0);
}, 50000);

test("prod backup", async () => {
  const writer = temp.createWriteStream();
  await backup(SCALINGO_PRODUCTION_APP, writer);
  const buff = readFileSync(writer.path);
  expect(Buffer.byteLength(buff)).toBeGreaterThan(0);
}, 10000);
