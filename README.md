# 🗂️ Gestionale Personale

**Gestionale Personale** è un'applicazione web pensata per **agenti assicurativi** e **professionisti** che ogni giorno devono tenere sotto controllo **attività**, **scadenze** e **polizze**. L'obiettivo è offrire un unico posto, semplice e veloce, dove vedere a colpo d'occhio cosa fare oggi, cosa è in scadenza e cosa è già stato fatto.

Tutto funziona direttamente nel browser: non serve creare account, non servono server, e i dati restano sul tuo dispositivo.

---

## ✨ Funzionalità

### 📊 Dashboard
La schermata principale mostra in tempo reale:
- Le **attività di oggi** da svolgere.
- Le **attività scadute** non ancora completate.
- Le **polizze in scadenza** entro la soglia configurata.
- Le **polizze da emettere** ancora aperte.

### ✅ Gestione Attività
- Creazione, modifica ed eliminazione di attività.
- Data di scadenza, note descrittive e stato **Da fare** / **Completata**.
- Filtri per stato e ricerca testuale rapida.
- Ordinamento per scadenza, così le cose urgenti restano in cima.

### 📑 Gestione Polizze
- **In Scadenza**: elenco delle polizze in avvicinamento alla data di rinnovo, con **codifica a colori** per capire subito quanto manca alla scadenza. La soglia (in giorni) è configurabile dalle impostazioni.
- **Da Emettere**: workflow per tracciare le polizze ancora da emettere, con possibilità di segnarle come emesse quando il processo è completato.

### ⚙️ Impostazioni
- Modifica della **soglia di giorni** per considerare una polizza "in scadenza".
- Le preferenze vengono salvate automaticamente.

### 💾 Persistenza locale
- Tutti i dati (attività, polizze, impostazioni) vengono salvati nel **localStorage del browser**.
- Niente database esterno, niente login: i tuoi dati restano sul tuo computer.

### 📱 UI responsive in italiano
Interfaccia interamente in italiano, ottimizzata sia per desktop che per tablet e smartphone.

---

## 🧰 Tecnologie

L'applicazione è costruita con uno stack moderno:

- **React** + **TypeScript** — base dell'interfaccia.
- **Vite** — bundler e dev server velocissimo.
- **Tailwind CSS** + **shadcn/ui** (Radix UI) — sistema di design e componenti accessibili.
- **wouter** — routing leggero lato client.
- **TanStack React Query** — gestione dello stato asincrono.
- **React Hook Form** + **Zod** — gestione e validazione dei form.
- **date-fns** — manipolazione delle date.
- **Express** (opzionale) — scheletro di API server, non necessario per usare il gestionale.

---

## 🚀 Guida passo-passo per iniziare

Questa guida è pensata anche per chi non ha mai aperto un terminale. Segui i passaggi in ordine.

### 1) Installare i prerequisiti

Ti servono tre strumenti gratuiti: **Node.js**, **pnpm** e **Git**.

#### 🟢 Node.js (versione LTS)

Node.js è il "motore" che fa funzionare l'applicazione.

1. Apri il sito ufficiale: <https://nodejs.org>
2. Scarica la versione **LTS** (consigliata per la maggior parte degli utenti).
3. Avvia il file di installazione e segui la procedura guidata (lascia le opzioni di default).
   - **Windows**: file `.msi`, doppio clic e "Avanti" fino alla fine.
   - **macOS**: file `.pkg`, doppio clic e segui la procedura.
   - **Linux**: usa il gestore di pacchetti della tua distribuzione, ad esempio:
     ```bash
     sudo apt update && sudo apt install -y nodejs npm
     ```
4. Per verificare che sia installato, apri un terminale e digita:
   ```bash
   node -v
   ```
   Dovresti vedere un numero di versione (es. `v20.18.0`).

#### 📦 pnpm

`pnpm` è il gestore dei pacchetti utilizzato dal progetto (più veloce e leggero rispetto a `npm`).

Da terminale, digita:

```bash
npm install -g pnpm
```

Poi verifica con:

```bash
pnpm -v
```

Se vedi un numero di versione (es. `9.12.0`), è tutto a posto.

> ℹ️ Su macOS/Linux, se ricevi un errore di permessi, prova con `sudo npm install -g pnpm`.

#### 🌱 Git (opzionale ma consigliato)

Git serve solo se vuoi scaricare il progetto con il comando `git clone`. Se preferisci scaricare lo ZIP, puoi saltare questo passaggio.

1. Scarica Git da: <https://git-scm.com/downloads>
2. Installa con le opzioni di default.
3. Verifica con:
   ```bash
   git --version
   ```

---

### 2) Scaricare il progetto da GitHub

Hai due modi per ottenere il codice. Se non sei pratico di terminale, scegli l'**Opzione A**.

#### 🅰️ Opzione A — Scaricare lo ZIP (consigliata per non tecnici)

1. Apri la pagina del repository su GitHub.
2. Clicca sul pulsante verde **`Code`** in alto a destra.
3. Clicca su **`Download ZIP`**.
4. Estrai l'archivio in una cartella a tua scelta (es. `Documenti/gestionale-personale`).

#### 🅱️ Opzione B — Clonare con Git

Da terminale, scegli una cartella di destinazione e digita:

```bash
git clone <URL_REPO>
```

> Sostituisci `<URL_REPO>` con l'indirizzo del repository (lo trovi sempre nel pulsante verde **`Code`** su GitHub).

---

### 3) Aprire un terminale nella cartella del progetto

Devi posizionarti **dentro** la cartella appena scaricata/estratta.

- **Windows**:
  - Apri la cartella in Esplora file.
  - Clicca con il tasto destro in uno spazio vuoto della cartella.
  - Seleziona **"Apri nel terminale"** (oppure "Apri finestra PowerShell qui").

- **macOS**:
  - Apri il **Finder** e vai alla cartella del progetto.
  - Clicca con il tasto destro sulla cartella → **Servizi** → **"Nuovo Terminale nella cartella"**.
  - Se la voce non c'è, attivala da *Impostazioni di Sistema → Tastiera → Abbreviazioni → Servizi → "Nuovo Terminale nella cartella"*.

- **Linux**:
  - Apri il file manager, vai nella cartella del progetto.
  - Tasto destro → **"Apri nel terminale"** (la voce esatta dipende dall'ambiente desktop).

Per confermare di essere nella cartella giusta, digita:

```bash
ls
```

Dovresti vedere file come `package.json`, `pnpm-workspace.yaml`, e la cartella `artifacts`.

---

### 4) Installare le dipendenze

Sempre da terminale, nella **root del progetto**, digita:

```bash
pnpm install
```

> ⏳ La prima installazione può richiedere **qualche minuto**: pnpm sta scaricando tutte le librerie necessarie. È normale vedere molte righe scorrere.

---

### 5) Avviare l'applicazione

Per avviare il gestionale in modalità sviluppo:

```bash
pnpm --filter @workspace/gestionale dev
```

Quando il comando è pronto, vedrai nel terminale un indirizzo locale, di solito qualcosa come:

```
http://localhost:5173
```

Apri quel link nel tuo browser (Chrome, Firefox, Edge, Safari): vedrai il **Gestionale Personale** pronto all'uso. 🎉

> Per fermare l'applicazione, torna sul terminale e premi `Ctrl + C` (su macOS: `⌃ + C`).

---

### 6) (Opzionale) Avviare l'API server

Il progetto include uno **scheletro di server Express** in `artifacts/api-server`. **Non è necessario** per usare il gestionale: tutti i dati vengono già salvati nel browser.

Se vuoi comunque avviarlo, da terminale:

```bash
pnpm --filter @workspace/api-server dev
```

---

## 🛠️ Comandi utili

Tutti i comandi vanno eseguiti dalla root del progetto.

| Comando | Cosa fa |
| --- | --- |
| `pnpm --filter @workspace/gestionale dev` | Avvia il gestionale in modalità sviluppo (con auto-reload). |
| `pnpm --filter @workspace/gestionale build` | Compila il gestionale per la produzione nella cartella `dist`. |
| `pnpm --filter @workspace/gestionale serve` | Avvia un'anteprima locale della build di produzione. |
| `pnpm --filter @workspace/gestionale typecheck` | Verifica i tipi TypeScript senza generare file. |
| `pnpm install` | Installa o aggiorna tutte le dipendenze del monorepo. |

---

## 💾 Come si usano i dati

- Tutti i dati di **attività**, **polizze** e **impostazioni** sono salvati nel **`localStorage` del browser**.
- Questo significa che:
  - I dati **restano sul tuo dispositivo** e non vengono inviati ad alcun server.
  - Sono legati al **browser** e al **profilo** che stai usando: se apri il gestionale con un altro browser o un altro computer, non vedrai gli stessi dati.
  - **Svuotare la cache** o i dati del sito dalle impostazioni del browser **cancella definitivamente** attività e polizze salvate.
- Per sicurezza, se gestisci informazioni importanti, esegui periodicamente un backup manuale (ad esempio annotando le scadenze in un altro luogo).

---

## 🩺 Risoluzione problemi comuni

### "`pnpm` non è riconosciuto come comando" (oppure `command not found: pnpm`)
- pnpm non è installato o il terminale era già aperto prima dell'installazione.
- Chiudi e riapri il terminale, poi riprova.
- Se persiste, reinstalla con: `npm install -g pnpm` (su macOS/Linux eventualmente con `sudo`).

### "Port 5173 is already in use" (o porta già occupata)
- Un'altra applicazione sta usando la stessa porta.
- Soluzione rapida: chiudi l'altra applicazione, oppure premi `Ctrl + C` su un eventuale terminale già aperto con `pnpm dev` in esecuzione.
- In alternativa, Vite ti proporrà automaticamente la porta successiva (es. `5174`): apri il nuovo indirizzo che vedi nel terminale.

### Il browser mostra una **schermata bianca** dopo l'avvio
- Aspetta qualche secondo: alla prima apertura Vite deve compilare i file.
- Aggiorna la pagina con `Ctrl + F5` (Windows/Linux) o `⌘ + Shift + R` (macOS) per forzare il ricaricamento.
- Apri la **console del browser** (`F12` → scheda *Console*) per vedere eventuali errori.

### Come **riavviare** l'applicazione
1. Nel terminale dove gira il gestionale, premi `Ctrl + C` per fermarlo.
2. Riavvia con:
   ```bash
   pnpm --filter @workspace/gestionale dev
   ```

### Dopo un aggiornamento del progetto qualcosa non funziona
- Reinstalla le dipendenze:
  ```bash
  pnpm install
  ```
- Poi riavvia il gestionale.

---

## 📄 Licenza

_Da definire._

## 🤝 Contributi

I contributi sono benvenuti. Per proposte di modifica o segnalazione di bug, apri una **issue** o una **pull request** sul repository GitHub.
