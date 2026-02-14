import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings, useAuditLogs, useJobTitles, usePagePermissions } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Palette, Shield, Bell, 
  Download, Save, AlertTriangle, Check,
  Lock, Globe, Database, ChevronDown,
  ChevronUp, CheckCircle2
} from 'lucide-react';

const PAGES = [
  { id: 'tallennetut', name: 'Tallennetut lomakkeet', category: 'lomakkeet' },
  { id: 'uusi', name: 'Uusi arviointi', category: 'lomakkeet' },
  { id: 'arkistoidut', name: 'Arkistoidut', category: 'lomakkeet' },
  { id: 'pohjat', name: 'Lomakepohjat', category: 'hallinta' },
  { id: 'muokkaa', name: 'Muokkaa pohjia', category: 'hallinta' },
  { id: 'reseptit', name: 'Reseptit', category: 'hoito' },
  { id: 'kayttajat', name: 'Käyttäjähallinta', category: 'hallinta' },
  { id: 'ohjeistukset', name: 'Ohjeistukset', category: 'viestinta' },
  { id: 'raportit', name: 'Raportit', category: 'raportointi' },
  { id: 'vuorot', name: 'Vuorot & Saatavuus', category: 'ajanhallinta' },
  { id: 'potilaat', name: 'Potilasrekisteri', category: 'hoito' },
  { id: 'diagnoosit', name: 'Diagnoosit', category: 'hoito' },
  { id: 'labra', name: 'Laboratorio', category: 'hoito' },
  { id: 'kuvantaminen', name: 'Kuvantaminen', category: 'hoito' },
  { id: 'lahetteet', name: 'Lähetteet', category: 'hoito' },
  { id: 'ajanvaraus', name: 'Ajanvaraus', category: 'ajanhallinta' },
  { id: 'ryhmat', name: 'Käyttäjäryhmät', category: 'hallinta' },
  { id: 'chat', name: 'Keskustelu', category: 'viestinta' },
  { id: 'muistiot', name: 'Muistiot', category: 'viestinta' },
  { id: 'potilasportaali', name: 'Potilasportaali', category: 'raportointi' },
  { id: 'asetukset', name: 'Asetukset', category: 'jarjestelma' },
  { id: 'lokit', name: 'Toimintaloki', category: 'jarjestelma' },
];

const ROLES = [
  { value: 'JYL', label: 'Johtava ylilääkäri', color: 'bg-purple-100 text-purple-700' },
  { value: 'ERIKOISLÄÄKÄRI', label: 'Erikoislääkäri', color: 'bg-blue-100 text-blue-700' },
  { value: 'LÄÄKÄRI', label: 'Lääkäri', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'HOITAJA', label: 'Hoitaja', color: 'bg-green-100 text-green-700' },
  { value: 'ENSIHOITAJA', label: 'Ensihoitaja', color: 'bg-yellow-100 text-yellow-700' },
];

const FEATURES = [
  { id: 'enableChat', label: 'Keskustelu', description: 'Mahdollista chat-viestintä' },
  { id: 'enableNotifications', label: 'Ilmoitukset', description: 'Salli ilmoitusten lähetys' },
  { id: 'enableAuditLog', label: 'Toimintaloki', description: 'Kirjaa kaikki toimet' },
  { id: 'enablePatientRegistry', label: 'Potilasrekisteri', description: 'Käytä potilashallintaa' },
  { id: 'enablePrescriptions', label: 'Reseptit', description: 'Salli reseptien kirjoitus' },
  { id: 'enableShiftTracking', label: 'Vuoroseuranta', description: 'Seuraa työvuoroja' },
  { id: 'enableConfidentialMode', label: 'Salassapito-tila', description: 'Mahdollista luottamukselliset lomakkeet' },
  { id: 'enablePatientPortal', label: 'Potilasportaali', description: 'Ota potilasportaali käyttöön' },
  { id: 'enableLabOrders', label: 'Laboratorio', description: 'Salli labratilaukset' },
  { id: 'enableImaging', label: 'Kuvantaminen', description: 'Salli kuvantamistilaukset' },
  { id: 'enableReferrals', label: 'Lähetteet', description: 'Salli erikoislähetteet' },
  { id: 'enableAppointments', label: 'Ajanvaraus', description: 'Ota ajanvaraus käyttöön' },
];

export function AsetuksetPage() {
  const { user, isJYL } = useAuth();
  const { settings, updateFeatures, updateSecurity } = useSettings();
  const { addLog } = useAuditLogs();
  const { jobTitles } = useJobTitles();
  const { permissions, updatePermission } = usePagePermissions();

  const [activeTab, setActiveTab] = useState('general');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['lomakkeet', 'hoito']);
  const [localPermissions, setLocalPermissions] = useState<Record<string, { roles: string[]; jobTitles: string[] }>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load permissions into local state
  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissions]);

  // Redirect if not JYL
  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Pääsy kielletty</h1>
        <p className="text-gray-500 mt-2">Vain johtava ylilääkäri voi käyttää asetuksia</p>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleRole = (pageId: string, role: string) => {
    setLocalPermissions(prev => {
      const current = prev[pageId] || { roles: [], jobTitles: [] };
      const newRoles = current.roles.includes(role)
        ? current.roles.filter(r => r !== role)
        : [...current.roles, role];
      return { ...prev, [pageId]: { ...current, roles: newRoles } };
    });
  };

  const toggleJobTitle = (pageId: string, jobTitle: string) => {
    setLocalPermissions(prev => {
      const current = prev[pageId] || { roles: [], jobTitles: [] };
      const newJobTitles = current.jobTitles.includes(jobTitle)
        ? current.jobTitles.filter(j => j !== jobTitle)
        : [...current.jobTitles, jobTitle];
      return { ...prev, [pageId]: { ...current, jobTitles: newJobTitles } };
    });
  };

  const savePermissions = () => {
    setSaveStatus('saving');
    Object.entries(localPermissions).forEach(([pageId, perm]) => {
      updatePermission(pageId, perm.roles, perm.jobTitles);
    });
    
    addLog({
      userId: user!.id,
      userName: user!.name,
      userRole: user!.role,
      action: 'update_settings',
      details: 'Käyttöoikeudet päivitetty',
    });
    
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const selectAllForPage = (pageId: string) => {
    setLocalPermissions(prev => ({
      ...prev,
      [pageId]: { 
        roles: ['JYL', 'ERIKOISLÄÄKÄRI', 'LÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'], 
        jobTitles: jobTitles.map(j => j.name) 
      }
    }));
  };

  const clearAllForPage = (pageId: string) => {
    setLocalPermissions(prev => ({
      ...prev,
      [pageId]: { roles: ['JYL'], jobTitles: [] }
    }));
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      lomakkeet: 'Lomakkeet',
      hoito: 'Potilashoito',
      ajanhallinta: 'Ajanhallinta',
      viestinta: 'Viestintä',
      raportointi: 'Raportointi',
      hallinta: 'Hallinta',
      jarjestelma: 'Järjestelmä',
    };
    return names[cat] || cat;
  };

  const groupedPages = PAGES.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof PAGES>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#0066b3]" />
            Järjestelmäasetukset
          </h1>
          <p className="text-gray-500 mt-1">
            Hallitse HUS Lääkärijärjestelmän asetuksia ja käyttöoikeuksia
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Tallennettu
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Yleiset</TabsTrigger>
          <TabsTrigger value="permissions">Käyttöoikeudet</TabsTrigger>
          <TabsTrigger value="features">Toiminnot</TabsTrigger>
          <TabsTrigger value="security">Turva</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Ulkoasu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Pääväri</p>
                  <p className="text-sm text-gray-500">Järjestelmän pääväri</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0066b3] border-2 border-white shadow" />
                  <Input value="#0066b3" className="w-28" readOnly />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">HUS Logo</p>
                  <p className="text-sm text-gray-500">Näytä logo kaikissa näkymissä</p>
                </div>
                <Switch checked={true} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Vesileima</p>
                  <p className="text-sm text-gray-500">Näytä ".ruudun luoma HUS järjestelmä"</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Järjestelmätiedot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Versio</p>
                  <p className="font-medium text-gray-900">2.0.0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Viimeinen päivitys</p>
                  <p className="font-medium text-gray-900">{new Date().toLocaleDateString('fi-FI')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sivukohtaiset käyttöoikeudet
                  </CardTitle>
                  <CardDescription>
                    Valitse ketkä näkevät mitkäkin sivut. Voit valita useita rooleja ja ammattinimikkeitä.
                  </CardDescription>
                </div>
                <Button onClick={savePermissions} disabled={saveStatus === 'saving'}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus === 'saving' ? 'Tallennetaan...' : 'Tallenna muutokset'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedPages).map(([category, pages]) => (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{getCategoryName(category)}</span>
                    {expandedCategories.includes(category) ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedCategories.includes(category) && (
                    <div className="p-4 space-y-4">
                      {pages.map(page => {
                        const perm = localPermissions[page.id] || { roles: [], jobTitles: [] };
                        
                        return (
                          <div key={page.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{page.name}</span>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => selectAllForPage(page.id)}
                                >
                                  Kaikki
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => clearAllForPage(page.id)}
                                >
                                                  Vain JYL
                                                </Button>
                                              </div>
                                            </div>
                                            
                                            {/* Roles */}
                                            <div>
                                              <p className="text-xs text-gray-500 mb-2">Roolit:</p>
                                              <div className="flex flex-wrap gap-2">
                                                {ROLES.map(role => (
                                                  <button
                                                    key={role.value}
                                                    onClick={() => toggleRole(page.id, role.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                      perm.roles.includes(role.value)
                                                        ? role.color
                                                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                    }`}
                                                  >
                                                    {perm.roles.includes(role.value) && <Check className="w-3 h-3 inline mr-1" />}
                                                    {role.label}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                            
                                            {/* Job Titles */}
                                            {jobTitles.length > 0 && (
                                              <div>
                                                <p className="text-xs text-gray-500 mb-2">Ammattinimikkeet:</p>
                                                <div className="flex flex-wrap gap-2">
                                                  {jobTitles.map(jt => (
                                                    <button
                                                      key={jt.id}
                                                      onClick={() => toggleJobTitle(page.id, jt.name)}
                                                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                        perm.jobTitles.includes(jt.name)
                                                          ? 'bg-[#0066b3] text-white'
                                                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                      }`}
                                                    >
                                                      {perm.jobTitles.includes(jt.name) && <Check className="w-3 h-3 inline mr-1" />}
                                                      {jt.name}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Features */}
                        <TabsContent value="features" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Toimintojen hallinta
                              </CardTitle>
                              <CardDescription>
                                Ota käyttöön tai poista käytöstä järjestelmän toimintoja
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FEATURES.map(feature => (
                                  <div 
                                    key={feature.id} 
                                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">{feature.label}</p>
                                      <p className="text-sm text-gray-500">{feature.description}</p>
                                    </div>
                                    <Switch 
                                      checked={settings.features[feature.id as keyof typeof settings.features] as boolean}
                                      onCheckedChange={(checked) => {
                                        updateFeatures({ [feature.id]: checked });
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Security */}
                        <TabsContent value="security" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Turva-asetukset
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">Vaadi salasana PDF-vientiin</p>
                                  <p className="text-sm text-gray-500">Käyttäjä syöttää salasanan ennen PDF:n latausta</p>
                                </div>
                                <Switch 
                                  checked={settings.security.requirePasswordForPdf}
                                  onCheckedChange={(checked) => updateSecurity({ requirePasswordForPdf: checked })}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">Vaadi syy PDF-vientiin</p>
                                  <p className="text-sm text-gray-500">Käyttäjä ilmoittaa syyn PDF:n lataukselle</p>
                                </div>
                                <Switch 
                                  checked={settings.security.requireReasonForPdf}
                                  onCheckedChange={(checked) => updateSecurity({ requireReasonForPdf: checked })}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">Istunnon aikakatkaisu</p>
                                  <p className="text-sm text-gray-500">Aika minuutteina ennen automaattista uloskirjautumista</p>
                                </div>
                                <Input 
                                  type="number" 
                                  value={settings.security.sessionTimeoutMinutes}
                                  onChange={(e) => updateSecurity({ sessionTimeoutMinutes: parseInt(e.target.value) })}
                                  className="w-24"
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Varmuuskopiointi
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900 mb-2">Lataa järjestelmän tiedot</p>
                                <p className="text-sm text-gray-500 mb-4">
                                  Lataa kaikki järjestelmän tiedot JSON-muodossa varmuuskopiota varten
                                </p>
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    const data = localStorage.getItem('hus_users');
                                    const blob = new Blob([data || '{}'], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `hus-backup-${new Date().toISOString().split('T')[0]}.json`;
                                    a.click();
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Lataa varmuuskopio
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  );
                }
