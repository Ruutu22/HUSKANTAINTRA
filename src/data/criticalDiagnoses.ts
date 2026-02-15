// Critical diagnoses requiring double verification/approval

export const CRITICAL_DIAGNOSES = [
  // Cancers (C00-D48)
  { code: 'C00-C97', name: 'Kasvain', severity: 'critical' },
  { code: 'C34', name: 'Keuhkosyöpä', severity: 'critical' },
  { code: 'C50', name: 'Rintasyöpä', severity: 'critical' },
  { code: 'C80', name: 'Määrittelemätön kasvain', severity: 'critical' },
  
  // Severe cardiovascular events (I21, I63)
  { code: 'I21', name: 'Akuutti sydäninfarkti', severity: 'critical' },
  { code: 'I63', name: 'Aivoinfarkti', severity: 'critical' },
  { code: 'I60', name: 'Subarachnoidaalinen verenvuoto', severity: 'critical' },
  { code: 'I64', name: 'Aivoverenkiertohäiriö', severity: 'critical' },
  
  // Severe infections
  { code: 'A01', name: 'Lavantauti', severity: 'critical' },
  { code: 'A02', name: 'Muut salmonella-tartunnat', severity: 'critical' },
  { code: 'B20', name: 'HIV-infektio', severity: 'critical' },
  
  // Severe organ failures
  { code: 'I50.9', name: 'Sydämen vajaatoiminta (akuutti)', severity: 'critical' },
  { code: 'J96', name: 'Hengitysvajaus', severity: 'critical' },
  { code: 'N17', name: 'Äkillinen munuaisten vajaatoiminta', severity: 'critical' },
  { code: 'K72', name: 'Maksan vajaatoiminta', severity: 'critical' },
  
  // Poisonings
  { code: 'T36-T50', name: 'Myrkytys', severity: 'critical' },
  
  // Severe psychiatric conditions
  { code: 'F20', name: 'Skitsofrenia', severity: 'high' },
  { code: 'F31', name: 'Kahden napaisuus', severity: 'high' },
  { code: 'F32', name: 'Masennustila', severity: 'moderate' },
];

export function isCriticalDiagnosis(code: string, name: string): { isCritical: boolean; severity: string } {
  // Check if diagnosis code or name matches critical list
  const match = CRITICAL_DIAGNOSES.find(cd => 
    code.toUpperCase().includes(cd.code.toUpperCase()) || 
    name.toLowerCase().includes(cd.name.toLowerCase())
  );
  
  if (match) {
    return {
      isCritical: match.severity === 'critical',
      severity: match.severity
    };
  }
  
  return {
    isCritical: false,
    severity: 'normal'
  };
}

export function getCriticalityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getCriticalityLabel(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🔴 KRIITTINEN - Vaaditaan hyväksyntä';
    case 'high':
      return '🟠 KORKEA - Suositeltava hyväksyntä';
    case 'moderate':
      return '🟡 KOHTALAINEN - Ilmoitettava';
    default:
      return '⚪ Normaali';
  }
}
