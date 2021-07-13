import * as cron from "cron";
import backupScaleway from "./backupers/scaleway";
import backupMetabase from "./backupers/metabase";

const { SCALEWAY_DB_SANDBOX_ID, SCALEWAY_DB_PROD_ID } = process.env;

const cronTime = "0 1 * * *";

const jobs = [
  // metabase backup
  new cron.CronJob({
    cronTime,
    onTick: () => backupMetabase(),
    timeZone: "Europe/Paris"
  }),
  // scaleway prisma sandbox backup
  new cron.CronJob({
    cronTime,
    onTick: () => backupScaleway(SCALEWAY_DB_SANDBOX_ID),
    timeZone: "Europe/Paris"
  }),
  // scaleway prisma prod backup
  new cron.CronJob({
    cronTime,
    onTick: () => backupScaleway(SCALEWAY_DB_PROD_ID),
    timeZone: "Europe/Paris"
  })
];

jobs.forEach((job) => job.start());
