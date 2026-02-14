// ICD-10 Diagnoosit kategorioittain

export interface DiagnosisData {
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  treatmentGuidelines?: string;
}

export const diagnosisCategories = [
  { id: 'A00-B99', name: 'Tartuntataudit', description: 'Bakteeri-, virus-, lois- ja sienitaudit' },
  { id: 'C00-D48', name: 'Kasvaimet', description: 'Pahanlaatuiset ja hyvänlaatuiset kasvaimet' },
  { id: 'D50-D89', name: 'Veritaudit', description: 'Veren ja verenmuodostuselinten sairaudet' },
  { id: 'E00-E90', name: 'Aineenvaihdunta', description: 'Endokriiniset, ravitsemus- ja aineenvaihduntasairaudet' },
  { id: 'F00-F99', name: 'Mielenterveys', description: 'Mielenterveyden ja käyttäytymisen häiriöt' },
  { id: 'G00-G99', name: 'Hermosto', description: 'Hermoston sairaudet' },
  { id: 'H00-H59', name: 'Silmät', description: 'Silmän ja silmänympärysalueen sairaudet' },
  { id: 'H60-H95', name: 'Korvat', description: 'Korvan ja nielurisan sairaudet' },
  { id: 'I00-I99', name: 'Sydän- ja verisuonitaudit', description: 'Verenkiertoelimistön sairaudet' },
  { id: 'J00-J99', name: 'Hengityselimet', description: 'Hengityselinten sairaudet' },
  { id: 'K00-K93', name: 'Ruuansulatus', description: 'Ruuansulatuselimistön sairaudet' },
  { id: 'L00-L99', name: 'Iho', description: 'Ihon ja ihonalaiskudoksen sairaudet' },
  { id: 'M00-M99', name: 'Tuki- ja liikuntaelimistö', description: 'Luusto-, lihas- ja sidekudossairaudet' },
  { id: 'N00-N99', name: 'Virtsa- ja sukupuolielimet', description: 'Virtsa- ja sukupuolielinten sairaudet' },
  { id: 'O00-O99', name: 'Raskaus ja synnytys', description: 'Raskaus, synnytys ja lapsivuodeaika' },
  { id: 'P00-P96', name: 'Vastasyntyneet', description: 'Vastasyntyneiden sairaudet' },
  { id: 'Q00-Q99', name: 'Synnynnäiset epämuodostumat', description: 'Synnynnäiset epämuodostumat ja kromosomihäiriöt' },
  { id: 'R00-R99', name: 'Oireet ja poikkeavuudet', description: 'Oireet, merkit ja poikkeavat kliiniset löydökset' },
  { id: 'S00-T98', name: 'Tapaturmat ja myrkytykset', description: 'Tapaturmat, myrkytykset ja ulkoiset syyt' },
  { id: 'V01-Y98', name: 'Ulkoiset syyt', description: 'Kuoleman ja sairastumisen ulkoiset syyt' },
  { id: 'Z00-Z99', name: 'Terveystilanteet', description: 'Terveystilanteisiin liittyvät tekijät' },
];

export const diagnoses: DiagnosisData[] = [
  // Tartuntataudit (A00-B99)
  { code: 'A09', name: 'Ripuli ja gastroenteriitti', category: 'A00-B99', subcategory: 'Suolisto', description: 'Tarttuva ripuli', treatmentGuidelines: 'Nesteytys, lepo, tarvittaessa antibiootti' },
  { code: 'A15', name: 'Keuhkotuberkuloosi', category: 'A00-B99', subcategory: 'Tuberkuloosi', description: 'Mycobacterium tuberculosis -infektio keuhkoissa', treatmentGuidelines: 'Kuuden kuukauden antibioottihoito (RHZE)' },
  { code: 'B01', name: 'Vesirokko', category: 'A00-B99', subcategory: 'Virukset', description: 'Varicella zoster -virusinfektio', treatmentGuidelines: 'Oireenmukainen hoito, asikloviiri riskiryhmille' },
  { code: 'B02', name: 'Vyöruusu', category: 'A00-B99', subcategory: 'Virukset', description: 'Herpes zoster -reaktivaatio', treatmentGuidelines: 'Asikloviiri 800mg 5x/vrk 7 pv, kipulääke' },
  { code: 'B34', name: 'Virusinfektio', category: 'A00-B99', subcategory: 'Virukset', description: 'Määrittämätön virusinfektio', treatmentGuidelines: 'Oireenmukainen hoito, lepo' },
  { code: 'B35', name: 'Dermatofyytti', category: 'A00-B99', subcategory: 'Sienet', description: 'Ihosienitartunta', treatmentGuidelines: 'Paikallinen tai suun kautta sienilääke' },
  { code: 'J06', name: 'Ylähengitystieinfektio', category: 'J00-J99', subcategory: 'Infektiot', description: 'Virusperäinen nuha/kurkkukipu', treatmentGuidelines: 'Oireenmukainen hoito, lepo' },
  { code: 'J18', name: 'Keuhkokuume', category: 'J00-J99', subcategory: 'Infektiot', description: 'Keuhkojen bakteeri- tai virusinfektio', treatmentGuidelines: 'Antibiootti (amoksisilliini 1g 3x/vrk 7-10 pv)' },
  
  // Sydän- ja verisuonitaudit (I00-I99)
  { code: 'I10', name: 'Essentiaalinen hypertensio', category: 'I00-I99', subcategory: 'Verenpaine', description: 'Korkea verenpaine ilman selvää syytä', treatmentGuidelines: 'Elintapamuutokset, ACE-estäjä tai kalsiumkanavanestäjä' },
  { code: 'I11', name: 'Hypertensio sydänsairaus', category: 'I00-I99', subcategory: 'Verenpaine', description: 'Korkea verenpaine sydänsairaudella', treatmentGuidelines: 'ACE-estäjä, diureetti, beetasalpaaja' },
  { code: 'I20', name: 'Angina pectoris', category: 'I00-I99', subcategory: 'Sepelvaltimotauti', description: 'Rintakipu sydänlihaksen hapenpuutteesta', treatmentGuidelines: 'Nitroglyseriini, beetasalpaaja, statiini' },
  { code: 'I21', name: 'Sydäninfarkti', category: 'I00-I99', subcategory: 'Sepelvaltimotauti', description: 'Sydänlihaksen kuolio', treatmentGuidelines: 'ASA, klopidogreeli, hepariini, PCI' },
  { code: 'I25', name: 'Krooninen sepelvaltimotauti', category: 'I00-I99', subcategory: 'Sepelvaltimotauti', description: 'Pitkäaikainen sepelvaltimoahtauma', treatmentGuidelines: 'ASA, statiini, beetasalpaaja, ACE-estäjä' },
  { code: 'I48', name: 'Eteisvärinä', category: 'I00-I99', subcategory: 'Rytmihäiriöt', description: 'Eteisten epäsäännöllinen sähkötoiminta', treatmentGuidelines: 'Antikoagulantti, rytmihoito tarvittaessa' },
  { code: 'I50', name: 'Sydämen vajaatoiminta', category: 'I00-I99', subcategory: 'Vajaatoiminta', description: 'Sydämen pumppauskyvyn heikkeneminen', treatmentGuidelines: 'ACE-estäjä, beetasalpaaja, diureetti, MRA' },
  { code: 'I63', name: 'Aivoinfarkti', category: 'I00-I99', subcategory: 'Aivoverisuonet', description: 'Aivokudoksen kuolio verenkiertohäiriöstä', treatmentGuidelines: 'Trombolyysi/trombektomia, ASA, statiini' },
  { code: 'I64', name: 'Aivoverenkiertohäiriö', category: 'I00-I99', subcategory: 'Aivoverisuonet', description: 'Aivoverenkierron äkillinen häiriö', treatmentGuidelines: 'ASA, statiini, verenpainelääkitys' },
  { code: 'I67', name: 'Aivoverisuonisairaus', category: 'I00-I99', subcategory: 'Aivoverisuonet', description: 'Krooninen aivoverisuonisairaus', treatmentGuidelines: 'Riskitekijöiden hoito, ASA' },
  { code: 'I70', name: 'Ateroskleroosi', category: 'I00-I99', subcategory: 'Valtimot', description: 'Valtimoiden kovettuminen ja ahtautuminen', treatmentGuidelines: 'Statiini, ASA, elintapamuutokset' },
  { code: 'I80', name: 'Laskimotromboosi', category: 'I00-I99', subcategory: 'Laskimot', description: 'Laskimoveritulppa', treatmentGuidelines: 'Antikoagulantti (dabigatraani, rivaroksabaani)' },
  
  // Aineenvaihdunta (E00-E90)
  { code: 'E03', name: 'Hypotyreoosi', category: 'E00-E90', subcategory: 'Kilpirauhanen', description: 'Kilpirauhasen vajaatoiminta', treatmentGuidelines: 'Levotyroksiini 1.6 mcg/kg/vrk' },
  { code: 'E05', name: 'Hypertyreoosi', category: 'E00-E90', subcategory: 'Kilpirauhanen', description: 'Kilpirauhasen liikatoiminta', treatmentGuidelines: 'Tiamatsoli, beetasalpaaja, radiojodi' },
  { code: 'E10', name: 'Insuliiniriippuvainen diabetes', category: 'E00-E90', subcategory: 'Diabetes', description: 'Tyypin 1 diabetes', treatmentGuidelines: 'Insuliinihoito, glukoosiseuranta' },
  { code: 'E11', name: 'Tyypin 2 diabetes', category: 'E00-E90', subcategory: 'Diabetes', description: 'Aikuistyypin diabetes', treatmentGuidelines: 'Metformiini, elintapamuutokset, tarvittaessa insuliini' },
  { code: 'E66', name: 'Lihavuus', category: 'E00-E90', subcategory: 'Ravitsemus', description: 'Painoindeksi yli 30', treatmentGuidelines: 'Elintapamuutokset, GLP-1-agonisti, tarvittaessa leikkaus' },
  { code: 'E78', name: 'Hyperlipidemia', category: 'E00-E90', subcategory: 'Rasva-aineenvaihdunta', description: 'Kohonnut kolesteroli tai triglyseridit', treatmentGuidelines: 'Statiini, elintapamuutokset' },
  { code: 'E83', name: 'Kivennäisaineiden häiriö', category: 'E00-E90', subcategory: 'Kivennäisaineet', description: 'Kalsium-, magnesium- tai fosforihäiriö', treatmentGuidelines: 'Korvaushoito, taustasyyn hoito' },
  { code: 'E87', name: 'Nesteen ja elektrolyyttien häiriö', category: 'E00-E90', subcategory: 'Elektrolyytit', description: 'Nestetasapainon häiriö', treatmentGuidelines: 'Nesteytys, elektrolyyttikorjaus' },
  
  // Mielenterveys (F00-F99)
  { code: 'F00', name: 'Dementia Alzheimerin taudissa', category: 'F00-F99', subcategory: 'Dementia', description: 'Alzheimerin tautiin liittyvä dementia', treatmentGuidelines: 'Asetyylikolinesteraasin estäjä, memantiini' },
  { code: 'F01', name: 'Vaskulaarinen dementia', category: 'F00-F99', subcategory: 'Dementia', description: 'Aivoverenkiertohäiriöiden aiheuttama dementia', treatmentGuidelines: 'Riskitekijöiden hoito, asetyylikolinesteraasin estäjä' },
  { code: 'F03', name: 'Dementia', category: 'F00-F99', subcategory: 'Dementia', description: 'Määrittämätön dementia', treatmentGuidelines: 'Oireenmukainen hoito, tukipalvelut' },
  { code: 'F10', name: 'Alkoholiriippuvuus', category: 'F00-F99', subcategory: 'Päihteet', description: 'Alkoholin väärinkäyttö tai riippuvuus', treatmentGuidelines: 'Päihdehoito, katkaisu tarvittaessa, tuki' },
  { code: 'F11', name: 'Opioidiriippuvuus', category: 'F00-F99', subcategory: 'Päihteet', description: 'Opioidien väärinkäyttö tai riippuvuus', treatmentGuidelines: 'Korvaushoito (metadoni, buprenorfiini), tuki' },
  { code: 'F17', name: 'Tupakointiriippuvuus', category: 'F00-F99', subcategory: 'Päihteet', description: 'Tupakointiriippuvuus', treatmentGuidelines: 'Varenikliini, nikotiinikorvaushoito, tuki' },
  { code: 'F32', name: 'Masennusjakso', category: 'F00-F99', subcategory: 'Masennus', description: 'Masennusjakso ilman maniaa', treatmentGuidelines: 'SSRI (sertraliini, esitalopraami), psykoterapia' },
  { code: 'F33', name: 'Toistuva masennus', category: 'F00-F99', subcategory: 'Masennus', description: 'Toistuvat masennusjaksot', treatmentGuidelines: 'SSRI, psykoterapia, tarvittaessa mielialalääke' },
  { code: 'F41', name: 'Ahdistuneisuushäiriö', category: 'F00-F99', subcategory: 'Ahdistus', description: 'Yleistynyt ahdistuneisuus', treatmentGuidelines: 'SSRI, kognitiivinen käyttäytymisterapia' },
  { code: 'F43', name: 'Stressireaktio', category: 'F00-F99', subcategory: 'Stressi', description: 'Sovautumisreaktio vakavaan stressiin', treatmentGuidelines: 'Psykoterapia, oireenmukainen hoito' },
  { code: 'F84', name: 'Autismi', category: 'F00-F99', subcategory: 'Kehitys', description: 'Autismikirjon häiriö', treatmentGuidelines: 'Varhainen tuki, kuntoutus, oireenmukainen hoito' },
  { code: 'F90', name: 'ADHD', category: 'F00-F99', subcategory: 'Käyttäytyminen', description: 'Tarkkaavaisuus- ja ylivilkkaushäiriö', treatmentGuidelines: 'Metyylifenidaatti, atomoksetiini, kuntoutus' },
  
  // Hermosto (G00-G99)
  { code: 'G20', name: 'Parkinsonin tauti', category: 'G00-G99', subcategory: 'Liikehäiriöt', description: 'Parkinsonin tauti', treatmentGuidelines: 'Levodopa, dopamiiniagonisti, MAO-B-estäjä' },
  { code: 'G30', name: 'Alzheimerin tauti', category: 'G00-G99', subcategory: 'Muistisairaudet', description: 'Alzheimerin tauti', treatmentGuidelines: 'Asetyylikolinesteraasin estäjä, memantiini' },
  { code: 'G35', name: 'MS-tauti', category: 'G00-G99', subcategory: 'Demyelinisointi', description: 'Multippeliskleroosi', treatmentGuidelines: 'Immunomodulaattori, kortikosteroidi pahenemiseen' },
  { code: 'G40', name: 'Epilepsia', category: 'G00-G99', subcategory: 'Kohtaukset', description: 'Toistuvat epileptiset kohtaukset', treatmentGuidelines: 'Levetiratsepaami, karbamatsepiini, valproaatti' },
  { code: 'G43', name: 'Migreeni', category: 'G00-G99', subcategory: 'Päänsärky', description: 'Toistuva migreenikohtaus', treatmentGuidelines: 'Triptaani kohtaukseen, estolääkitys tarvittaessa' },
  { code: 'G44', name: 'Päänsärky', category: 'G00-G99', subcategory: 'Päänsärky', description: 'Muu päänsärky', treatmentGuidelines: 'Oireenmukainen hoito, taustasyyn hoito' },
  { code: 'G47', name: 'Unihäiriö', category: 'G00-G99', subcategory: 'Uni', description: 'Nukahtamis- tai unen ylläpito-ongelma', treatmentGuidelines: 'Unihygienia, melatoniini, tarvittaessa unilääke' },
  { code: 'G50', name: 'Kasvohermosärky', category: 'G00-G99', subcategory: 'Hermokivut', description: 'Trigeminusneuralgia', treatmentGuidelines: 'Karbamatsepiini, gabapentiini' },
  { code: 'G56', name: 'Rannekanavaoireyhtymä', category: 'G00-G99', subcategory: 'Puristus', description: 'N. medianus puristus ranteessa', treatmentGuidelines: 'Rannekisko, leikkaus tarvittaessa' },
  { code: 'G62', name: 'Perifeerinen neuropatia', category: 'G00-G99', subcategory: 'Hermot', description: 'Ääreishermovaurio', treatmentGuidelines: 'Taustasyyn hoito, kipulääke, fysioterapia' },
  
  // Hengityselimet (J00-J99)
  { code: 'J06', name: 'Ylähengitystieinfektio', category: 'J00-J99', subcategory: 'Infektiot', description: 'Virusperäinen nuha/kurkkukipu', treatmentGuidelines: 'Oireenmukainen hoito, lepo' },
  { code: 'J18', name: 'Keuhkokuume', category: 'J00-J99', subcategory: 'Infektiot', description: 'Keuhkojen bakteeri- tai virusinfektio', treatmentGuidelines: 'Antibiootti (amoksisilliini 1g 3x/vrk 7-10 pv)' },
  { code: 'J20', name: 'Akuutti bronkiitti', category: 'J00-J99', subcategory: 'Infektiot', description: 'Keuhkoputken tulehdus', treatmentGuidelines: 'Oireenmukainen hoito, antibiootti tarvittaessa' },
  { code: 'J40', name: 'Bronkiitti', category: 'J00-J99', subcategory: 'Krooninen', description: 'Krooninen keuhkoputkentulehdus', treatmentGuidelines: 'Keuhkolaajentaja, tarvittaessa kortikosteroidi' },
  { code: 'J44', name: 'COPD', category: 'J00-J99', subcategory: 'Krooninen', description: 'Krooninen obstruktiivinen keuhkosairaus', treatmentGuidelines: 'LAMA/LABA, kortikosteroidi, keuhkolaajentaja' },
  { code: 'J45', name: 'Astma', category: 'J00-J99', subcategory: 'Krooninen', description: 'Krooninen hengitysteiden tulehdus', treatmentGuidelines: 'ICS/LABA, tarvittaessa SABA, biologiset tarvittaessa' },
  { code: 'J80', name: 'Akuutti hengitysvajaus', category: 'J00-J99', subcategory: 'Vajaus', description: 'Akuutti hengitysvajausyhtymä', treatmentGuidelines: 'Happihoito, hengityslaite, taustasyyn hoito' },
  { code: 'J90', name: 'Pleuraeffuusio', category: 'J00-J99', subcategory: 'Pleura', description: 'Märkä keuhkopussinontelossa', treatmentGuidelines: 'Punktio, tarvittaessa pleuraontelon dreeni' },
  { code: 'J93', name: 'Keuhkolaajentuma', category: 'J00-J99', subcategory: 'Rakenne', description: 'Keuhkojen ilmalaajentuma', treatmentGuidelines: 'Hengityslaite tarvittaessa, pleurodesis' },
  { code: 'J96', name: 'Hengitysvajaus', category: 'J00-J99', subcategory: 'Vajaus', description: 'Hengityksen vajaatoiminta', treatmentGuidelines: 'Happihoito, ventilaatio, taustasyyn hoito' },
  
  // Ruuansulatus (K00-K93)
  { code: 'K02', name: 'Karies', category: 'K00-K93', subcategory: 'Hampaat', description: 'Hammasmätä', treatmentGuidelines: 'Paikkaus, tarvittaessa juurihoito tai poisto' },
  { code: 'K05', name: 'Ientulehdus', category: 'K00-K93', subcategory: 'Ien', description: 'Ientulehdus tai parodontiitti', treatmentGuidelines: 'Suun hygienia, tarvittaessa antibiootti' },
  { code: 'K08', name: 'Hampaan menetys', category: 'K00-K93', subcategory: 'Hampaat', description: 'Hampaan puutos', treatmentGuidelines: 'Proteesi, implantaatti tai silta' },
  { code: 'K21', name: 'Refluksitauti', category: 'K00-K93', subcategory: 'Refluksi', description: 'Mahahapon nousu ruokatorveen', treatmentGuidelines: 'PPI (omepratsoli 20mg), elintapamuutokset' },
  { code: 'K25', name: 'Mahahaava', category: 'K00-K93', subcategory: 'Haava', description: 'Mahalaukun limakalvohaava', treatmentGuidelines: 'PPI, H. pylori -hoito tarvittaessa' },
  { code: 'K29', name: 'Gastriitti', category: 'K00-K93', subcategory: 'Tulehdus', description: 'Mahalaukun limakalvotulehdus', treatmentGuidelines: 'PPI, elintapamuutokset' },
  { code: 'K30', name: 'Dyspepsia', category: 'K00-K93', subcategory: 'Oireet', description: 'Toiminnallinen dyspepsia', treatmentGuidelines: 'PPI, prokineetti, elintapamuutokset' },
  { code: 'K35', name: 'Akuutti appendisiitti', category: 'K00-K93', subcategory: 'Hätä', description: ' umpisuolen tulehdus', treatmentGuidelines: 'Leikkaus, antibiootti' },
  { code: 'K40', name: 'Nivustyrä', category: 'K00-K93', subcategory: 'Tyrä', description: 'Nivusen tyrä', treatmentGuidelines: 'Tyräleikkaus' },
  { code: 'K50', name: 'Crohnin tauti', category: 'K00-K93', subcategory: 'IBD', description: 'Crohnin tauti', treatmentGuidelines: 'Kortikosteroidi, immunosuppressio, biologiset' },
  { code: 'K51', name: 'Haavainen paksusuolentulehdus', category: 'K00-K93', subcategory: 'IBD', description: 'Koliitti', treatmentGuidelines: 'Mesalatsiini, kortikosteroidi, biologiset' },
  { code: 'K57', name: 'Paksusuolen divertikkeli', category: 'K00-K93', subcategory: 'Divertikkeli', description: 'Umpipussit paksusuolessa', treatmentGuidelines: 'Kuitu, antibioitti tulehdukseen' },
  { code: 'K59', name: 'Ummetus', category: 'K00-K93', subcategory: 'Toiminta', description: 'Krooninen ummetus', treatmentGuidelines: 'Kuitu, neste, laksatiivi tarvittaessa' },
  { code: 'K70', name: 'Alkoholimaksasairaus', category: 'K00-K93', subcategory: 'Maksa', description: 'Alkoholin aiheuttama maksasairaus', treatmentGuidelines: 'Abstinens, ravitsemus, tarvittaessa maksansiirto' },
  { code: 'K71', name: 'Myrkyllinen maksasairaus', category: 'K00-K93', subcategory: 'Maksa', description: 'Lääkkeiden tai myrkkyjen aiheuttama', treatmentGuidelines: 'Myrky pois, oireenmukainen hoito' },
  { code: 'K72', name: 'Maksan vajaatoiminta', category: 'K00-K93', subcategory: 'Maksa', description: 'Maksan toiminnan romahdus', treatmentGuidelines: 'Tuki, tarvittaessa maksansiirto' },
  { code: 'K74', name: 'Maksakirroosi', category: 'K00-K93', subcategory: 'Maksa', description: 'Maksan arpeutuminen', treatmentGuidelines: 'Taustasyyn hoito, komplikaatioiden ehkäisy' },
  { code: 'K80', name: 'Sappikivitauti', category: 'K00-K93', subcategory: 'Sappi', description: 'Sappikivet', treatmentGuidelines: 'Kolekystektomia, tarvittaessa ERC' },
  { code: 'K85', name: 'Haimatulehdus', category: 'K00-K93', subcategory: 'Haima', description: 'Akuutti tai krooninen haimatulehdus', treatmentGuidelines: 'Nesteytys, kipulääke, antibiootti tarvittaessa' },
  { code: 'K92', name: 'Verioksennus tai veriuloste', category: 'K00-K93', subcategory: 'Verenvuoto', description: 'Ylä- tai alasuoliston verenvuoto', treatmentGuidelines: 'Hätäendoskopia, verensiirto' },
  
  // Iho (L00-L99)
  { code: 'L03', name: 'Erysipelas', category: 'L00-L99', subcategory: 'Infektio', description: 'Märkärupi', treatmentGuidelines: 'Antibiootti (penisilliini)' },
  { code: 'L08', name: 'Ihon paise', category: 'L00-L99', subcategory: 'Infektio', description: 'Märkäkokoontuma ihossa', treatmentGuidelines: 'Inkaisuu, antibiootti' },
  { code: 'L20', name: 'Atooppinen ihottuma', category: 'L00-L99', subcategory: 'Dermatiitti', description: 'Atopiaan liittyvä ihottuma', treatmentGuidelines: 'Kortikosteroidivoide, emolentti, tarvittaessa systeeminen' },
  { code: 'L21', name: 'Seborroinen ihottuma', category: 'L00-L99', subcategory: 'Dermatiitti', description: 'Seborroinen ekseema', treatmentGuidelines: 'Ketokonatsoli, kortikosteroidi' },
  { code: 'L23', name: 'Allerginen kontaktidermatiitti', category: 'L00-L99', subcategory: 'Dermatiitti', description: 'Allerginen ihoreaktio', treatmentGuidelines: 'Allergenin välttäminen, kortikosteroidi' },
  { code: 'L25', name: 'Ärsytysdermatiitti', category: 'L00-L99', subcategory: 'Dermatiitti', description: 'Ärsytyksestä johtuva ihottuma', treatmentGuidelines: 'Ärsykkeen välttäminen, emolentti' },
  { code: 'L30', name: 'Nummulaarinen ekseema', category: 'L00-L99', subcategory: 'Dermatiitti', description: 'Kolikkomainen ihottuma', treatmentGuidelines: 'Kortikosteroidivoide, emolentti' },
  { code: 'L40', name: 'Psoriaasi', category: 'L00-L99', subcategory: 'Psoriaasi', description: 'Psoriaasi', treatmentGuidelines: 'Paikallishoito, fototerapia, systeeminen, biologiset' },
  { code: 'L50', name: 'Nokkosihottuma', category: 'L00-L99', subcategory: 'Urtikaria', description: 'Akuutti tai krooninen urtikaria', treatmentGuidelines: 'Antihistamiini, kortikosteroidi tarvittaessa' },
  { code: 'L53', name: 'Muut ihottumat', category: 'L00-L99', subcategory: 'Ihottuma', description: 'Määrittämätön ihottuma', treatmentGuidelines: 'Oireenmukainen hoito, taustasyyn selvitys' },
  { code: 'L60', name: 'Kynsisairaudet', category: 'L00-L99', subcategory: 'Kynnet', description: 'Kynsimuutokset', treatmentGuidelines: 'Taustasyyn hoito, paikallishoito' },
  { code: 'L70', name: 'Akne', category: 'L00-L99', subcategory: 'Akne', description: 'Finnit ja mustapäät', treatmentGuidelines: 'Retinoidi, antibiootti, tarvittaessa isotretinoiini' },
  { code: 'L72', name: 'Ihon rasvapatit', category: 'L00-L99', subcategory: 'Kasvaimet', description: 'Aterooma', treatmentGuidelines: 'Kirurginen poisto tarvittaessa' },
  { code: 'L82', name: 'Seborroinen keratoosi', category: 'L00-L99', subcategory: 'Kasvaimet', description: 'Hyvänlaatuinen ihokasvain', treatmentGuidelines: 'Kryohoito, poisto tarvittaessa' },
  { code: 'L85', name: 'Ihon kuivuus', category: 'L00-L99', subcategory: 'Iho', description: 'Kseroosi', treatmentGuidelines: 'Emolentti, kosteuttava voide' },
  { code: 'L97', name: 'Säärihaava', category: 'L00-L99', subcategory: 'Haava', description: 'Säären alueen haava', treatmentGuidelines: 'Kompressio, haavahoito, taustasyyn hoito' },
  { code: 'L98', name: 'Painehaava', category: 'L00-L99', subcategory: 'Haava', description: 'Paineesta johtuva haava', treatmentGuidelines: 'Paineenpoisto, haavahoito' },
  
  // Tuki- ja liikuntaelimistö (M00-M99)
  { code: 'M06', name: 'Reumatoiitti', category: 'M00-M99', subcategory: 'Reuma', description: 'Reumatoide nivelreuma', treatmentGuidelines: 'Metotreksaatti, biologiset, kortikosteroidi' },
  { code: 'M10', name: 'Kihti', category: 'M00-M99', subcategory: 'Kihti', description: 'Virtsahappokihti', treatmentGuidelines: 'Kolkiisiini, NSAID, allopurinoli estoon' },
  { code: 'M13', name: 'Muu nivelreuma', category: 'M00-M99', subcategory: 'Reuma', description: 'Määrittämätön nivelreuma', treatmentGuidelines: 'NSAID, kortikosteroidi, tarvittaessa DMARD' },
  { code: 'M15', name: 'Polvinivelen nivelrikko', category: 'M00-M99', subcategory: 'Nivelrikko', description: 'Polven nivelrikko', treatmentGuidelines: 'Parasetamoli, NSAID, fysioterapia, tarvittaessa tekonivel' },
  { code: 'M16', name: 'Lonkanivelrikko', category: 'M00-M99', subcategory: 'Nivelrikko', description: 'Lonkan nivelrikko', treatmentGuidelines: 'Parasetamoli, NSAID, fysioterapia, tarvittaessa tekonivel' },
  { code: 'M17', name: 'Polvinivelen nivelrikko', category: 'M00-M99', subcategory: 'Nivelrikko', description: 'Polven nivelrikko', treatmentGuidelines: 'Parasetamoli, NSAID, fysioterapia' },
  { code: 'M23', name: 'Polvinivelen sisäinen häiriö', category: 'M00-M99', subcategory: 'Polvi', description: 'Polvinivelen sisäinen vaurio', treatmentGuidelines: 'Fysioterapia, tarvittaessa artroskopia' },
  { code: 'M25', name: 'Nivelen kipu', category: 'M00-M99', subcategory: 'Kipu', description: 'Nivelkipu ilman selvää syytä', treatmentGuidelines: 'Parasetamoli, NSAID, fysioterapia' },
  { code: 'M32', name: 'SLE', category: 'M00-M99', subcategory: 'Systeeminen', description: 'Systeeminen lupus erythematosus', treatmentGuidelines: 'Kortikosteroidi, immunosuppressio, hydroksiklorokiini' },
  { code: 'M35', name: 'Sjögrenin oireyhtymä', category: 'M00-M99', subcategory: 'Systeeminen', description: 'Kuiva suu ja silmät', treatmentGuidelines: 'Oireenmukainen hoito, tarvittaessa immunosuppressio' },
  { code: 'M45', name: 'Ankylosoiva spondylartriitti', category: 'M00-M99', subcategory: 'Selkä', description: 'Selkärankareuma', treatmentGuidelines: 'NSAID, fysioterapia, biologiset' },
  { code: 'M47', name: 'Selkärangan rappeuma', category: 'M00-M99', subcategory: 'Selkä', description: 'Spondyloosi', treatmentGuidelines: 'Kipulääke, fysioterapia, tarvittaessa leikkaus' },
  { code: 'M48', name: 'Selkärangan stenoosi', category: 'M00-M99', subcategory: 'Selkä', description: 'Selkärangan ahtauma', treatmentGuidelines: 'Kipulääke, fysioterapia, tarvittaessa leikkaus' },
  { code: 'M51', name: 'Nikamavälilevyn rappeuma', category: 'M00-M99', subcategory: 'Selkä', description: 'Välilevyrappeuma', treatmentGuidelines: 'Kipulääke, fysioterapia, tarvittaessa leikkaus' },
  { code: 'M54', name: 'Selkäkipu', category: 'M00-M99', subcategory: 'Selkä', description: 'Määrittämätön selkäkipu', treatmentGuidelines: 'Kipulääke, liikunta, fysioterapia' },
  { code: 'M62', name: 'Lihassairaudet', category: 'M00-M99', subcategory: 'Lihakset', description: 'Lihassairaudet', treatmentGuidelines: 'Fysioterapia, tarvittaessa lääkehoito' },
  { code: 'M70', name: 'Pehmytkudoksen sairaudet', category: 'M00-M99', subcategory: 'Pehmytkudos', description: 'Pehmytkudosvaivat', treatmentGuidelines: 'Fysioterapia, kipulääke' },
  { code: 'M71', name: 'Bursiitti', category: 'M00-M99', subcategory: 'Pussi', description: 'Limapussin tulehdus', treatmentGuidelines: 'Lepo, kipulääke, tarvittaessa puhkaisu' },
  { code: 'M75', name: 'Olkanivelen kiertäjäkalvosin', category: 'M00-M99', subcategory: 'Olkapää', description: 'Kiertäjäkalvosinvaurio', treatmentGuidelines: 'Fysioterapia, tarvittaessa leikkaus' },
  { code: 'M77', name: 'Epikondyliitti', category: 'M00-M99', subcategory: 'Kyynärpää', description: 'Tenniskyynärpää tai golfkyynärpää', treatmentGuidelines: 'Lepo, fysioterapia, kortikosteroidipiikki' },
  { code: 'M79', name: 'Pehmytkudoskipu', category: 'M00-M99', subcategory: 'Kipu', description: 'Määrittämätön pehmytkudoskipu', treatmentGuidelines: 'Kipulääke, fysioterapia' },
  { code: 'M80', name: 'Osteoporoosin aiheuttama murtuma', category: 'M00-M99', subcategory: 'Luusto', description: 'Murtuma osteoporoosista', treatmentGuidelines: 'Murtuman hoito, osteoporoosilääkitys' },
  { code: 'M81', name: 'Osteoporoosi', category: 'M00-M99', subcategory: 'Luusto', description: 'Luukato', treatmentGuidelines: 'Kalsium, D-vitamiini, bisfosfonaatti' },
  { code: 'M84', name: 'Murtuma', category: 'M00-M99', subcategory: 'Murtuma', description: 'Luunmurtuma', treatmentGuidelines: 'Immobilisaatio, tarvittaessa leikkaus' },
  { code: 'M89', name: 'Luun sairaudet', category: 'M00-M99', subcategory: 'Luusto', description: 'Muut luusairaudet', treatmentGuidelines: 'Taustasyyn hoito' },
  
  // Virtsa- ja sukupuolielimet (N00-N99)
  { code: 'N03', name: 'Krooninen glomerulonefriitti', category: 'N00-N99', subcategory: 'Munuaiset', description: 'Krooninen munuaistulehdus', treatmentGuidelines: 'ACE-estäjä, tarvittaessa immunosuppressio' },
  { code: 'N10', name: 'Akuutti pyelonefriitti', category: 'N00-N99', subcategory: 'Tulehdus', description: 'Munuaistulehdus', treatmentGuidelines: 'Antibiootti (ciprofloksasiini) 7-14 pv' },
  { code: 'N11', name: 'Krooninen pyelonefriitti', category: 'N00-N99', subcategory: 'Tulehdus', description: 'Krooninen munuaistulehdus', treatmentGuidelines: 'Pitkä antibioottikuuri, taustasyyn hoito' },
  { code: 'N17', name: 'Akuutti munuaisvajaatoiminta', category: 'N00-N99', subcategory: 'Vajaatoiminta', description: 'Munuaisten äkillinen toiminnan heikkeneminen', treatmentGuidelines: 'Nesteytys, dialyysi tarvittaessa' },
  { code: 'N18', name: 'Krooninen munuaissairaus', category: 'N00-N99', subcategory: 'Vajaatoiminta', description: 'Krooninen munuaisvajaatoiminta', treatmentGuidelines: 'ACE-estäjä, ravitsemus, dialyysi tarvittaessa' },
  { code: 'N20', name: 'Munuaiskivitauti', category: 'N00-N99', subcategory: 'Kivet', description: 'Munuaiskivet', treatmentGuidelines: 'Kipulääke, neste, tarvittaessa murtaminen' },
  { code: 'N30', name: 'Rakkotulehdus', category: 'N00-N99', subcategory: 'Tulehdus', description: 'Virtsarakon tulehdus', treatmentGuidelines: 'Antibiootti (nitrofurantoiini 3-7 pv)' },
  { code: 'N39', name: 'Virtsatieinfektio', category: 'N00-N99', subcategory: 'Infektio', description: 'Määrittämätön virtsatieinfektio', treatmentGuidelines: 'Antibiootti' },
  { code: 'N40', name: 'Eturauhasen liikakasvu', category: 'N00-N99', subcategory: 'Eturauhanen', description: 'Hyvänlaatuinen eturauhasen liikakasvu', treatmentGuidelines: 'Alfa-salpaaja, 5-alfa-reduktaasin estäjä' },
  { code: 'N41', name: 'Eturauhastulehdus', category: 'N00-N99', subcategory: 'Eturauhanen', description: 'Eturauhasen tulehdus', treatmentGuidelines: 'Antibiootti (flurokinoloni) 4-6 vkoa' },
  { code: 'N45', name: 'Kivestulehdus', category: 'N00-N99', subcategory: 'Tulehdus', description: 'Orkiitti tai epididymiitti', treatmentGuidelines: 'Antibiootti, lepo, kylmä' },
  { code: 'N48', name: 'Peniksen sairaudet', category: 'N00-N99', subcategory: 'Penis', description: 'Peniksen sairaudet', treatmentGuidelines: 'Taustasyyn hoito' },
  { code: 'N64', name: 'Rintavaivat', category: 'N00-N99', subcategory: 'Rinta', description: 'Rintojen kipu tai muutokset', treatmentGuidelines: 'Tutkimukset, oireenmukainen hoito' },
  { code: 'N76', name: 'Emättimen tulehdus', category: 'N00-N99', subcategory: 'Tulehdus', description: 'Emättimen tulehdus', treatmentGuidelines: 'Paikallishoito, tarvittaessa antibiootti' },
  { code: 'N80', name: 'Endometrioosi', category: 'N00-N99', subcategory: 'Endometrioosi', description: 'Kohdun limakalvon kasvu kohdunulkopuolella', treatmentGuidelines: 'Hormonaalinen hoito, tarvittaessa leikkaus' },
  { code: 'N81', name: 'Emättimen laskeuma', category: 'N00-N99', subcategory: 'Laskeuma', description: 'Emättimen seinämän heikkous', treatmentGuidelines: 'Pessaari, tarvittaessa leikkaus' },
  { code: 'N83', name: 'Munasarjan kysta', category: 'N00-N99', subcategory: 'Kysta', description: 'Munasarjan rakkula', treatmentGuidelines: 'Seuranta, tarvittaessa leikkaus' },
  { code: 'N84', name: 'Kohdun polyyppi', category: 'N00-N99', subcategory: 'Polyyppi', description: 'Kohdun limakalvon kasvain', treatmentGuidelines: 'Polypektomia' },
  { code: 'N85', name: 'Kohdun limakalvon sairaudet', category: 'N00-N99', subcategory: 'Kohdun limakalvo', description: 'Kohdun limakalvon muutokset', treatmentGuidelines: 'Hormonaalinen hoito, tarvittaessa kaavinta' },
  { code: 'N92', name: 'Epäsäännölliset kuukautiset', category: 'N00-N99', subcategory: 'Kuukautiset', description: 'Kuukautishäiriöt', treatmentGuidelines: 'Hormonaalinen hoito, taustasyyn selvitys' },
  { code: 'N93', name: 'Vuoto emättimestä', category: 'N00-N99', subcategory: 'Vuoto', description: 'Epänormaali vuoto', treatmentGuidelines: 'Tutkimukset, hoito syyn mukaan' },
  { code: 'N94', name: 'Kivuliaat kuukautiset', category: 'N00-N99', subcategory: 'Kipu', description: 'Dysmenorrea', treatmentGuidelines: 'NSAID, hormonaalinen ehkäisy' },
  { code: 'N95', name: 'Vaihdevuosioireet', category: 'N00-N99', subcategory: 'Vaihdevuodet', description: 'Vaihdevuosivaivat', treatmentGuidelines: 'Estrogeeni, tarvittaessa keltarauhashormoni' },
  
  // Oireet ja poikkeavuudet (R00-R99)
  { code: 'R05', name: 'Yskä', category: 'R00-R99', subcategory: 'Yskä', description: 'Yskä ilman selvää syytä', treatmentGuidelines: 'Taustasyyn selvitys, oireenmukainen hoito' },
  { code: 'R06', name: 'Hengenahdistus', category: 'R00-R99', subcategory: 'Hengitys', description: 'Dyspnea', treatmentGuidelines: 'Taustasyyn hoito, happihoito' },
  { code: 'R07', name: 'Rintakipu', category: 'R00-R99', subcategory: 'Kipu', description: 'Rintakipu ilman selvää syytä', treatmentGuidelines: 'Hätä-EKG, troponiini, taustasyyn selvitys' },
  { code: 'R10', name: 'Vatsakipu', category: 'R00-R99', subcategory: 'Kipu', description: 'Vatsakipu ilman selvää syytä', treatmentGuidelines: 'Taustasyyn selvitys, kipulääke' },
  { code: 'R11', name: 'Pahoinvointi ja oksentelu', category: 'R00-R99', subcategory: 'Pahoinvointi', description: 'Pahoinvointi ja/tai oksentelu', treatmentGuidelines: 'Antiemetti, nesteytys' },
  { code: 'R17', name: 'Keltaisuus', category: 'R00-R99', subcategory: 'Keltainen', description: 'Icterus', treatmentGuidelines: 'Taustasyyn selvitys (maksan toiminta, ultra)' },
  { code: 'R21', name: 'Ihomuutos', category: 'R00-R99', subcategory: 'Iho', description: 'Ihomuutos ilman diagnoosia', treatmentGuidelines: 'Dermatoskopia, tarvittaessa koepala' },
  { code: 'R22', name: 'Patti', category: 'R00-R99', subcategory: 'Patti', description: 'Ihon tai ihonalaisen kudosmassa', treatmentGuidelines: 'Ultra, tarvittaessa koepala' },
  { code: 'R25', name: 'Tärinä', category: 'R00-R99', subcategory: 'Tärinä', description: 'Tremor', treatmentGuidelines: 'Taustasyyn selvitys' },
  { code: 'R26', name: 'Kävelyhäiriö', category: 'R00-R99', subcategory: 'Kävely', description: 'Ataksia tai muu kävelyhäiriö', treatmentGuidelines: 'Neurologinen tutkimus, kuvantaminen' },
  { code: 'R30', name: 'Virtsaamisvaivat', category: 'R00-R99', subcategory: 'Virtsaaminen', description: 'Dysuria, inkontinenssi', treatmentGuidelines: 'Virtsaviljely, ultra, taustasyyn hoito' },
  { code: 'R42', name: 'Huimaus', category: 'R00-R99', subcategory: 'Huimaus', description: 'Pyörrytys tai huimaus', treatmentGuidelines: 'Taustasyyn selvitys (verenpaine, EKG, veriarvot)' },
  { code: 'R50', name: 'Kuume', category: 'R00-R99', subcategory: 'Kuume', description: 'Kuume ilman selvää syytä', treatmentGuidelines: 'Infektiotutkimukset, kuvantaminen tarvittaessa' },
  { code: 'R51', name: 'Päänsärky', category: 'R00-R99', subcategory: 'Päänsärky', description: 'Päänsärky ilman selvää syytä', treatmentGuidelines: 'Neurologinen tutkimus, tarvittaessa kuvantaminen' },
  { code: 'R52', name: 'Kipu', category: 'R00-R99', subcategory: 'Kipu', description: 'Kipu ilman selvää syytä', treatmentGuidelines: 'Kipulääke, taustasyyn selvitys' },
  { code: 'R53', name: 'Väsymys', category: 'R00-R99', subcategory: 'Väsymys', description: 'Väsymys ja heikkous', treatmentGuidelines: 'Perustutkimukset (veriarvot, kilpirauhanen)' },
  { code: 'R54', name: 'Vanhuuden heikkous', category: 'R00-R99', subcategory: 'Vanhuus', description: 'Frailty', treatmentGuidelines: 'Kokonaisvaltainen arvio, kuntoutus' },
  { code: 'R55', name: 'Pyörtyminen', category: 'R00-R99', subcategory: 'Pyörtyminen', description: 'Syncope', treatmentGuidelines: 'EKG, verenpaine, tarvittaessa sydäntutkimukset' },
  { code: 'R56', name: 'Kouristus', category: 'R00-R99', subcategory: 'Kouristus', description: 'Konvulsio', treatmentGuidelines: 'Neurologinen tutkimus, EEG, kuvantaminen' },
  { code: 'R57', name: 'Sokki', category: 'R00-R99', subcategory: 'Sokki', description: 'Verenkierron romahdus', treatmentGuidelines: 'Hätähoito, nesteytys, taustasyyn hoito' },
  { code: 'R58', name: 'Verenvuoto', category: 'R00-R99', subcategory: 'Vuoto', description: 'Verenvuoto ilman selvää syytä', treatmentGuidelines: 'Hätähoito, vuodon lähde' },
  { code: 'R60', name: 'Turvotus', category: 'R00-R99', subcategory: 'Turvotus', description: 'Edema', treatmentGuidelines: 'Taustasyyn selvitys (sydän, munuaiset, maksa)' },
  { code: 'R63', name: 'Ravitsemushäiriö', category: 'R00-R99', subcategory: 'Ravitsemus', description: 'Painonmuutos tai ruokahalun muutos', treatmentGuidelines: 'Ravitsemusarvio, taustasyyn selvitys' },
  { code: 'R73', name: 'Kohonnut verensokeri', category: 'R00-R99', subcategory: 'Verensokeri', description: 'Hyperglykemia', treatmentGuidelines: 'Diabetestutkimukset' },
  { code: 'R91', name: 'Keuhkolöydös', category: 'R00-R99', subcategory: 'Keuhko', description: 'Röntgenlöydös keuhkoissa', treatmentGuidelines: 'Jatkotutkimukset' },
  { code: 'R94', name: 'Poikkeava laboratoriolöydös', category: 'R00-R99', subcategory: 'Laboratorio', description: 'Abnormaali labratulos', treatmentGuidelines: 'Tuloksen tulkinta, tarvittaessa jatkotutkimukset' },
  
  // Tapaturmat ja myrkytykset (S00-T98)
  { code: 'S00', name: 'Pään pintavamma', category: 'S00-T98', subcategory: 'Pää', description: 'Haava, ruhje tai naarmu päässä', treatmentGuidelines: 'Haavanhoito, tarvittaessa tikit' },
  { code: 'S01', name: 'Pään avoin haava', category: 'S00-T98', subcategory: 'Pää', description: 'Avoin haava päässä', treatmentGuidelines: 'Haavanpuhdistus, tikit, tetanus' },
  { code: 'S02', name: 'Pääkallon murtuma', category: 'S00-T98', subcategory: 'Pää', description: 'Kallon luunmurtuma', treatmentGuidelines: 'Kuvantaminen, neurokirurgi tarvittaessa' },
  { code: 'S06', name: 'Aivovamma', category: 'S00-T98', subcategory: 'Pää', description: 'Aivotärähdys tai contusio', treatmentGuidelines: 'Tarkkailu, kuvantaminen tarvittaessa' },
  { code: 'S09', name: 'Pään vamma', category: 'S00-T98', subcategory: 'Pää', description: 'Määrittämätön päävamma', treatmentGuidelines: 'Tarkkailu, tarvittaessa kuvantaminen' },
  { code: 'S22', name: 'Rintakehän murtuma', category: 'S00-T98', subcategory: 'Rintakehä', description: 'Kylkiluun tai rintalastan murtuma', treatmentGuidelines: 'Kipulääke, hengitysharjoitukset' },
  { code: 'S32', name: 'Lantion murtuma', category: 'S00-T98', subcategory: 'Lantio', description: 'Lantion luunmurtuma', treatmentGuidelines: 'Immobilisaatio, tarvittaessa leikkaus' },
  { code: 'S42', name: 'Olkanivelen murtuma', category: 'S00-T98', subcategory: 'Olkapää', description: 'Olkaluun murtuma', treatmentGuidelines: 'Immobilisaatio, tarvittaessa leikkaus' },
  { code: 'S52', name: 'Kyynärvarren murtuma', category: 'S00-T98', subcategory: 'Kyynärvarsi', description: 'Kyynärvarren luunmurtuma', treatmentGuidelines: 'Kipsi, tarvittaessa leikkaus' },
  { code: 'S62', name: 'Ranteen ja käden murtuma', category: 'S00-T98', subcategory: 'Käsi', description: 'Ranteen tai käden luunmurtuma', treatmentGuidelines: 'Kipsi, tarvittaessa leikkaus' },
  { code: 'S72', name: 'Reisiluun murtuma', category: 'S00-T98', subcategory: 'Reisi', description: 'Reisiluun murtuma', treatmentGuidelines: 'Leikkaus, tekonivel tarvittaessa' },
  { code: 'S82', name: 'Säären murtuma', category: 'S00-T98', subcategory: 'Sääri', description: 'Säären luunmurtuma', treatmentGuidelines: 'Kipsi, tarvittaessa leikkaus' },
  { code: 'S92', name: 'Jalkaterän murtuma', category: 'S00-T98', subcategory: 'Jalka', description: 'Jalkaterän luunmurtuma', treatmentGuidelines: 'Kipsi, tarvittaessa leikkaus' },
  { code: 'T07', name: 'Monivamma', category: 'S00-T98', subcategory: 'Monivamma', description: 'Useiden kehon alueiden vamma', treatmentGuidelines: 'Traumatiimi, ATLS' },
  { code: 'T14', name: 'Määrittämätön vamma', category: 'S00-T98', subcategory: 'Vamma', description: 'Vamma ilman tarkempaa määrittelyä', treatmentGuidelines: 'Tutkimukset, oireenmukainen hoito' },
  { code: 'T36', name: 'Lääkemyrkytys', category: 'S00-T98', subcategory: 'Myrkytys', description: 'Lääkkeiden yliannostus', treatmentGuidelines: 'Myrkytyskeskus, vastalääke tarvittaessa' },
  { code: 'T40', name: 'Huume- tai lääkemykkytys', category: 'S00-T98', subcategory: 'Myrkytys', description: 'Huumeiden yliannostus', treatmentGuidelines: 'Naloksoni tarvittaessa, tuki' },
  { code: 'T51', name: 'Alkoholimyrkytys', category: 'S00-T98', subcategory: 'Myrkytys', description: 'Akuutti alkoholimyrkytys', treatmentGuidelines: 'Tarkkailu, nesteytys, tuki' },
  { code: 'T65', name: 'Myrkytys', category: 'S00-T98', subcategory: 'Myrkytys', description: 'Määrittämätön myrkytys', treatmentGuidelines: 'Myrkytyskeskus, vastalääke' },
  { code: 'T67', name: 'Lämpöhalvaus', category: 'S00-T98', subcategory: 'Lämpö', description: 'Heat stroke', treatmentGuidelines: 'Nopea jäähdytys, nesteytys, teho' },
  { code: 'T69', name: 'Kylmettyminen', category: 'S00-T98', subcategory: 'Kylmä', description: 'Hypotermia', treatmentGuidelines: 'Varovainen lämmitys, nesteytys' },
  { code: 'T71', name: 'Tukehtuminen', category: 'S00-T98', subcategory: 'Tukehtuminen', description: 'Asphyxia', treatmentGuidelines: 'Hengityksen palauttaminen, happi' },
  { code: 'T74', name: 'Pahoinpitely', category: 'S00-T98', subcategory: 'Väkivalta', description: 'Pahoinpitelyn aiheuttama vamma', treatmentGuidelines: 'Vammojen hoito, ilmoitusvelvollisuus' },
  { code: 'T75', name: 'Sähköisku', category: 'S00-T98', subcategory: 'Sähkö', description: 'Sähköiskun aiheuttama vamma', treatmentGuidelines: 'EKG, sydänseuranta' },
  { code: 'T78', name: 'Anafylaksia', category: 'S00-T98', subcategory: 'Allergia', description: 'Vaikea allerginen reaktio', treatmentGuidelines: 'Adrenaliini, kortikosteroidi, antihistamiini' },
  { code: 'T79', name: 'Veren hyytymishäiriö', category: 'S00-T98', subcategory: 'Hyytyminen', description: 'DIC vamman yhteydessä', treatmentGuidelines: 'Taustasyyn hoito, verituotteet' },
  { code: 'T81', name: 'Toimenpiteen komplikaatio', category: 'S00-T98', subcategory: 'Komplikaatio', description: 'Leikkauksen tai toimenpiteen jälkeinen komplikaatio', treatmentGuidelines: 'Komplikaation hoito' },
  { code: 'T88', name: 'Anestesiakomplikaatio', category: 'S00-T98', subcategory: 'Komplikaatio', description: 'Anestesiaan liittyvä komplikaatio', treatmentGuidelines: 'Tuki, tarvittaessa jatkohoito' },
];

// Hae diagnoosit kategorian mukaan
export function getDiagnosesByCategory(categoryId: string): DiagnosisData[] {
  return diagnoses.filter(d => d.category === categoryId);
}

// Hae diagnoosi koodin mukaan
export function getDiagnosisByCode(code: string): DiagnosisData | undefined {
  return diagnoses.find(d => d.code === code);
}

// Hae diagnoosit hakusanalla
export function searchDiagnoses(query: string): DiagnosisData[] {
  const lowerQuery = query.toLowerCase();
  return diagnoses.filter(d => 
    d.code.toLowerCase().includes(lowerQuery) ||
    d.name.toLowerCase().includes(lowerQuery) ||
    d.description?.toLowerCase().includes(lowerQuery)
  );
}
