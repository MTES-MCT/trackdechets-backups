import { Writable } from "stream";
import { getBackupDownloadLink, listBackups, getDatabase } from "../scalingo";
import { download } from "../utils";

export default async function backup(app: string, writer: Writable) {
  const addon = await getDatabase(app);
  const backups = await listBackups(app, addon);
  if (!backups.length) {
    console.log(`No backup found for ${app}`)
    return;
  }
  console.log(`Backup found for ${app}`)
  const downloadLink = await getBackupDownloadLink(app, addon, backups[0]);
  console.log(`DownloadLink generated for ${app}`)
  return download(downloadLink, writer);
}
