require("dotenv").config();
import * as cron from "cron";
import backupPrisma from "./backupers/prisma";
import backupMetabase from "./backupers/metabase";
import path from "path";
import { todayStr } from "./utils";
import { initSentry } from "./sentry";
import { s3Writer } from "./s3";

const { SCALEWAY_DB_SANDBOX_ID, SCALEWAY_DB_PROD_ID } = process.env;

const cronTime = "0 1 * * *";

const cronOpts = {
  cronTime,
  timeZone: "Europe/Paris",
  runOnInit: true
};

const Sentry = initSentry();

const jobs = [
  // metabase backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async () => {
      try {
        const backupPath = path.join("metabase", `${todayStr()}.custom`);
        const { writer, upload } = s3Writer(backupPath);
        await backupMetabase(writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded metabase backup to ${Location}`);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }),
  // scaleway prisma sandbox backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async () => {
      try {
        const backupPath = path.join("prisma-sandbox", `${todayStr()}.custom`);
        const { writer, upload } = s3Writer(backupPath);
        await backupPrisma(SCALEWAY_DB_SANDBOX_ID, writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded sandbox backup to ${Location}`);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }),
  // scaleway prisma prod backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async () => {
      try {
        const backupPath = path.join(
          "prisma-production",
          `${todayStr()}.custom`
        );
        const { writer, upload } = s3Writer(backupPath);
        await backupPrisma(SCALEWAY_DB_PROD_ID, writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded production backup to ${Location}`);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  })
];

jobs.forEach((job) => job.start());
