import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AllergyAlertsProps {
  allergyWarnings: string[];
  interactionWarnings: Array<{
    medication: string;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
  }>;
}

export function AllergyAlerts({ allergyWarnings, interactionWarnings }: AllergyAlertsProps) {
  if (allergyWarnings.length === 0 && interactionWarnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Allergy Warnings */}
      {allergyWarnings.length > 0 && (
        <Alert className="bg-red-50 border-red-300">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>🔴 ALLERGIAVAROITUS:</strong> Potilaalla on allergia seuraaviin ainesosiin:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              {allergyWarnings.map((allergy, idx) => (
                <li key={idx} className="text-red-700">{allergy}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Interaction Warnings */}
      {interactionWarnings.length > 0 && (
        <Alert className={`${
          interactionWarnings.some(i => i.severity === 'severe')
            ? 'bg-orange-50 border-orange-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <AlertTriangle className={`h-4 w-4 ${
            interactionWarnings.some(i => i.severity === 'severe')
              ? 'text-orange-600'
              : 'text-yellow-600'
          }`} />
          <AlertDescription className={
            interactionWarnings.some(i => i.severity === 'severe')
              ? 'text-orange-800'
              : 'text-yellow-800'
          }>
            <strong>⚠️ LÄÄKEINTERAKTIOITA:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-2">
              {interactionWarnings.map((interaction, idx) => (
                <li key={idx}>
                  <strong>{interaction.medication}</strong>
                  <span className={`ml-2 font-bold ${
                    interaction.severity === 'severe'
                      ? 'text-red-700'
                      : interaction.severity === 'moderate'
                      ? 'text-orange-700'
                      : 'text-yellow-700'
                  }`}>
                    {interaction.severity === 'severe' ? '🔴 KRIITTINEN' : interaction.severity === 'moderate' ? '🟠 KOHTALAINEN' : '🟡 LIEVÄ'}
                  </span>
                  <p className="text-sm mt-1">{interaction.description}</p>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
