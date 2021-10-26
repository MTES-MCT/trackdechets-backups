import { Writable } from "stream";
import { getBackupDownloadLink, listBackups, getDatabase } from "../scalingo";
import { download } from "../utils";

export default async function backup(app: string, writer: Writable) {
  const addon = await getDatabase(app);
  const backups = await listBackups(app, addon);
  if (!backups.length) {
    return;
  }
  const downloadLink = await getBackupDownloadLink(app, addon, backups[0]);
  return download(downloadLink, writer);
}
