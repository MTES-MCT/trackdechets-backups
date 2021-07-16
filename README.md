# trackdechets-backups

Backups journaliers des bases de données suivantes sur un VPS OVH :
- prisma prod
- prisma sandbox
- metabase


### Administration

```
ssh <username>@<ip-serveur> -p <port>

// list processes
pm2 list

// check logs
pm2 logs

// restart cron script
pm2 restart cron
```

### Backups
Les backups sont stockés dans le dossier `./backups`. Une rotation est en place pour stocker les 7 derniers backups uniquement.

## Monitoring

Les remontées d'erreur se font dans Sentry sur l'environnement `td-backups`

### Idées améliorations
- stocker les fichiers de backup sur OVH object storage
- déployer sur Scalingo
