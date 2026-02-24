# HUS Lääkärijärjestelmä

![HUS Logo](https://www.hus.fi/themes/custom/hus/logo.svg)

**.ruudun luoma HUS järjestelmä** - Terveydenhuollon ammattilaisten kokonaisvaltainen työkalu.


## ✨ Ominaisuudet

### 📋 Lomakehallinta
- Lomakepohjien luonti ja muokkaus
- Valmiit pohjat (Poliisi TT, Psykologi, Vuorotulo, Raportti)
- PDF-generointi HUS-logolla
- Hyväksyntäjärjestelmä leimalla
- Reaaliaikainen esikatselu

### 👥 Potilashoito
- Potilasrekisteri
- Diagnoosit (ICD-10)
- Reseptien kirjoitus
- Laboratoriotilaukset
- Kuvantaminen (Röntgen, CT, MRI, Ultraääni)
- Erikoislähetteet

### 📅 Ajanhallinta
- Ajanvarauskalenteri
- Työvuoroseuranta
- Työajan laskenta
- Vuoro-status

### 💬 Viestintä
- Reaaliaikainen chat
- Jaetut muistiot
- Ohjeistukset ja tiedotteet
- Ilmoitukset ammattinimikkeittäin

### 🏥 Potilasportaali
- Potilaspalautteet
- Omat terveystiedot
- Ajanvaraus
- Viestintä henkilökunnan kanssa

### ⚙️ Hallinta (JYL)
- Käyttäjähallinta
- Käyttöoikeuksien hallinta (roolit + ammattinimikkeet)
- Toimintaloki
- Järjestelmäasetukset

## 🛠️ Teknologiat

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Build Tool:** Vite
- **State:** React Hooks + LocalStorage

## 🚀 Käynnistys

```bash
# Asenna riippuvuudet
npm install

# Käynnistä kehityspalvelin
npm run dev

# Buildaa tuotantoon
npm run build
```

## 📁 Projektin rakenne

```
src/
├── components/ui/     # shadcn/ui komponentit
├── hooks/             # Custom React-hookit
│   ├── useAuth.tsx    # Autentikaatio
│   ├── useStorage.tsx # Datahallinta
│   └── ...
├── sections/          # Sivukomponentit
│   ├── Sidebar.tsx
│   ├── TallennetutPage.tsx
│   ├── UusiPage.tsx
│   ├── PotilaatPage.tsx
│   ├── PotilasportaaliPage.tsx
│   ├── AsetuksetPage.tsx
│   └── ...
├── types/             # TypeScript-tyypit
├── lib/               # Apufunktiot
└── App.tsx            # Pääkomponentti
```

## 🔒 Tietoturva

- Roolipohjainen pääsynhallinta
- Sivukohtaiset käyttöoikeudet
- Sähköinen allekirjoitus
- Toimintaloki
- Datan salaus

## 📝 Lisenssi

Private - HUS käyttöön

---

**Tekijä:** .ruutu  
**Versio:** 2.0.0
