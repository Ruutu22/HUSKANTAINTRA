import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield, UserCircle, Stethoscope, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientRegistrationPage } from './PatientRegistrationPage';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'staff' | 'patient'>('staff');
  const [showRegistration, setShowRegistration] = useState(false);
  const { login, loginAsPatient } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success = false;
      if (loginType === 'staff') {
        success = await login(username, password);
        // If staff login fails, try patient login
        if (!success) {
          success = await loginAsPatient(username, password);
        }
      } else {
        success = await loginAsPatient(username, password);
      }
      
      if (!success) {
        setError('Virheellinen käyttäjätunnus tai salasana');
      }
    } catch {
      setError('Kirjautuminen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegistration) {
    return <PatientRegistrationPage onRegistered={() => setShowRegistration(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066b3]/10 via-white to-[#00a8b3]/10 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0066b3 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* HUS Blue header bar */}
          <div className="h-2 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]" />
          
          <CardHeader className="text-center pb-4 pt-8">
            {/* HUS Logo */}
            <div className="mx-auto mb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <span className="text-5xl font-bold text-[#0066b3] tracking-tight">HUS</span>
                  <div className="absolute -top-1 -right-4">
                    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" className="text-[#00a8b3]">
                      <path d="M14 0L28 12L14 24L0 12L14 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#0066b3]/70 mt-2 font-medium tracking-wide">
                Helsingin yliopistollinen sairaala
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0066b3] to-[#00a8b3] rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-xl font-bold text-gray-900">
              .ruudun luoma HUS järjestelmä
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm mt-1">
              Terveydenhuollon ammattilaisten työkalu
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'staff' | 'patient')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Henkilökunta
                </TabsTrigger>
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Potilas
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Käyttäjätunnus
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Syötä käyttäjätunnus"
                    className="h-12 border-gray-300 focus:border-[#0066b3] focus:ring-[#0066b3]/20"
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Salasana
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="h-12 border-gray-300 focus:border-[#0066b3] focus:ring-[#0066b3]/20"
                    autoComplete="off"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#0066b3] to-[#00a8b3] hover:from-[#005a9e] hover:to-[#009999] text-white font-semibold shadow-lg shadow-[#0066b3]/25 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
                </Button>
              </form>
            </Tabs>

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Turvallinen yhteys</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>SSL-salattu yhteys</span>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
              <p>© 2025 Helsinki-Uusimaan sairaanhoitopiiri</p>
              <p className="mt-1">Versio 2.0 - .ruutu alustalla</p>
            </div>

            {loginType === 'patient' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3 text-center">Sinulla ei ole vielä tunnuksia?</p>
                <Button
                  onClick={() => setShowRegistration(true)}
                  variant="outline"
                  className="w-full h-11 border-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Rekisteröidy potilaaaksi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
