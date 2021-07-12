import backup from "./backupers/scaleway";

backup().then(() => process.exit(0));
