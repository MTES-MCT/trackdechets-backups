import axios from "axios";
import fs from "fs";
import { Writable } from "stream";
import path from "path";

/**
 * Get the remote file and pipe the content to disk
 */
export async function download(downloadUrl: string, writer: Writable) {
  const downloadResponse = await axios.get(downloadUrl, {
    responseType: "stream"
  });
  downloadResponse.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Creates directory if it does not exist
 */
export function createDirIfNotExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

type RotateOpts = {
  maxFiles: number;
};

/**
 * Rotates backups files
 */
export function rotate(dirPath: string, { maxFiles }: RotateOpts) {
  const files = fs.readdirSync(dirPath);
  const sorted = files.sort().reverse();
  const lastN = sorted.slice(0, maxFiles);
  sorted
    .filter((filename) => !lastN.includes(filename))
    .forEach((oldFile) => {
      fs.unlinkSync(path.join(dirPath, path.join(oldFile)));
    });
}

export function todayStr() {
  const date = new Date();
  return date.toISOString();
}
