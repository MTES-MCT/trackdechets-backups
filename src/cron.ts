require("dotenv").config();
import * as cron from "cron";
import backupPrisma from "./backupers/prisma";
import backupMetabase from "./backupers/metabase";
import { createWriteStream } from "fs";
import path from "path";
import { createDirIfNotExists, rotate, todayStr } from "./utils";
import { initSentry } from "./sentry";

const { SCALEWAY_DB_SANDBOX_ID, SCALEWAY_DB_PROD_ID, SENTRY_DSN } = process.env;

const cronTime = "0 1 * * *";

const cronOpts = {
  cronTime,
  timeZone: "Europe/Paris",
  runOnInit: true
};

// number of backups to keep
const rotateMaxFiles = 7;

const prismaSandboxBackupsPath = createDirIfNotExists("backups/prisma/sandbox");
const prismaProdBackupsPath = createDirIfNotExists("backups/prisma/prod");
const metabaseBackupsPath = createDirIfNotExists("backups/metabase");

const Sentry = initSentry();

const jobs = [
  // metabase backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async (onComplete) => {
      try {
        const backupPath = path.join(
          metabaseBackupsPath,
          `${todayStr()}.custom`
        );
        const writer = createWriteStream(backupPath);
        await backupMetabase(writer);
        onComplete();
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    onComplete: () => {
      rotate(metabaseBackupsPath, { maxFiles: rotateMaxFiles });
    }
  }),
  // scaleway prisma sandbox backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async (onComplete) => {
      try {
        const backupPath = path.join(
          prismaSandboxBackupsPath,
          `${todayStr()}.custom`
        );
        const writer = createWriteStream(backupPath);
        await backupPrisma(SCALEWAY_DB_SANDBOX_ID, writer);
        onComplete();
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    onComplete: () => {
      rotate(prismaSandboxBackupsPath, { maxFiles: rotateMaxFiles });
    }
  }),
  // scaleway prisma prod backup
  new cron.CronJob({
    ...cronOpts,
    onTick: async (onComplete) => {
      try {
        const backupPath = path.join(
          prismaProdBackupsPath,
          `${todayStr()}.custom`
        );
        const writer = createWriteStream(backupPath);
        await backupPrisma(SCALEWAY_DB_PROD_ID, writer);
        onComplete();
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    onComplete: () => {
      rotate(prismaProdBackupsPath, { maxFiles: rotateMaxFiles });
    }
  })
];

jobs.forEach((job) => job.start());
