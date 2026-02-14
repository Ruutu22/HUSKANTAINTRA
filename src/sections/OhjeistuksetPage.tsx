import { useState } from 'react';
import { useNotices } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Bell, 
  Info,
  AlertTriangle,
  Megaphone,
  Pin,
  Trash2,
  Calendar,
  User,
  Clock,
  Stethoscope,
  Pill,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { diagnoses, diagnosisCategories, type DiagnosisData } from '@/data/diagnoses';
import { medications, medicationCategories, type MedicationData } from '@/data/medications';

export function OhjeistuksetPage() {
  const { addNotice, deleteNotice, getActiveNotices } = useNotices();
  const { user, isJYL } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Diagnosis and medication search
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedDiagnosisCategory, setSelectedDiagnosisCategory] = useState('all');
  const [selectedMedicationCategory, setSelectedMedicationCategory] = useState('all');
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<string | null>(null);
  const [expandedMedication, setExpandedMedication] = useState<string | null>(null);

  // Edit states for JYL
  const [editingDiagnosis, setEditingDiagnosis] = useState<DiagnosisData | null>(null);
  const [editingMedication, setEditingMedication] = useState<MedicationData | null>(null);
  const [showEditDiagnosisDialog, setShowEditDiagnosisDialog] = useState(false);
  const [showEditMedicationDialog, setShowEditMedicationDialog] = useState(false);

  // New notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'ilmoitus' | 'ohjeistus' | 'tiedote'>('tiedote');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [expiresDays, setExpiresDays] = useState('');

  // Edit diagnosis form
  const [editDiagCode, setEditDiagCode] = useState('');
  const [editDiagName, setEditDiagName] = useState('');
  const [editDiagDescription, setEditDiagDescription] = useState('');
  const [editDiagTreatment, setEditDiagTreatment] = useState('');

  // Edit medication form
  const [editMedName, setEditMedName] = useState('');
  const [editMedIngredient, setEditMedIngredient] = useState('');
  const [editMedDosage, setEditMedDosage] = useState('');
  const [editMedInstructions, setEditMedInstructions] = useState('');
  const [editMedContraindications, setEditMedContraindications] = useState('');
  const [editMedSideEffects, setEditMedSideEffects] = useState('');

  const activeNotices = getActiveNotices(user?.role);

  const filteredNotices = activeNotices.filter(notice => {
    if (activeTab !== 'all' && notice.type !== activeTab) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return notice.title.toLowerCase().includes(searchLower) || notice.content.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Filter diagnoses
  const filteredDiagnoses = diagnoses.filter(d => {
    const matchesSearch = diagnosisSearch === '' || 
      d.name.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(diagnosisSearch.toLowerCase()));
    const matchesCategory = selectedDiagnosisCategory === 'all' || d.category === selectedDiagnosisCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter medications
  const filteredMedications = medications.filter(m => {
    const matchesSearch = medicationSearch === '' || 
      m.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
      m.activeIngredient.toLowerCase().includes(medicationSearch.toLowerCase());
    const matchesCategory = selectedMedicationCategory === 'all' || m.category === selectedMedicationCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      const expiresAt = expiresDays ? new Date(Date.now() + parseInt(expiresDays) * 24 * 60 * 60 * 1000) : undefined;
      addNotice({
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        isPinned,
        createdBy: user?.name || 'Tuntematon',
        expiresAt,
        visibleToRoles: ['all'],
      });
      setTitle('');
      setContent('');
      setType('tiedote');
      setPriority('normal');
      setIsPinned(false);
      setExpiresDays('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditDiagnosis = (diagnosis: DiagnosisData) => {
    setEditingDiagnosis(diagnosis);
    setEditDiagCode(diagnosis.code);
    setEditDiagName(diagnosis.name);
    setEditDiagDescription(diagnosis.description || '');
    setEditDiagTreatment(diagnosis.treatmentGuidelines || '');
    setShowEditDiagnosisDialog(true);
  };

  const handleSaveDiagnosis = () => {
    if (editingDiagnosis) {
      // In a real app, this would update the database
      // For now, we'll store in localStorage
      const customDiagnoses = JSON.parse(localStorage.getItem('hus_custom_diagnoses') || '[]');
      const updated = {
        ...editingDiagnosis,
        code: editDiagCode,
        name: editDiagName,
        description: editDiagDescription,
        treatmentGuidelines: editDiagTreatment,
      };
      const existingIndex = customDiagnoses.findIndex((d: any) => d.code === editingDiagnosis.code);
      if (existingIndex >= 0) {
        customDiagnoses[existingIndex] = updated;
      } else {
        customDiagnoses.push(updated);
      }
      localStorage.setItem('hus_custom_diagnoses', JSON.stringify(customDiagnoses));
      setShowEditDiagnosisDialog(false);
      setEditingDiagnosis(null);
    }
  };

  const handleEditMedication = (medication: MedicationData) => {
    setEditingMedication(medication);
    setEditMedName(medication.name);
    setEditMedIngredient(medication.activeIngredient);
    setEditMedDosage(medication.dosage.adult || '');
    setEditMedInstructions(medication.instructions);
    setEditMedContraindications((medication.contraindications || []).join(', '));
    setEditMedSideEffects((medication.sideEffects || []).join(', '));
    setShowEditMedicationDialog(true);
  };

  const handleSaveMedication = () => {
    if (editingMedication) {
      const customMedications = JSON.parse(localStorage.getItem('hus_custom_medications') || '[]');
      const updated = {
        ...editingMedication,
        name: editMedName,
        activeIngredient: editMedIngredient,
        dosage: { ...editingMedication.dosage, adult: editMedDosage },
        instructions: editMedInstructions,
        contraindications: editMedContraindications.split(',').map(s => s.trim()).filter(Boolean),
        sideEffects: editMedSideEffects.split(',').map(s => s.trim()).filter(Boolean),
      };
      const existingIndex = customMedications.findIndex((m: any) => m.name === editingMedication.name);
      if (existingIndex >= 0) {
        customMedications[existingIndex] = updated;
      } else {
        customMedications.push(updated);
      }
      localStorage.setItem('hus_custom_medications', JSON.stringify(customMedications));
      setShowEditMedicationDialog(false);
      setEditingMedication(null);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'ilmoitus': return <Bell className="w-4 h-4" />;
      case 'ohjeistus': return <BookOpen className="w-4 h-4" />;
      case 'tiedote': return <Megaphone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPrescriptionTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-red-100 text-red-700';
      case 'B': return 'bg-orange-100 text-orange-700';
      case 'C': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ohjeistukset ja tietokannat</h2>
          <p className="text-gray-500">Tärkeät tiedotteet, diagnoosit ja lääkkeet</p>
        </div>
        {isJYL && activeTab === 'all' && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">
            <Plus className="w-4 h-4 mr-2" />
            Uusi tiedote
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Megaphone className="w-4 h-4" />
            Tiedotteet
          </TabsTrigger>
          <TabsTrigger value="diagnoses" className="flex items-center gap-1">
            <Stethoscope className="w-4 h-4" />
            Diagnoosit ({diagnoses.length})
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-1">
            <Pill className="w-4 h-4" />
            Lääkkeet ({medications.length})
          </TabsTrigger>
          <TabsTrigger value="ohjeistus" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Ohjeistukset
          </TabsTrigger>
        </TabsList>

        {/* Notices Tab */}
        <TabsContent value="all" className="mt-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Hae ohjeistuksista..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
          {filteredNotices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">{searchQuery ? 'Ei tuloksia haulle' : 'Ei ohjeistuksia'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} className={`overflow-hidden ${notice.isPinned ? 'border-amber-400 shadow-md' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getPriorityColor(notice.priority)}>
                            {getTypeIcon(notice.type)}
                            <span className="ml-1 capitalize">{notice.type}</span>
                          </Badge>
                          {notice.isPinned && <Badge variant="secondary" className="bg-amber-100 text-amber-700"><Pin className="w-3 h-3 mr-1" />Kiinnitetty</Badge>}
                          {notice.priority === 'urgent' && <Badge variant="secondary" className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Kiireellinen</Badge>}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{notice.createdBy}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(notice.createdAt), 'dd.MM.yyyy', { locale: fi })}</span>
                          {notice.expiresAt && <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3 h-3" />Vanhenee: {format(new Date(notice.expiresAt), 'dd.MM.yyyy', { locale: fi })}</span>}
                        </div>
                      </div>
                      {isJYL && (
                        <Button variant="ghost" size="icon" onClick={() => deleteNotice(notice.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{notice.content}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Diagnoses Tab */}
        <TabsContent value="diagnoses" className="mt-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Hae diagnooseista (koodi, nimi...)" value={diagnosisSearch} onChange={(e) => setDiagnosisSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedDiagnosisCategory} onValueChange={setSelectedDiagnosisCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Kaikki kategoriat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki kategoriat</SelectItem>
                {diagnosisCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filteredDiagnoses.map((diagnosis) => {
              const category = diagnosisCategories.find(c => c.id === diagnosis.category);
              const isExpanded = expandedDiagnosis === diagnosis.code;
              return (
                <Card key={diagnosis.code} className="overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedDiagnosis(isExpanded ? null : diagnosis.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-mono">{diagnosis.code}</Badge>
                        <span className="font-semibold text-gray-900">{diagnosis.name}</span>
                        {category && <Badge variant="outline" className="text-xs">{category.name}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {isJYL && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleEditDiagnosis(diagnosis); }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 bg-gray-50">
                      {diagnosis.description && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Kuvaus:</p>
                          <p className="text-sm text-gray-600">{diagnosis.description}</p>
                        </div>
                      )}
                      {diagnosis.treatmentGuidelines && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Hoito-ohjeet:</p>
                          <p className="text-sm text-gray-600">{diagnosis.treatmentGuidelines}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="mt-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Hae lääkkeistä (nimi, vaikuttava aine...)" value={medicationSearch} onChange={(e) => setMedicationSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedMedicationCategory} onValueChange={setSelectedMedicationCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Kaikki kategoriat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki kategoriat</SelectItem>
                {medicationCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filteredMedications.map((medication) => {
              const category = medicationCategories.find(c => c.id === medication.category);
              const isExpanded = expandedMedication === medication.name;
              return (
                <Card key={medication.name} className="overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedMedication(isExpanded ? null : medication.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{medication.name}</span>
                        <span className="text-sm text-gray-500">({medication.activeIngredient})</span>
                        <Badge className={getPrescriptionTypeColor(medication.prescriptionType)}>{medication.prescriptionType}-resepti</Badge>
                        {category && <Badge variant="outline" className="text-xs">{category.name}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {isJYL && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleEditMedication(medication); }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 bg-gray-50 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Käyttötarkoitukset:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {medication.uses.map((use, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{use}</Badge>
                          ))}
                        </div>
                      </div>
                      {medication.dosage.adult && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Annostus (aikuinen):</p>
                          <p className="text-sm text-gray-600">{medication.dosage.adult}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">Ohjeet:</p>
                        <p className="text-sm text-gray-600">{medication.instructions}</p>
                      </div>
                      {medication.contraindications && medication.contraindications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Vasta-aiheet:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medication.contraindications.map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-red-50 text-red-700">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {medication.sideEffects && medication.sideEffects.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Mahdolliset sivuvaikutukset:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medication.sideEffects.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-yellow-50 text-yellow-700">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="ohjeistus" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ohjeistukset</h3>
              <div className="space-y-4 text-gray-700">
                <p>Tältä sivulta löydät:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Tiedotteet:</strong> Tärkeät ilmoitukset ja tiedotteet henkilökunnalle</li>
                  <li><strong>Diagnoosit:</strong> ICD-10 diagnoosit kategorioittain hoito-ohjeineen</li>
                  <li><strong>Lääkkeet:</strong> Reseptilääkkeet annostuksineen ja ohjeineen</li>
                </ul>
                <p className="mt-4">Johtava ylilääkäri voi muokata diagnooseja ja lääkkeitä suoraan tietokannoista.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Notice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader><DialogTitle>Uusi tiedote</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div><Label>Otsikko</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiedotteen otsikko" /></div>
              <div><Label>Tyyppi</Label><Select value={type} onValueChange={(v: any) => setType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tiedote">Tiedote</SelectItem><SelectItem value="ohjeistus">Ohjeistus</SelectItem><SelectItem value="ilmoitus">Ilmoitus</SelectItem></SelectContent></Select></div>
              <div><Label>Tärkeys</Label><Select value={priority} onValueChange={(v: any) => setPriority(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Matala</SelectItem><SelectItem value="normal">Normaali</SelectItem><SelectItem value="high">Korkea</SelectItem><SelectItem value="urgent">Kiireellinen</SelectItem></SelectContent></Select></div>
              <div><Label>Sisältö</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Kirjoita tiedotteen sisältö..." rows={6} /></div>
              <div><Label>Vanhenee (päivää, valinnainen)</Label><Input type="number" value={expiresDays} onChange={(e) => setExpiresDays(e.target.value)} placeholder="Esim. 30" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded border-gray-300" /><Label htmlFor="pinned" className="cursor-pointer">Kiinnitä yläpuolelle</Label></div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Peruuta</Button>
            <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()} className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">Julkaise</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Diagnosis Dialog */}
      {showEditDiagnosisDialog && editingDiagnosis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowEditDiagnosisDialog(false); }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Muokkaa diagnoosia</h3>
              <button onClick={() => setShowEditDiagnosisDialog(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div><Label className="text-sm font-medium">ICD-10 Koodi</Label><Input value={editDiagCode} onChange={(e) => setEditDiagCode(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Nimi</Label><Input value={editDiagName} onChange={(e) => setEditDiagName(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Kuvaus</Label><Textarea value={editDiagDescription} onChange={(e) => setEditDiagDescription(e.target.value)} className="mt-1" rows={3} /></div>
                <div><Label className="text-sm font-medium">Hoito-ohjeet</Label><Textarea value={editDiagTreatment} onChange={(e) => setEditDiagTreatment(e.target.value)} className="mt-1" rows={3} /></div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDiagnosisDialog(false)} className="flex-1">Peruuta</Button>
                  <Button onClick={handleSaveDiagnosis} disabled={!editDiagCode.trim() || !editDiagName.trim()} className="flex-1 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"><Save className="w-4 h-4 mr-2" />Tallenna</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medication Dialog */}
      {showEditMedicationDialog && editingMedication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowEditMedicationDialog(false); }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Muokkaa lääkettä</h3>
              <button onClick={() => setShowEditMedicationDialog(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div><Label className="text-sm font-medium">Nimi</Label><Input value={editMedName} onChange={(e) => setEditMedName(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Vaikuttava aine</Label><Input value={editMedIngredient} onChange={(e) => setEditMedIngredient(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Annostus (aikuinen)</Label><Input value={editMedDosage} onChange={(e) => setEditMedDosage(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Ohjeet</Label><Textarea value={editMedInstructions} onChange={(e) => setEditMedInstructions(e.target.value)} className="mt-1" rows={2} /></div>
                <div><Label className="text-sm font-medium">Vasta-aiheet (pilkuilla eroteltu)</Label><Input value={editMedContraindications} onChange={(e) => setEditMedContraindications(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-sm font-medium">Sivuvaikutukset (pilkuilla eroteltu)</Label><Input value={editMedSideEffects} onChange={(e) => setEditMedSideEffects(e.target.value)} className="mt-1" /></div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditMedicationDialog(false)} className="flex-1">Peruuta</Button>
                  <Button onClick={handleSaveMedication} disabled={!editMedName.trim() || !editMedIngredient.trim()} className="flex-1 bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"><Save className="w-4 h-4 mr-2" />Tallenna</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
