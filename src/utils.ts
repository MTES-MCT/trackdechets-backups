import { createWriteStream } from "fs";
import axios from "axios";

/**
 * Get the remote file and pipe the content to disk
 */
export async function download(downloadUrl: string, writeTo: string) {
  const writer = createWriteStream(writeTo);
  const downloadResponse = await axios.get(downloadUrl, {
    responseType: "stream"
  });
  downloadResponse.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
