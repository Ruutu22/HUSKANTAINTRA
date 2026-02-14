// 30+ New Feature Suggestions for HUS Lääkärijärjestelmä
// These are suggestions that can be implemented to enhance the system

export interface FeatureSuggestion {
  id: number;
  title: string;
  description: string;
  category: 'SECURITY' | 'USABILITY' | 'INTEGRATION' | 'ANALYTICS' | 'COMMUNICATION' | 'PATIENT_CARE' | 'ADMINISTRATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedEffort: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export const featureSuggestions: FeatureSuggestion[] = [
  // SECURITY FEATURES
  {
    id: 1,
    title: 'Kaksivaiheinen tunnistautuminen (2FA)',
    description: 'Toteuta kaksivaiheinen tunnistautuminen SMS-koodilla tai autentikaattorisovelluksella (Google Authenticator, Microsoft Authenticator) kaikille käyttäjille.',
    category: 'SECURITY',
    priority: 'HIGH',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 2,
    title: 'Istunnon aikakatkaisu',
    description: 'Automaattinen uloskirjautuminen 15 minuutin toimettomuuden jälkeen. Näytä varoitus 2 minuuttia ennen aikakatkaisua.',
    category: 'SECURITY',
    priority: 'HIGH',
    estimatedEffort: 'SMALL'
  },
  {
    id: 3,
    title: 'Salasanavaatimusten vahvistaminen',
    description: 'Vaadi vähintään 12 merkkiä, iso ja pieni kirjain, numero ja erikoismerkki. Pakota salasanan vaihto 90 päivän välein.',
    category: 'SECURITY',
    priority: 'HIGH',
    estimatedEffort: 'SMALL'
  },
  {
    id: 4,
    title: 'IP-osoiterajoitukset',
    description: 'Mahdollisuus rajoittaa järjestelmän käyttö tietyistä IP-osoitteista tai HUS-verkosta.',
    category: 'SECURITY',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 5,
    title: 'Tietoturvahälytykset',
    description: 'Automaattiset hälytykset epäilyttävistä toiminnoista: useita epäonnistuneita kirjautumisia, epätavallinen käyttöaika, suuri datamäärä.',
    category: 'SECURITY',
    priority: 'HIGH',
    estimatedEffort: 'MEDIUM'
  },

  // USABILITY FEATURES
  {
    id: 6,
    title: 'Pikanäppäimet',
    description: 'Toteuta pikanäppäimet yleisimmille toiminnoille: Ctrl+N uusi lomake, Ctrl+S tallenna, Ctrl+F haku, Ctrl+P tulosta.',
    category: 'USABILITY',
    priority: 'MEDIUM',
    estimatedEffort: 'SMALL'
  },
  {
    id: 7,
    title: 'Äänihälytykset',
    description: 'Valinnaiset äänihälytykset uusista viesteistä, hälytyksistä ja tärkeistä tapahtumista.',
    category: 'USABILITY',
    priority: 'LOW',
    estimatedEffort: 'SMALL'
  },
  {
    id: 8,
    title: 'Teemavaihtoehdot',
    description: 'Mahdollisuus vaihtaa väriteemaa: vaalea, tumma, korkea kontrasti, värisokeaystävällinen.',
    category: 'USABILITY',
    priority: 'LOW',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 9,
    title: 'Responsiivinen mobiilinäkymä',
    description: 'Optimoi järjestelmä mobiililaitteille: tabletit ja älypuhelimet.',
    category: 'USABILITY',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 10,
    title: 'Automaattinen täyttö',
    description: 'Täytä automaattisesti aiemmin syötetyt tiedot: potilaan nimi, henkilötunnus, osoite.',
    category: 'USABILITY',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },

  // INTEGRATION FEATURES
  {
    id: 11,
    title: 'Kanta.fi -integraatio',
    description: 'Integroi Kanta.fi -palveluun: reseptit, potilastiedot, laboratoriotulokset.',
    category: 'INTEGRATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 12,
    title: 'OmaKanta -integraatio',
    description: 'Synkronoi tiedot OmaKanta-palvelun kanssa potilaiden käyttöön.',
    category: 'INTEGRATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 13,
    title: 'Laboratoriojärjestelmäintegraatio',
    description: 'Suora integraatio HUSLAB:iin ja muihin laboratoriojärjestelmiin.',
    category: 'INTEGRATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 14,
    title: 'Kuvantamisjärjestelmäintegraatio (PACS)',
    description: 'Integroi kuvantamistutkimukset PACS-järjestelmään.',
    category: 'INTEGRATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 15,
    title: 'Sähköposti-ilmoitukset',
    description: 'Lähetä sähköposti-ilmoitukset tärkeistä tapahtumista: uudet diagnoosit, reseptit, ajanvaraukset.',
    category: 'INTEGRATION',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 16,
    title: 'SMS-ilmoitukset',
    description: 'Lähetä tekstiviesti-ilmoitukset potilaille: ajanvarausvahvistukset, muistutukset.',
    category: 'INTEGRATION',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },

  // ANALYTICS FEATURES
  {
    id: 17,
    title: 'Käyttötilastot',
    description: 'Näytä tilastoja järjestelmän käytöstä: aktiiviset käyttäjät, suosituimmat toiminnot, käyttöaika.',
    category: 'ANALYTICS',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 18,
    title: 'Potilastilastot',
    description: 'Analysoi potilastietoja: yleisimmät diagnoosit, reseptit, ikäjakauma.',
    category: 'ANALYTICS',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 19,
    title: 'Suorituskykyraportit',
    description: 'Seuraa järjestelmän suorituskykyä: latausajat, virheet, saatavuus.',
    category: 'ANALYTICS',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 20,
    title: 'Auditointiraportit',
    description: 'Generoi yksityiskohtaisia auditointiraportteja tietoturvatarkastuksiin.',
    category: 'ANALYTICS',
    priority: 'HIGH',
    estimatedEffort: 'MEDIUM'
  },

  // COMMUNICATION FEATURES
  {
    id: 21,
    title: 'Videopuhelut',
    description: 'Toteuta videopuheluominaisuus etävastaanottoja varten.',
    category: 'COMMUNICATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 22,
    title: 'Ääniviestit',
    description: 'Mahdollisuus lähettää ääniviestejä potilaille ja kollegoille.',
    category: 'COMMUNICATION',
    priority: 'LOW',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 23,
    title: 'Ryhmäkeskustelut',
    description: 'Luo ryhmäkeskusteluja tiimeille ja erikoisaloille.',
    category: 'COMMUNICATION',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 24,
    title: 'Tiedotteet',
    description: 'Lähetä tiedotteita koko henkilökunnalle tai tietyille ryhmille.',
    category: 'COMMUNICATION',
    priority: 'MEDIUM',
    estimatedEffort: 'SMALL'
  },

  // PATIENT CARE FEATURES
  {
    id: 25,
    title: 'Hoitopolku',
    description: 'Seuraa potilaan hoitopolkua: diagnoosit, hoidot, seurannat, tulokset.',
    category: 'PATIENT_CARE',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 26,
    title: 'Muistutukset',
    description: 'Aseta muistutuksia: kontrollit, laboratoriot, rokotukset.',
    category: 'PATIENT_CARE',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 27,
    title: 'Allergiatiedot',
    description: 'Hallinnoi potilaiden allergiatietoja ja varoituksia.',
    category: 'PATIENT_CARE',
    priority: 'HIGH',
    estimatedEffort: 'SMALL'
  },
  {
    id: 28,
    title: 'Lääkeinteraktiot',
    description: 'Tarkista automaattisesti lääkeinteraktiot uuden reseptin kirjoituksessa.',
    category: 'PATIENT_CARE',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 29,
    title: 'Potilasohjeet',
    description: 'Generoi automaattisesti potilasohjeita diagnoosien ja hoitojen perusteella.',
    category: 'PATIENT_CARE',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 30,
    title: 'Seurantalomakkeet',
    description: 'Luo seurantalomakkeita kroonisten sairauksien hallintaan.',
    category: 'PATIENT_CARE',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },

  // ADMINISTRATION FEATURES
  {
    id: 31,
    title: 'Työvuorosuunnittelu',
    description: 'Laaja työvuorosuunnittelu: vuorolista, vaihtopyynnöt, ylitöiden seuranta.',
    category: 'ADMINISTRATION',
    priority: 'HIGH',
    estimatedEffort: 'LARGE'
  },
  {
    id: 32,
    title: 'Resurssienhallinta',
    description: 'Hallinnoi huoneita, laitteita ja muita resursseja.',
    category: 'ADMINISTRATION',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 33,
    title: 'Laskutusintegraatio',
    description: 'Integroi laskutusjärjestelmään hoitokertojen perusteella.',
    category: 'ADMINISTRATION',
    priority: 'MEDIUM',
    estimatedEffort: 'LARGE'
  },
  {
    id: 34,
    title: 'Laatujärjestelmä',
    description: 'Toteuta laatujärjestelmä: poikkeamailmoitukset, kehitysehdotukset.',
    category: 'ADMINISTRATION',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 35,
    title: 'Varmuuskopiointi',
    description: 'Automaattinen päivittäinen varmuuskopiointi pilvipalveluun.',
    category: 'ADMINISTRATION',
    priority: 'HIGH',
    estimatedEffort: 'MEDIUM'
  },

  // ADDITIONAL FEATURES
  {
    id: 36,
    title: 'Tehtävälista',
    description: 'Henkilökohtainen tehtävälista tärkeille toimenpiteille.',
    category: 'USABILITY',
    priority: 'LOW',
    estimatedEffort: 'SMALL'
  },
  {
    id: 37,
    title: 'Kirjanmerkit',
    description: 'Tallenna usein käytetyt sivut ja potilaat kirjanmerkkeihin.',
    category: 'USABILITY',
    priority: 'LOW',
    estimatedEffort: 'SMALL'
  },
  {
    id: 38,
    title: 'Hakuhistoria',
    description: 'Näytä viimeisimmät haut ja usein haetut potilaat.',
    category: 'USABILITY',
    priority: 'LOW',
    estimatedEffort: 'SMALL'
  },
  {
    id: 39,
    title: 'Tulostusasetukset',
    description: 'Mukauta tulostusasetukset: otsikot, alatunnisteet, vesileimat.',
    category: 'USABILITY',
    priority: 'MEDIUM',
    estimatedEffort: 'MEDIUM'
  },
  {
    id: 40,
    title: 'Kielivalinta',
    description: 'Tuki useille kielille: suomi, ruotsi, englanti.',
    category: 'USABILITY',
    priority: 'MEDIUM',
    estimatedEffort: 'LARGE'
  }
];

export const getSuggestionsByCategory = (category: FeatureSuggestion['category']) => {
  return featureSuggestions.filter(s => s.category === category);
};

export const getSuggestionsByPriority = (priority: FeatureSuggestion['priority']) => {
  return featureSuggestions.filter(s => s.priority === priority);
};

export const getHighPrioritySuggestions = () => {
  return featureSuggestions.filter(s => s.priority === 'HIGH');
};

export default featureSuggestions;
