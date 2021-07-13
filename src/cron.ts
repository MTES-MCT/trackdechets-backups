import backupScaleway from "./backupers/scaleway";
import backupMetabase from "./backupers/metabase";

//backupScaleway().then(() => process.exit(0));

backupMetabase().then(() => process.exit(0));
