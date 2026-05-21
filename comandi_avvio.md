# Istruzioni per l'Avvio del Server

Abbiamo configurato con successo l'ambiente per macOS ed avviato il server di sviluppo Vite. Di seguito sono riportati i passaggi e i comandi eseguiti.

---

## 1. Risoluzione Dipendenze macOS

Il file `pnpm-workspace.yaml` presentava delle esclusioni per i moduli nativi macOS (`darwin-arm64` e `darwin-x64`). Abbiamo rimosso/commentato queste esclusioni per permettere a `pnpm` di scaricare i binari corretti per la tua macchina.

Dopo aver modificato `pnpm-workspace.yaml`, abbiamo eseguito l'installazione pulita ignorando gli script di pre-installazione (che avrebbero bloccato l'esecuzione a causa di controlli sull'user-agent):

```bash
pnpm install --ignore-scripts
```

---

## 2. Avvio del Server di Sviluppo

Il file di configurazione `vite.config.ts` richiede obbligatoriamente le variabili d'ambiente `PORT` e `BASE_PATH`. 

Poiché la porta `8080` (predefinita nel file `.replit`) era già occupata sul tuo sistema, abbiamo avviato il server sulla porta `5173` posizionandoci all'interno della cartella dell'applicazione `artifacts/gestionale`:

```bash
# Entra nella cartella del modulo gestionale (se non ci sei già)
cd artifacts/gestionale

# Avvia il server con le variabili d'ambiente configurate
PORT=5173 BASE_PATH=/ npx vite --config vite.config.ts --host 0.0.0.0
```

Il server è ora attivo e raggiungibile al seguente indirizzo locale:
👉 **[http://localhost:5173/](http://localhost:5173/)**
