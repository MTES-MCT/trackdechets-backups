import backup from "../backupers/metabase";
import temp from "temp";
import { readFileSync } from "fs";

// Automatically track and cleanup files at exit
temp.track();

test("metabase backup", async () => {
  const writer = temp.createWriteStream();
  await backup(writer);
  const buff = readFileSync(writer.path);
  expect(Buffer.byteLength(buff)).toBeGreaterThan(0);
}, 10000);
