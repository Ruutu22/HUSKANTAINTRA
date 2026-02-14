import { useState } from 'react';
import { useStaffAccounts } from '@/hooks/useStorage';
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
  Save,
  X
} from 'lucide-react';
import type { UserRole } from '@/types';

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: 'JYL', label: 'Johtava ylilääkäri' },
  { value: 'LÄÄKÄRI', label: 'Lääkäri' },
  { value: 'ERIKOISLÄÄKÄRI', label: 'Erikoislääkäri' },
  { value: 'HOITAJA', label: 'Hoitaja' },
  { value: 'ENSIHOITAJA', label: 'Ensihoitaja' },
];

export function StaffAccountsPage() {
  const { accounts, createAccount, deleteAccount } = useStaffAccounts();
  const { isJYL } = useAuth();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('LÄÄKÄRI');
  const [jobTitle, setJobTitle] = useState('');
  const [expiryValue, setExpiryValue] = useState('');
  const [expiryUnit, setExpiryUnit] = useState<'minutes' | 'hours' | 'days' | 'months'>('months');
  
  const [permissions, setPermissions] = useState({
    canViewTallennetut: true,
    canViewUusi: true,
    canViewArkistoidut: true,
    canViewPohjat: false,
    canViewMuokkaa: false,
    canViewReseptit: true,
    canViewKayttajat: false,
    canViewOhjeistukset: true,
    canViewRaportit: true,
    canViewVuorot: true,
    canApproveConfidential: role === 'JYL' || role === 'ERIKOISLÄÄKÄRI',
  });

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus hallita henkilökunnan tunnuksia.
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
    if (!name.trim() || !username.trim() || !password.trim() || !expiryValue) {
      toast.error('Täytä kaikki pakolliset kentät');
      return;
    }

    let expiresAt: Date | undefined = undefined;
    if (expiryValue) {
      expiresAt = new Date();
      const value = parseInt(expiryValue);
      
      switch (expiryUnit) {
        case 'minutes':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 'hours':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'days':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        case 'months':
          expiresAt.setMonth(expiresAt.getMonth() + value);
          break;
      }
    }

    try {
      createAccount({
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        role,
        jobTitle: jobTitle.trim() || undefined,
        isActive: true,
        expiresAt,
        ...permissions,
      });

      toast.success('Henkilökunnan tunnus luotu onnistuneesti!');
      setShowCreateDialog(false);
      setName('');
      setUsername('');
      setPassword('');
      setRole('LÄÄKÄRI');
      setJobTitle('');
      setExpiryValue('');
      setExpiryUnit('months');
    } catch (error) {
      toast.error('Virhe tunnuksen luonnissa: ' + (error as Error).message);
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
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 30) return `${Math.floor(days / 30)} kk`;
    if (days > 0) return `${days} pv`;
    if (hours > 0) return `${hours} h`;
    if (minutes > 0) return `${minutes} min`;
    return '< 1 min';
  };

  const getRoleLabel = (role: UserRole) => {
    return STAFF_ROLES.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Henkilökunnan tunnusten hallinta</h2>
          <p className="text-gray-500">Luo ja hallitse henkilökunnan kirjautumistunnuksia</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-600 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Uusi henkilökunnan tunnus
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Henkilökunnan tunnuksista</p>
              <p className="text-sm text-blue-600 mt-1">
                Henkilökunta voi kirjautua omilla tunnuksillaan henkilökunnan portaaliin. Jokaiselle tunnukselle voi asettaa voimassaoloajan (minuutit, tunnit, päivät tai kuukaudet).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Accounts */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Henkilökunnan tunnukset ({accounts.length})
        </h3>
        {accounts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">Ei henkilökunnan tunnuksia</p>
              <p className="text-sm text-gray-400 text-center mt-1">Luo uusi tunnus yllä olevasta napista</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          {getRoleLabel(account.role)}
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getExpiryText(account.expiresAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      {account.jobTitle && (
                        <p className="text-sm text-gray-500 mt-1">Tehtävänkuva: {account.jobTitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
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
                        if (confirm('Haluatko varmasti poistaa tämän henkilökunnan tunnuksen?')) {
                          deleteAccount(account.id);
                          toast.success('Henkilökunnan tunnus poistettu');
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

      {/* Create Staff Account Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateDialog(false); }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Luo henkilökunnan tunnus</h3>
              <button onClick={() => setShowCreateDialog(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nimi *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Esim. Matti Meikäläinen" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Käyttäjätunnus *</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Esim. matti.meikalainen" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Rooli *</Label>
                  <Select value={role} onValueChange={(v) => {
                    setRole(v as UserRole);
                    setPermissions(p => ({
                      ...p,
                      canApproveConfidential: v === 'JYL' || v === 'ERIKOISLÄÄKÄRI'
                    }));
                  }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tehtävänkuva</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Esim. Sairaanhoitaja" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Salasana *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Salasana" type="text" className="flex-1" />
                    <Button variant="outline" onClick={() => setPassword(generatePassword())} type="button">Arvo</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Voimassaolo *</Label>
                    <Input 
                      type="number" 
                      value={expiryValue} 
                      onChange={(e) => setExpiryValue(e.target.value)} 
                      min="1" 
                      placeholder="Arvo"
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Yksikkö *</Label>
                    <Select value={expiryUnit} onValueChange={(v) => setExpiryUnit(v as any)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minuutti</SelectItem>
                        <SelectItem value="hours">Tunti</SelectItem>
                        <SelectItem value="days">Päivä</SelectItem>
                        <SelectItem value="months">Kuukausi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Käyttöoikeudet</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewTallennetut} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewTallennetut: !!c }))} /><span className="text-sm">Tallennetut lomakkeet</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewUusi} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewUusi: !!c }))} /><span className="text-sm">Uusi lomake</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewArkistoidut} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewArkistoidut: !!c }))} /><span className="text-sm">Arkistoidut lomakkeet</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewPohjat} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewPohjat: !!c }))} /><span className="text-sm">Pohjat</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewMuokkaa} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewMuokkaa: !!c }))} /><span className="text-sm">Muokkaa</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewReseptit} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewReseptit: !!c }))} /><span className="text-sm">Reseptit</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewKayttajat} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewKayttajat: !!c }))} /><span className="text-sm">Käyttäjäthallinta</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewOhjeistukset} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewOhjeistukset: !!c }))} /><span className="text-sm">Ohjeistukset</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewRaportit} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewRaportit: !!c }))} /><span className="text-sm">Raportit</span></div>
                    <div className="flex items-center gap-2"><Checkbox checked={permissions.canViewVuorot} onCheckedChange={(c) => setPermissions(p => ({ ...p, canViewVuorot: !!c }))} /><span className="text-sm">Vuorot</span></div>
                    {(role === 'JYL' || role === 'ERIKOISLÄÄKÄRI') && (
                      <div className="flex items-center gap-2"><Checkbox checked={permissions.canApproveConfidential} onCheckedChange={(c) => setPermissions(p => ({ ...p, canApproveConfidential: !!c }))} /><span className="text-sm">Hyväksy luottamuksellisia</span></div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Peruuta</Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={!name.trim() || !username.trim() || !password.trim() || !expiryValue}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500"
                  >
                    <Save className="w-4 h-4 mr-2" />Luo tunnus
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
