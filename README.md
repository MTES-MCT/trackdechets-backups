# trackdechets-backups

Backups journaliers des bases de données suivantes sur un VPS OVH :
- prisma prod
- prisma sandbox
- metabase

```
ssh <username>@<ip-serveur> -p <port>

// list processes
pm2 list

// check logs
pm2 logs

// restart cron script
pm2 restart cron
```

Les backups sont stockés dans le dossier `./backups`