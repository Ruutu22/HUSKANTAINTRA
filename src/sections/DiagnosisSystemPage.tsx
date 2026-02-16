import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Users as UsersIcon, Stethoscope } from 'lucide-react';
import type { DiagnosisCategory, SpecificDiagnosis } from '@/types';

// Pre-populated diagnosis data
const DEFAULT_CATEGORIES: DiagnosisCategory[] = [
  { id: 'I', code: 'I00-I99', name: 'Sydän- ja verisuonisairaudet', isActive: true },
  { id: 'II', code: 'E00-E90', name: 'Endokriinisairaudet', isActive: true },
  { id: 'III', code: 'M00-M99', name: 'Tuki- ja liikuntaelinten sairaudet', isActive: true },
  { id: 'IV', code: 'G00-G99', name: 'Hermostoon liittyvät sairaudet', isActive: true },
  { id: 'V', code: 'J00-J99', name: 'Hengityselinten sairaudet', isActive: true },
];

const DEFAULT_SPECIFIC: SpecificDiagnosis[] = [
  { id: '1', categoryId: 'I', icd10Code: 'I48.9', name: 'Eteisvärinä', isActive: true },
  { id: '2', categoryId: 'I', icd10Code: 'I10', name: 'Verenpaineen nousu', isActive: true },
  { id: '3', categoryId: 'I', icd10Code: 'I21.0', name: 'Sydäninfarkti', isActive: true },
  { id: '4', categoryId: 'II', icd10Code: 'E11.9', name: 'Tyypin 2 diabetes', isActive: true },
  { id: '5', categoryId: 'II', icd10Code: 'E78.0', name: 'Kolesterolissa korkea arvo', isActive: true },
  { id: '6', categoryId: 'III', icd10Code: 'M17.0', name: 'Polvinivelten osteoartritti', isActive: true },
  { id: '7', categoryId: 'IV', icd10Code: 'G89.2', name: 'Krooninen kipu', isActive: true },
  { id: '8', categoryId: 'V', icd10Code: 'J45.0', name: 'Astma', isActive: true },
];

export function DiagnosisSystemPage() {
  const { isJYL } = useAuth();
  const [categories, setCategories] = useState<DiagnosisCategory[]>(DEFAULT_CATEGORIES);
  const [specificDiagnoses, setSpecificDiagnoses] = useState<SpecificDiagnosis[]>(DEFAULT_SPECIFIC);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewSpecificDialog, setShowNewSpecificDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [newSpecificName, setNewSpecificName] = useState('');
  const [newIcd10Code, setNewIcd10Code] = useState('');

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <UsersIcon className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Pääsy evätty</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Vain johtavalla ylilääkärillä on oikeus hallita diagnoosiluokitusta.
        </p>
      </div>
    );
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryCode.trim()) {
      toast.error('Täytä kaikki kentät');
      return;
    }

    const newCat: DiagnosisCategory = {
      id: Math.random().toString(36).substr(2, 9),
      code: newCategoryCode,
      name: newCategoryName,
      isActive: true,
    };

    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setNewCategoryCode('');
    setShowNewCategoryDialog(false);
    toast.success('Kategoria lisätty');
  };

  const handleAddSpecificDiagnosis = () => {
    if (!selectedCategoryId || !newSpecificName.trim() || !newIcd10Code.trim()) {
      toast.error('Valitse kategoria ja täytä kaikki kentät');
      return;
    }

    const newSpec: SpecificDiagnosis = {
      id: Math.random().toString(36).substr(2, 9),
      categoryId: selectedCategoryId,
      icd10Code: newIcd10Code,
      name: newSpecificName,
      isActive: true,
    };

    setSpecificDiagnoses([...specificDiagnoses, newSpec]);
    setNewSpecificName('');
    setNewIcd10Code('');
    setShowNewSpecificDialog(false);
    toast.success('Diagnoosi lisätty');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-8 h-8" />
            Diagnoosiluokituksen hallinta
          </h2>
          <p className="text-gray-500 mt-1">Hallitse diagnoosiluokitusta hierarkkisesti</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pääkategoriat</h3>
            <Button
              size="sm"
              onClick={() => setShowNewCategoryDialog(true)}
              className="bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Lisää
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => (
              <Card key={cat.id} className={cat.isActive ? '' : 'opacity-50'}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex-1 text-left p-2 rounded cursor-pointer ${
                        selectedCategoryId === cat.id ? 'bg-blue-100 border border-blue-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                      <p className="text-sm text-gray-500">{cat.code}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {specificDiagnoses.filter(s => s.categoryId === cat.id).length} diagnoosia
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCategories(categories.filter(c => c.id !== cat.id));
                        toast.success('Kategoria poistettu');
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

          {/* New Category Dialog */}
          {showNewCategoryDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowNewCategoryDialog(false); }}>
              <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Lisää uusi pääkategoria</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Kategoriakoko (esim. I00-I99) *</Label>
                    <Input
                      value={newCategoryCode}
                      onChange={(e) => setNewCategoryCode(e.target.value)}
                      placeholder="I00-I99"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Kategoian nimi *</Label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Sydän- ja verisuonisairaudet"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)} className="flex-1">
                    Peruuta
                  </Button>
                  <Button onClick={handleAddCategory} className="flex-1 bg-blue-600">
                    Lisää
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Specific Diagnoses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Yksittäiset diagnoosit</h3>
            <Button
              size="sm"
              onClick={() => setShowNewSpecificDialog(true)}
              disabled={!selectedCategoryId}
              className="bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Lisää
            </Button>
          </div>

          {!selectedCategoryId ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Valitse kategoria vasemmalla</p>
            </div>
          ) : (
            <div className="space-y-2">
              {specificDiagnoses
                .filter((s) => s.categoryId === selectedCategoryId)
                .map((diag) => (
                  <Card key={diag.id} className={diag.isActive ? '' : 'opacity-50'}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{diag.name}</h4>
                          <p className="text-sm text-gray-500">ICD-10: {diag.icd10Code}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSpecificDiagnoses(specificDiagnoses.filter(s => s.id !== diag.id));
                            toast.success('Diagnoosi poistettu');
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

          {/* New Specific Diagnosis Dialog */}
          {showNewSpecificDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowNewSpecificDialog(false); }}>
              <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Lisää diagnoosi: {categories.find(c => c.id === selectedCategoryId)?.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">ICD-10 koodi *</Label>
                    <Input
                      value={newIcd10Code}
                      onChange={(e) => setNewIcd10Code(e.target.value)}
                      placeholder="I48.9"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Diagnoosin nimi *</Label>
                    <Input
                      value={newSpecificName}
                      onChange={(e) => setNewSpecificName(e.target.value)}
                      placeholder="Eteisvärinä"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowNewSpecificDialog(false)} className="flex-1">
                    Peruuta
                  </Button>
                  <Button onClick={handleAddSpecificDiagnosis} className="flex-1 bg-blue-600">
                    Lisää
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
