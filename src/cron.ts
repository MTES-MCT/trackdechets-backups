import * as cron from "cron";
import backupPrisma from "./backupers/prisma";
import backupMetabase from "./backupers/metabase";
import path from "path";
import { todayStr } from "./utils";
import { s3Writer } from "./s3";

const { SCALINGO_SANDBOX_APP, SCALINGO_PRODUCTION_APP } = process.env;

const cronTime = "17 3 * * *";
const cronTimeProd = "7 3 * * *";

const cronOpts = {
  cronTime,
  timeZone: "Europe/Paris",
  runOnInit: true,
};
const prodCronOpts = {
  cronTime: cronTimeProd,
  timeZone: "Europe/Paris",
  runOnInit: true,
};
const jobs = [
  // metabase backup
  cron.CronJob.from({
    ...cronOpts,
    onTick: async () => {
      try {
        const backupPath = path.join("metabase", `${todayStr()}.custom`);
        const { writer, upload } = s3Writer(backupPath);
        await backupMetabase(writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded metabase backup to ${Location}`);
      } catch (err) {
        console.log(err);
      }
    },
  }),
  // scalingo prisma sandbox backup
  cron.CronJob.from({
    ...cronOpts,
    onTick: async () => {
      try {
        const backupPath = path.join("prisma-sandbox", `${todayStr()}.tar.gz`);
        const { writer, upload } = s3Writer(backupPath);
        await backupPrisma(SCALINGO_SANDBOX_APP, writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded sandbox backup to ${Location}`);
      } catch (err) {
        console.log(err);
      }
    },
  }),
  //scalingo prisma prod backup
  cron.CronJob.from({
    ...prodCronOpts,
    onTick: async () => {
      console.log("Starting production backup process");
      try {
        const backupPath = path.join(
          "prisma-production",
          `${todayStr()}.tar.gz`
        );
        const { writer, upload } = s3Writer(backupPath, { logProgress: true });
        await backupPrisma(SCALINGO_PRODUCTION_APP, writer);
        const { Location } = await upload;
        console.log(`Successfully uploaded production backup to ${Location}`);
      } catch (err) {
        console.log(err);
      }
    },
  }),
];

jobs.forEach((job) => job.start());
