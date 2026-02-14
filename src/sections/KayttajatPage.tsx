import { useState } from 'react';
import { useJobTitles, usePatientAccounts, usePatients } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserCircle,
  Clock,
  Shield,
  Copy,
  Check,
  Briefcase,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';

export function KayttajatPage() {
  const { jobTitles, addJobTitle, deleteJobTitle } = useJobTitles();
  const { accounts: patientAccounts, createAccount: createPatientAccount, deleteAccount: deletePatientAccount } = usePatientAccounts();
  const { patients } = usePatients();
  const { isJYL } = useAuth();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Patient form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [expiryMonths, setExpiryMonths] = useState('12');
  const [permissions, setPermissions] = useState({
    canViewRecords: true,
    canViewPrescriptions: true,
    canViewLabResults: true,
    canViewAppointments: true,
    canSendMessages: true,
    canSubmitFeedback: true,
  });

  // Job title form
  const [jobName, setJobName] = useState('');
  const [jobLevel, setJobLevel] = useState('50');
  const [jobColor, setJobColor] = useState('#0066b3');

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus hallita käyttäjiä.
        </p>
      </div>
    );
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreate = () => {
    if (!selectedPatientId || !username.trim() || !password.trim()) {
      toast.error('Täytä kaikki pakolliset kentät');
      return;
    }

    const months = parseInt(expiryMonths) || 12;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    try {
      createPatientAccount({
        patientId: selectedPatientId,
        username: username.trim(),
        password: password.trim(),
        isActive: true,
        expiresAt,
        ...permissions,
      });

      toast.success('Potilastunnus luotu onnistuneesti!');
      setShowCreateDialog(false);
      setSelectedPatientId('');
      setUsername('');
      setPassword('');
      setExpiryMonths('12');
    } catch (error) {
      toast.error('Virhe tunnuksen luonnissa: ' + (error as Error).message);
    }
  };

  const handleCreateJobTitle = () => {
    if (!jobName.trim()) {
      toast.error('Anna tehtävänkuvan nimi');
      return;
    }

    try {
      addJobTitle({
        name: jobName.trim(),
        level: parseInt(jobLevel) || 50,
        color: jobColor,
      });
      toast.success('Tehtävänkuva luotu onnistuneesti!');
      setShowJobDialog(false);
      setJobName('');
      setJobLevel('50');
      setJobColor('#0066b3');
    } catch (error) {
      toast.error('Virhe tehtävänkuvan luonnissa: ' + (error as Error).message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Kopioitu leikepöydälle!');
  };

  const getExpiryText = (expiresAt?: Date) => {
    if (!expiresAt) return 'Ei vanhene';
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    
    if (diff < 0) return 'Vanhentunut';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) return `${Math.floor(days / 30)} kk`;
    if (days > 0) return `${days} pv`;
    return '< 1 pv';
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Tuntematon potilas';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Käyttäjähallinta</h2>
          <p className="text-gray-500">Luo ja hallitse potilastunnuksia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJobDialog(true)}>
            <Briefcase className="w-4 h-4 mr-2" />
            Tehtävänkuva
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-green-600 to-green-500">
            <Plus className="w-4 h-4 mr-2" />
            Uusi potilastunnus
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Tietoa käyttäjähallinnasta</p>
              <p className="text-sm text-blue-600 mt-1">
                Tällä sivulla voit luoda potilaille kirjautumistunnuksia. Potilaat voivat nähdä omia tietojaan potilasportaalissa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Accounts */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Potilastunnukset ({patientAccounts.length})
        </h3>
        {patientAccounts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Ei potilastunnuksia</p>
              <p className="text-sm text-gray-400 text-center mt-1">Luo uusi tunnus yllä olevasta napista</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patientAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <UserCircle className="w-3 h-3 mr-1" />
                          Potilas
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getExpiryText(account.expiresAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{getPatientName(account.patientId)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">Tunnus: <code className="bg-gray-100 px-1 rounded">{account.username}</code></p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(account.username, account.id)}
                        >
                          {copiedId === account.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Haluatko varmasti poistaa tämän potilastunnuksen?')) {
                          deletePatientAccount(account.id);
                          toast.success('Potilastunnus poistettu');
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job Titles */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Tehtävänkuvat ({jobTitles.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {jobTitles.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: job.color }}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.name}</h3>
                    <p className="text-xs text-gray-500">Taso: {job.level}</p>
                  </div>
                  {!['jyl', 'erikoislaakari', 'laakari', 'ensihoitaja', 'hoitaja'].includes(job.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Haluatko varmasti poistaa tämän tehtävänkuvan?')) {
                          deleteJobTitle(job.id);
                          toast.success('Tehtävänkuva poistettu');
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Patient Account Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateDialog(false); }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Luo potilastunnus</h3>
              <button onClick={() => setShowCreateDialog(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Valitse potilas *</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Valitse potilas rekisteristä..." /></SelectTrigger>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <SelectItem value="" disabled>Ei potilaita rekisterissä</SelectItem>
                      ) : (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} (s. {format(new Date(patient.birthDate), 'dd.MM.yyyy')})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Käyttäjätunnus *</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Esim. matti.meikalainen" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Salasana *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Salasana" type="text" className="flex-1" />
                    <Button variant="outline" onClick={() => setPassword(generatePassword())} type="button">Arvo</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Voimassaolo (kuukautta)</Label>
                  <Input type="number" value={expiryMonths} onChange={(e) => setExpiryMonths(e.target.value)} min="1" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Käyttöoikeudet</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewRecords} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewRecords: !!c }))} /><span className="text-sm">Näytä potilastiedot</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewPrescriptions} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewPrescriptions: !!c }))} /><span className="text-sm">Näytä reseptit</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewLabResults} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewLabResults: !!c }))} /><span className="text-sm">Näytä laboratoriotulokset</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewAppointments} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewAppointments: !!c }))} /><span className="text-sm">Näytä ajat</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canSendMessages} onCheckedChange={(c) => setPermissions(p => ({ ...p, canSendMessages: !!c }))} /><span className="text-sm">Salli viestien lähetys</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canSubmitFeedback} onCheckedChange={(c) => setPermissions(p => ({ ...p, canSubmitFeedback: !!c }))} /><span className="text-sm">Salli palautteen lähetys</span></div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Peruuta</Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={!selectedPatientId || !username.trim() || !password.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500"
                  >
                    <Save className="w-4 h-4 mr-2" />Luo potilastunnus
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Title Dialog */}
      {showJobDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowJobDialog(false); }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Uusi tehtävänkuva</h3>
              <button onClick={() => setShowJobDialog(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nimi *</Label>
                  <Input value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Esim. Sairaanhoitaja" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Taso (1-100)</Label>
                  <Input type="number" value={jobLevel} onChange={(e) => setJobLevel(e.target.value)} min="1" max="100" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Väri</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="color" value={jobColor} onChange={(e) => setJobColor(e.target.value)} className="w-16 h-10 p-1" />
                    <Input value={jobColor} onChange={(e) => setJobColor(e.target.value)} placeholder="#0066b3" className="flex-1" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowJobDialog(false)} className="flex-1">Peruuta</Button>
                  <Button onClick={handleCreateJobTitle} disabled={!jobName.trim()} className="flex-1 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">
                    <Save className="w-4 h-4 mr-2" />Luo tehtävänkuva
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
