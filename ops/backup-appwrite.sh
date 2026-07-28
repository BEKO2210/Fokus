#!/usr/bin/env bash
# Nächtliche Sicherung der Appwrite-Datenbank (MongoDB).
#
# Sichert ALLE Appwrite-Projekte, nicht nur Fokus — die Instanz teilt sich eine
# Datenbank. Ohne das hier gäbe es bei einem Plattenschaden keinen Weg zurück,
# und mit fremden Nutzerdaten ist das kein akzeptables Risiko.
#
# Aufruf über den systemd-Timer fokus-backup.timer.
set -euo pipefail

ZIEL="${FOKUS_BACKUP_DIR:-/home/belkis/backups/appwrite}"
BEHALTEN_TAGE="${FOKUS_BACKUP_KEEP_DAYS:-14}"
STEMPEL="$(date +%Y-%m-%d_%H%M)"
ARCHIV="$ZIEL/appwrite-$STEMPEL.archive.gz"

mkdir -p "$ZIEL"

BENUTZER="$(docker exec appwrite printenv _APP_DB_USER)"
PASSWORT="$(docker exec appwrite printenv _APP_DB_PASS)"

# In den Container schreiben und herausholen, damit keine Zugangsdaten
# über die Kommandozeile des Hosts wandern.
docker exec -e MP="$PASSWORT" appwrite-mongodb \
  sh -c "mongodump --quiet --username '$BENUTZER' --password \"\$MP\" \
         --authenticationDatabase admin --db appwrite \
         --archive=/tmp/appwrite.archive.gz --gzip"

docker cp appwrite-mongodb:/tmp/appwrite.archive.gz "$ARCHIV"
docker exec appwrite-mongodb rm -f /tmp/appwrite.archive.gz

chmod 600 "$ARCHIV"

GROESSE="$(du -h "$ARCHIV" | cut -f1)"
if [ ! -s "$ARCHIV" ]; then
  echo "FEHLER: Sicherung ist leer — $ARCHIV" >&2
  exit 1
fi

# Alte Sicherungen aufräumen.
find "$ZIEL" -name 'appwrite-*.archive.gz' -mtime "+$BEHALTEN_TAGE" -delete

ANZAHL="$(find "$ZIEL" -name 'appwrite-*.archive.gz' | wc -l)"
echo "Sicherung geschrieben: $ARCHIV ($GROESSE), $ANZAHL Stände vorhanden"

# Wiederherstellung:
#   docker cp <datei> appwrite-mongodb:/tmp/restore.gz
#   docker exec appwrite-mongodb mongorestore --username … --password … \
#     --authenticationDatabase admin --archive=/tmp/restore.gz --gzip --drop
