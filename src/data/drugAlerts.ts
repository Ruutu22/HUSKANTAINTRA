// Medication interactions and allergy information

export const MEDICATION_ALLERGIES: Record<string, string[]> = {
  'Aspiriini': ['Salisylaatit', 'NSAID-lääkkeet'],
  'Ibuprofeeni': ['NSAID-lääkkeet', 'Aspiriini'],
  'Parasetamoli': ['Parasetamoli-rikkonaiset yhdisteet'],
  'Penisillini': ['Beeta-laktaami-antibiotika', 'Kefalosporiinit'],
  'Amoksisillini': ['Beeta-laktaami-antibiotika', 'Penisillini'],
  'Sulfonamidi': ['Sulfonamidi-antibiotika'],
  'Kodeiini': ['Opioidit'],
  'Morfiini': ['Opioidit'],
  'Finasteri': ['DHT-salpaajat'],
  'Enalapriili': ['ACE-estäjät'],
};

export const DRUG_INTERACTIONS: Array<{
  drug1: string;
  drug2: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
}> = [
  {
    drug1: 'Aspiriini',
    drug2: 'Ibuprofeeni',
    severity: 'severe',
    description: 'Molemmat ovat NSAID-lääkkeitä. Yhteisvaikutus lisää mahahaavan riskiä.',
  },
  {
    drug1: 'Metoprololi',
    drug2: 'Verapamiili',
    severity: 'severe',
    description: 'Molemmat vaikuttavat sydämen rytmiin. Voi aiheuttaa bradykardiaa.',
  },
  {
    drug1: 'Warfariini',
    drug2: 'Aspiriini',
    severity: 'severe',
    description: 'Kummalliset veren ohentajat. Lisää verenvuodon riskiä.',
  },
  {
    drug1: 'Simvastatiini',
    drug2: 'Erytromysiini',
    severity: 'moderate',
    description: 'Voi nostaa simvastatiinitasoja liian korkeaksi.',
  },
  {
    drug1: 'Metformiini',
    drug2: 'Radiografinen kontrastaine',
    severity: 'moderate',
    description: 'Vaaraa laktaattiastidoosille. Vältettävä.',
  },
  {
    drug1: 'Lisinopriili',
    drug2: 'Kaliumpillerit',
    severity: 'moderate',
    description: 'Molemmat nostavat kaliumia. Tulee seurata..',
  },
  {
    drug1: 'Fluvoksaimiini',
    drug2: 'Pimozidi',
    severity: 'severe',
    description: 'Vaaraa QT-pitenemiselle ja sydänrytmin häiriöille.',
  },
  {
    drug1: 'Kodeiini',
    drug2: 'MAO-estäjät',
    severity: 'severe',
    description: 'Vaaraa serotooninoireyhtymälle.',
  },
];

export function checkDrugAllergies(medication: string, allergyList: string[]): string[] {
  const allergies: string[] = [];
  
  for (const [drug, allergyGroups] of Object.entries(MEDICATION_ALLERGIES)) {
    if (medication.toLowerCase().includes(drug.toLowerCase()) || 
        drug.toLowerCase().includes(medication.toLowerCase())) {
      // Check if patient has any of these allergies
      const matchedAllergies = allergyGroups.filter(ag => 
        allergyList.some(pa => pa.toLowerCase().includes(ag.toLowerCase()))
      );
      allergies.push(...matchedAllergies);
    }
  }
  
  return [...new Set(allergies)]; // Remove duplicates
}

export function checkDrugInteractions(currentMedications: string[], newMedication: string): Array<{
  medication: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
}> {
  const interactions = [];
  
  for (const currentMed of currentMedications) {
    const interaction = DRUG_INTERACTIONS.find(i =>
      (i.drug1.toLowerCase().includes(currentMed.toLowerCase()) &&
       i.drug2.toLowerCase().includes(newMedication.toLowerCase())) ||
      (i.drug1.toLowerCase().includes(newMedication.toLowerCase()) &&
       i.drug2.toLowerCase().includes(currentMed.toLowerCase()))
    );
    
    if (interaction) {
      interactions.push({
        medication: currentMed,
        severity: interaction.severity,
        description: interaction.description,
      });
    }
  }
  
  return interactions;
}
