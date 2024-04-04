import axios from "axios";

const { SCALINGO_TOKEN } = process.env;

const SCALINGO_API_URL = "https://api.osc-secnum-fr1.scalingo.com";
const SCALINGO_DB_API_URL = "https://db-api.osc-secnum-fr1.scalingo.com";

type Addon = {
  id: string;
  addon_provider: { id: string };
};

type Backup = {
  id: string;
  created_at: string;
  status: string;
};

export async function getBearerToken() {
  const r = await axios.post(
    `https://auth.scalingo.com/v1/tokens/exchange`,
    {},
    { auth: { username: "", password: SCALINGO_TOKEN } }
  );
  return r.data.token;
}

export async function listAddons(app: string) {
  const bearer = await getBearerToken();
  const auth = { Authorization: `Bearer ${bearer}` };
  const addonsUrl = `${SCALINGO_API_URL}/v1/apps/${app}/addons`;
  const r = await axios.get<{ addons: Addon[] }>(addonsUrl, { headers: auth });
  return r.data.addons;
}

export async function getDatabase(app: string) {
  const addons = await listAddons(app);
  const postgres = addons.find(
    (addon) => addon.addon_provider.id === "postgresql"
  );
  return postgres ?? null;
}

export async function getAddonToken(app: string, addon: Addon) {
  const bearer = await getBearerToken();
  const auth = { Authorization: `Bearer ${bearer}` };
  const addonTokenUrl = `${SCALINGO_API_URL}/v1/apps/${app}/addons/${addon.id}/token`;
  const r = await axios.post<{ addon: { token: string } }>(
    addonTokenUrl,
    {},
    { headers: auth }
  );
  return r.data.addon.token;
}

export async function listBackups(app: string, addon: Addon) {
  const bearer = await getAddonToken(app, addon);
  const auth = { Authorization: `Bearer ${bearer}` };
  const listBackupsUrl = `${SCALINGO_DB_API_URL}/api/databases/${addon.id}/backups`;
  const r = await axios.get<{
    database_backups: Backup[];
  }>(listBackupsUrl, { headers: auth });
  return r.data.database_backups
    .filter((b) => b.status === "done")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getBackupDownloadLink(
  app: string,
  addon: Addon,
  backup: Backup
) {
  const bearer = await getAddonToken(app, addon);
  const auth = { Authorization: `Bearer ${bearer}` };
  const backupDownloadLinkUrl = `${SCALINGO_DB_API_URL}/api/databases/${addon.id}/backups/${backup.id}/archive`;
  const r = await axios.get<{ download_url: string }>(backupDownloadLinkUrl, {
    headers: auth,
  });
  return r.data.download_url;
}
