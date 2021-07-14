import { createReadStream } from "fs";
import { NodeSSH } from "node-ssh";
import temp from "temp";
import eos from "end-of-stream";
import { unlinkSync } from "fs";
import { Writable } from "stream";

const ssh = new NodeSSH();

const {
  METABASE_HOST,
  METABASE_SSH_USER,
  METABASE_SSH_PASSWORD,
  METABASE_SSH_PORT,
  METABASE_POSTGRES_USER,
  METABASE_POSTGRES_DB,
  METABASE_POSTGRES_PASSWORD
} = process.env;

const connectionArgs = {
  host: METABASE_HOST,
  username: METABASE_SSH_USER,
  password: METABASE_SSH_PASSWORD,
  port: parseInt(METABASE_SSH_PORT)
};

export default async function backup(writer: Writable) {
  await ssh.connect(connectionArgs);
  const cmd =
    `PGPASSWORD=${METABASE_POSTGRES_PASSWORD} pg_dump -U ${METABASE_POSTGRES_USER}` +
    ` -h localhost -F c -f backup.custom ${METABASE_POSTGRES_DB}`;
  await ssh.execCommand(cmd);
  const tempPath = temp.path({ suffix: ".custom" });
  await ssh.getFile(tempPath, "backup.custom");
  // close connection
  ssh.dispose();
  createReadStream(tempPath).pipe(writer);
  const streamEnded = new Promise((resolve, reject) => {
    eos(writer, (err) => (err ? reject : resolve)(err));
  });
  await streamEnded;
  // clean up temp
  unlinkSync(tempPath);
}
