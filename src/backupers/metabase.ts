import { NodeSSH } from "node-ssh";

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

export default async function backup() {
  await ssh.connect(connectionArgs);
  const cmd =
    `PGPASSWORD=${METABASE_POSTGRES_PASSWORD} pg_dump -U ${METABASE_POSTGRES_USER}` +
    ` -h localhost -F c -f backup.custom ${METABASE_POSTGRES_DB}`;
  await ssh.execCommand(cmd);
  await ssh.getFile("metabase-backup.custom", "backup.custom");
}
