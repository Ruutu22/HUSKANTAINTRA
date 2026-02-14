import { useState } from 'react';
import { usePatients } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PatientRegistrationPageProps {
  onRegistered: () => void;
}

export function PatientRegistrationPage({ onRegistered }: PatientRegistrationPageProps) {
  const { patients, addPatient } = usePatients();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseases, setDiseases] = useState('');

  const calculateAge = (birthDateStr: string): number => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!firstName.trim() || !lastName.trim() || !birthDate) {
        setError('Täytä kaikki pakolliset kentät (nimi ja syntymäaika)');
        setIsLoading(false);
        return;
      }

      const birthDateObj = new Date(birthDate);
      if (isNaN(birthDateObj.getTime())) {
        setError('Virheellinen syntymäaika');
        setIsLoading(false);
        return;
      }

      const age = calculateAge(birthDate);
      if (age < 0 || age > 150) {
        setError('Syntymäaika on virheellinen');
        setIsLoading(false);
        return;
      }

      // Tarkistetaan ettei samanniminen potilas ole jo olemassa
      const existingPatient = patients.find(
        p => p.firstName.toLowerCase() === firstName.trim().toLowerCase() && 
             p.lastName.toLowerCase() === lastName.trim().toLowerCase() &&
             p.birthDate === birthDate
      );

      if (existingPatient) {
        setError('Potilas samanniminen potilaan kanssa on jo rekisteröity');
        setIsLoading(false);
        return;
      }

      const patientId = addPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDateObj,
        age,
        phone: phone.trim() || undefined,
        occupation: occupation.trim() || undefined,
        allergies: allergies.trim() ? allergies.split(',').map(a => a.trim()) : undefined,
        status: 'active',
        createdBy: 'patient-registration',
      });

      toast.success('Rekisteröinti onnistui! Voit nyt kirjautua potilasportaaliin.');
      
      // Näytä rekisteröinnin jälkeiset ohjeet
      setTimeout(() => {
        setFirstName('');
        setLastName('');
        setBirthDate('');
        setPhone('');
        setOccupation('');
        setAllergies('');
        setDiseases('');
        onRegistered();
      }, 1500);
    } catch (err) {
      setError('Rekisteröinti epäonnistui: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00a8b3 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Green header bar */}
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-400" />
          
          <CardHeader className="text-center pb-4 pt-8">
            <div className="mx-auto mb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <span className="text-4xl font-bold text-green-600 tracking-tight">HUS</span>
                </div>
              </div>
              <p className="text-xs text-green-600/70 mt-2 font-medium tracking-wide">
                Potilasrekisteröinti
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-lg font-bold text-gray-900">
              Rekisteröidy potilaaaksi
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm mt-1">
              Luo potilasprofiilin pääsyä varten potilasportaaliin
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Etunimi *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Esim. Matti"
                    className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Sukunimi *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Esim. Meikäläinen"
                    className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                  Syntymäaika *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                />
                {birthDate && (
                  <p className="text-xs text-gray-500">
                    Ikä: {calculateAge(birthDate)} vuotta
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Puhelinnumero
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Esim. 040-1234567"
                  className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">
                  Ammatti
                </Label>
                <Input
                  id="occupation"
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Esim. Insinööri"
                  className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-sm font-medium text-gray-700">
                  Allergiat
                </Label>
                <Input
                  id="allergies"
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Esim. Penisilliini, laktoos (pilkuilla erotettuna)"
                  className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diseases" className="text-sm font-medium text-gray-700">
                  Tunnetut sairaudet
                </Label>
                <Input
                  id="diseases"
                  type="text"
                  value={diseases}
                  onChange={(e) => setDiseases(e.target.value)}
                  placeholder="Esim. Diabetes, kohonneet rasva-arvot"
                  className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                />
                <p className="text-xs text-gray-400">
                  (Tieto auttaa henkilökuntaa paremmin palvelemaan sinua)
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={onRegistered}
                  variant="outline"
                  className="flex-1 h-11"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Takaisin
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-semibold shadow-lg shadow-green-500/25"
                  disabled={isLoading || !firstName.trim() || !lastName.trim() || !birthDate}
                >
                  {isLoading ? 'Rekisteröidään...' : 'Rekisteröidy'}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Rekisteröimällä sinulla on pääsy potilasportaaliin. Pääsysi tunnuksista ilmoitetaan sinulle erikseen.
              </p>
            </div>

            <div className="mt-4 text-center text-xs text-gray-400">
              <p>© 2025 Helsinki-Uusimaan sairaanhoitopiiri</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
