import axios from "axios";
import { Writable } from "stream";

/**
 * Get the remote file and pipe the content to writer
 */
export async function download(downloadUrl: string, writer: Writable) {
  const downloadResponse = await axios.get(downloadUrl, {
    responseType: "stream"
  });
  downloadResponse.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      return resolve(null);
    });
    writer.on("error", (err) => {
      return reject(err);
    });
  });
}

export function todayStr() {
  const date = new Date();
  return date.toISOString();
}
