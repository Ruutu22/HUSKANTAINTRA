import { useState } from 'react';
import { useMedications } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Users } from 'lucide-react';
import type { MedicationCategory } from '@/types';

const MEDICATION_CATEGORIES: { value: MedicationCategory; label: string }[] = [
  { value: 'reseptilääkkeet', label: 'Reseptilääkkeet' },
  { value: 'ensihoidon', label: 'Ensihoidon lääkkeet' },
  { value: 'yli-ilmoitus', label: 'Yli-ilmoitus lääkkeet' },
  { value: 'homeopatia', label: 'Homeopatia' },
  { value: 'luontaistuotteet', label: 'Luontaistuotteet' },
  { value: 'muut', label: 'Muut' },
];

export function MedicationPage() {
  const { medications, addMedication, updateMedication, deleteMedication } = useMedications();
  const { isJYL } = useAuth();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [genericName, setGenericName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [category, setCategory] = useState<MedicationCategory>('reseptilääkkeet');
  const [atcCode, setAtcCode] = useState('');
  const [form, setForm] = useState('tabletti');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [contraindications, setContraindications] = useState('');

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus hallita lääkkeitä.
        </p>
      </div>
    );
  }

  const resetForm = () => {
    setGenericName('');
    setTradeName('');
    setCategory('reseptilääkkeet');
    setAtcCode('');
    setForm('tabletti');
    setStrength('');
    setDosage('');
    setSideEffects('');
    setContraindications('');
    setEditingId(null);
  };

  const openEditDialog = (med: any) => {
    setEditingId(med.id);
    setGenericName(med.genericName);
    setTradeName(med.tradeName);
    setCategory(med.category);
    setAtcCode(med.atcCode || '');
    setForm(med.form);
    setStrength(med.strength);
    setDosage(med.dosage || '');
    setSideEffects(med.sideEffects?.join(', ') || '');
    setContraindications(med.contraindications?.join(', ') || '');
    setShowCreateDialog(true);
  };

  const handleSave = () => {
    if (!genericName.trim() || !tradeName.trim() || !strength.trim()) {
      toast.error('Täytä kaikki pakolliset kentät');
      return;
    }

    const sideEffectsArray = sideEffects.split(',').map(s => s.trim()).filter(Boolean);
    const contraindicationsArray = contraindications.split(',').map(c => c.trim()).filter(Boolean);

    try {
      if (editingId) {
        updateMedication(editingId, {
          genericName: genericName.trim(),
          tradeName: tradeName.trim(),
          category,
          atcCode: atcCode.trim() || undefined,
          form,
          strength: strength.trim(),
          dosage: dosage.trim() || undefined,
          sideEffects: sideEffectsArray,
          contraindications: contraindicationsArray,
        });
        toast.success('Lääke päivitetty onnistuneesti!');
      } else {
        addMedication({
          genericName: genericName.trim(),
          tradeName: tradeName.trim(),
          category,
          atcCode: atcCode.trim() || undefined,
          form,
          strength: strength.trim(),
          dosage: dosage.trim() || undefined,
          sideEffects: sideEffectsArray,
          contraindications: contraindicationsArray,
          isActive: true,
        });
        toast.success('Lääke lisätty onnistuneesti!');
      }

      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Virhe lääkkeen käsittelyssa: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lääkkeiden hallinta</h2>
          <p className="text-gray-500">Hallitse lääkkeiden tietokantaa</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="bg-gradient-to-r from-blue-600 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Uusi lääke
        </Button>
      </div>

      {/* Group by category */}
      {MEDICATION_CATEGORIES.map((cat) => {
        const catMeds = medications.filter(m => m.category === cat.value && m.isActive);
        if (catMeds.length === 0) return null;
        
        return (
          <div key={cat.value}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{cat.label}</h3>
            <div className="grid gap-3">
              {catMeds.map((med) => (
                <Card key={med.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{med.tradeName} ({med.genericName})</h4>
                        <p className="text-sm text-gray-500 mt-1">{med.strength} • {med.form}</p>
                        {med.atcCode && <p className="text-xs text-gray-400 mt-1">ATC: {med.atcCode}</p>}
                        {med.dosage && <p className="text-sm text-gray-600 mt-1">Annos: {med.dosage}</p>}
                        {med.sideEffects && med.sideEffects.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">Sivuvaikutukset: {med.sideEffects.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(med)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Haluatko varmasti poistaa tämän lääkkeen?')) {
                              deleteMedication(med.id);
                              toast.success('Lääke poistettu');
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowCreateDialog(false); resetForm(); } }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Muokkaa lääkettä' : 'Lisää uusi lääke'}</h3>
              <button onClick={() => { setShowCreateDialog(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-full">
                <span className="text-gray-500">✕</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nimiaine (generic name) *</Label>
                  <Input value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="Esim. Metoprololi" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Kauppanimi (trade name) *</Label>
                  <Input value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder="Esim. Betaloc" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Kategoria *</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as MedicationCategory)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEDICATION_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Muoto *</Label>
                  <Input value={form} onChange={(e) => setForm(e.target.value)} placeholder="Esim. tabletti, injektio" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Vahvuus *</Label>
                  <Input value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="Esim. 50mg, 10ml" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">ATC-koodi</Label>
                  <Input value={atcCode} onChange={(e) => setAtcCode(e.target.value)} placeholder="Esim. C07AB02" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Annos</Label>
                  <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Esim. 1-2 mg päivässä" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Sivuvaikutukset (pilkulla erotettu)</Label>
                  <Input value={sideEffects} onChange={(e) => setSideEffects(e.target.value)} placeholder="Esim. päänsärky, huimaus" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Vasta-aiheet (pilkulla erotettu)</Label>
                  <Input value={contraindications} onChange={(e) => setContraindications(e.target.value)} placeholder="Esim. raskaus, maksasairaus" className="mt-1" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>Peruuta</Button>
              <Button onClick={handleSave} className="bg-blue-600">Tallenna</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
