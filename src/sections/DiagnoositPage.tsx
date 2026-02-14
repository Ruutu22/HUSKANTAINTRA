import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDiagnoses, usePatients, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Stethoscope, 
  User, 
  Calendar, 
  Trash2, 
  BookOpen,
  ChevronRight,
  Info
} from 'lucide-react';

export function DiagnoositPage() {
  const { user, isJYL } = useAuth();
  const { diagnoses, categories, specificDiagnoses, addDiagnosis, deleteDiagnosis, getSpecificDiagnosesByCategory, getSpecificDiagnosisById } = useDiagnoses();
  const { patients, getPatientById } = usePatients();
  const { addLog } = useAuditLogs();

  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Dialog states
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedDiagnosisDetails, setSelectedDiagnosisDetails] = useState<any>(null);
  
  // Hierarchical selection for new diagnosis
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSpecificDiagnosisId, setSelectedSpecificDiagnosisId] = useState('');
  
  // New diagnosis form
  const [newDiagnosis, setNewDiagnosis] = useState({
    patientId: '',
    categoryId: '',
    specificDiagnosisId: '',
    code: '',
    name: '',
    description: '',
    isPrimary: false,
    isChronic: false,
    notes: '',
  });

  // Get specific diagnoses for selected category
  const availableSpecificDiagnoses = selectedCategoryId 
    ? getSpecificDiagnosesByCategory(selectedCategoryId)
    : [];

  // Filter diagnoses
  const filteredDiagnoses = diagnoses.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.diagnosedByName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter categories
  const filteredCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(c => c.id === selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSpecificDiagnosisId('');
    setNewDiagnosis(prev => ({ 
      ...prev, 
      categoryId,
      specificDiagnosisId: '',
      code: '',
      name: '',
    }));
  };

  const handleSpecificDiagnosisChange = (specificId: string) => {
    setSelectedSpecificDiagnosisId(specificId);
    const specific = getSpecificDiagnosisById(specificId);
    if (specific) {
      setNewDiagnosis(prev => ({
        ...prev,
        specificDiagnosisId: specificId,
        code: specific.icd10Code,
        name: specific.name,
        description: specific.description || '',
      }));
    }
  };

  const handleAddDiagnosis = () => {
    if (!user || !newDiagnosis.patientId || !newDiagnosis.name) return;
    
    addDiagnosis({
      ...newDiagnosis,
      diagnosedBy: user.id,
      diagnosedByName: user.name,
    });

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_diagnosis',
      targetName: newDiagnosis.name,
      details: `Diagnoosi ${newDiagnosis.code} lisätty potilaalle`,
    });

    // Reset form
    setNewDiagnosis({
      patientId: '',
      categoryId: '',
      specificDiagnosisId: '',
      code: '',
      name: '',
      description: '',
      isPrimary: false,
      isChronic: false,
      notes: '',
    });
    setSelectedCategoryId('');
    setSelectedSpecificDiagnosisId('');
    setIsAddDiagnosisOpen(false);
  };

  const getPatientName = (patientId: string) => {
    const patient = getPatientById(patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Tuntematon';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Ei kategoriaa';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Tuntematon kategoria';
  };

  const viewDiagnosisDetails = (diagnosis: any) => {
    const specific = diagnosis.specificDiagnosisId 
      ? getSpecificDiagnosisById(diagnosis.specificDiagnosisId)
      : specificDiagnoses.find(d => d.icd10Code === diagnosis.code);
    setSelectedDiagnosisDetails({ ...diagnosis, specificDetails: specific });
    setIsViewDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnoosit</h1>
          <p className="text-gray-500 mt-1">Hallinnoi diagnooseja hierarkkisessa järjestelmässä</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDiagnosisOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
            <Plus className="w-4 h-4 mr-2" />
            Uusi diagnoosi
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Hierarkkinen diagnoosijärjestelmä</p>
              <p className="text-sm text-blue-600 mt-1">
                <strong>Taso 1:</strong> Kategoria (esim. &quot;Sydän- ja verisuonitaudit&quot;)<br/>
                <strong>Taso 2:</strong> Spesifi diagnoosi (esim. &quot;Eteisvärinä&quot;)<br/>
                <strong>Taso 3:</strong> ICD-10 koodi (esim. &quot;I48.9&quot;)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Kaikki diagnoosit</TabsTrigger>
          <TabsTrigger value="categories">Diagnoosikategoriat</TabsTrigger>
          <TabsTrigger value="bypatient">Potilaittain</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Hae diagnooseja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Kaikki kategoriat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki kategoriat</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.code} - {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Diagnoses List */}
          <div className="grid gap-4">
            {filteredDiagnoses.map((diagnosis) => (
              <Card key={diagnosis.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewDiagnosisDetails(diagnosis)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#0066b3] flex items-center justify-center text-white">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{diagnosis.name}</h3>
                          <Badge variant="outline">{diagnosis.code}</Badge>
                          {diagnosis.isPrimary && (
                            <Badge className="bg-blue-100 text-blue-800">Ensisijainen</Badge>
                          )}
                          {diagnosis.isChronic && (
                            <Badge className="bg-orange-100 text-orange-800">Krooninen</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          <User className="w-3 h-3 inline mr-1" />
                          {getPatientName(diagnosis.patientId)}
                        </p>
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(diagnosis.diagnosedAt).toLocaleDateString('fi-FI')} - {diagnosis.diagnosedByName}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          <BookOpen className="w-3 h-3 inline mr-1" />
                          {getCategoryName(diagnosis.categoryId)}
                        </p>
                        {diagnosis.description && (
                          <p className="text-sm text-gray-600 mt-2">{diagnosis.description}</p>
                        )}
                        {diagnosis.notes && (
                          <p className="text-sm text-gray-500 mt-1 italic">{diagnosis.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      {(isJYL || diagnosis.diagnosedBy === user?.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDiagnosis(diagnosis.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDiagnoses.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Stethoscope className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Ei diagnooseja</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const categoryDiagnoses = getSpecificDiagnosesByCategory(category.id);
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">{category.code}</Badge>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">
                      {categoryDiagnoses.length} spesifiä diagnoosia
                    </p>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {categoryDiagnoses.slice(0, 10).map((diag) => (
                          <div key={diag.id} className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="font-mono text-gray-400">{diag.icd10Code}</span>
                            <span>{diag.name}</span>
                          </div>
                        ))}
                        {categoryDiagnoses.length > 10 && (
                          <p className="text-xs text-gray-400">+{categoryDiagnoses.length - 10} lisää...</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bypatient" className="space-y-4">
          {/* Group by patient */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {patients.map((patient) => {
                const patientDiagnoses = diagnoses.filter(d => d.patientId === patient.id);
                if (patientDiagnoses.length === 0) return null;
                
                return (
                  <Card key={patient.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patientDiagnoses.map((diagnosis) => (
                          <div key={diagnosis.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{diagnosis.name}</p>
                              <p className="text-sm text-gray-500">
                                {diagnosis.code} • {new Date(diagnosis.diagnosedAt).toLocaleDateString('fi-FI')}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {diagnosis.isPrimary && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Ensisijainen</Badge>
                              )}
                              {diagnosis.isChronic && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Krooninen</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Add Diagnosis Dialog with Hierarchical Selection */}
      <Dialog open={isAddDiagnosisOpen} onOpenChange={setIsAddDiagnosisOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi diagnoosi (Hierarkkinen)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Step 1: Select Patient */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Potilas *</Label>
              <Select 
                value={newDiagnosis.patientId} 
                onValueChange={(value) => setNewDiagnosis({ ...newDiagnosis, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Valitse potilas..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Step 2: Select Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taso 1: Kategoria *</Label>
              <Select 
                value={selectedCategoryId} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Valitse kategoria..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.code} - {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Select Specific Diagnosis */}
            {selectedCategoryId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Taso 2: Spesifi diagnoosi *</Label>
                <Select 
                  value={selectedSpecificDiagnosisId} 
                  onValueChange={handleSpecificDiagnosisChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse diagnoosi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecificDiagnoses.map((diag) => (
                      <SelectItem key={diag.id} value={diag.id}>
                        {diag.icd10Code} - {diag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableSpecificDiagnoses.length === 0 && (
                  <p className="text-sm text-amber-600">Ei diagnooseja tässä kategoriassa</p>
                )}
              </div>
            )}

            {/* Display Selected ICD-10 Code */}
            {newDiagnosis.code && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Taso 3: ICD-10 Koodi</p>
                <p className="text-lg font-mono text-blue-600">{newDiagnosis.code}</p>
                <p className="text-sm text-blue-700">{newDiagnosis.name}</p>
              </div>
            )}

            {/* Show diagnosis details if available */}
            {selectedSpecificDiagnosisId && (
              <div className="p-3 bg-gray-50 rounded-lg">
                {getSpecificDiagnosisById(selectedSpecificDiagnosisId)?.commonSymptoms && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-medium">Yleiset oireet:</p>
                    <p className="text-sm text-gray-600">
                      {getSpecificDiagnosisById(selectedSpecificDiagnosisId)?.commonSymptoms?.join(', ')}
                    </p>
                  </div>
                )}
                {getSpecificDiagnosisById(selectedSpecificDiagnosisId)?.typicalTreatments && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tyypilliset hoidot:</p>
                    <p className="text-sm text-gray-600">
                      {getSpecificDiagnosisById(selectedSpecificDiagnosisId)?.typicalTreatments?.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Kuvaus</Label>
              <Textarea
                value={newDiagnosis.description}
                onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })}
                placeholder="Diagnoosin kuvaus..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDiagnosis.isPrimary}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, isPrimary: e.target.checked })}
                />
                <span>Ensisijainen diagnoosi</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDiagnosis.isChronic}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, isChronic: e.target.checked })}
                />
                <span>Krooninen</span>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Muistiinpanot</Label>
              <Textarea
                value={newDiagnosis.notes}
                onChange={(e) => setNewDiagnosis({ ...newDiagnosis, notes: e.target.value })}
                placeholder="Lisätietoja..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDiagnosisOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleAddDiagnosis} 
              disabled={!newDiagnosis.patientId || !newDiagnosis.name}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Tallenna diagnoosi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Diagnosis Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Diagnoosin tiedot</DialogTitle>
          </DialogHeader>
          {selectedDiagnosisDetails && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{selectedDiagnosisDetails.name}</h3>
                <Badge variant="outline">{selectedDiagnosisDetails.code}</Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  <strong>Potilas:</strong> {getPatientName(selectedDiagnosisDetails.patientId)}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Kategoria:</strong> {getCategoryName(selectedDiagnosisDetails.categoryId)}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Todettu:</strong> {new Date(selectedDiagnosisDetails.diagnosedAt).toLocaleDateString('fi-FI')}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Lääkäri:</strong> {selectedDiagnosisDetails.diagnosedByName}
                </p>
              </div>

              {selectedDiagnosisDetails.specificDetails && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Tietoa diagnoosista</p>
                  {selectedDiagnosisDetails.specificDetails.description && (
                    <p className="text-sm text-gray-600 mb-2">{selectedDiagnosisDetails.specificDetails.description}</p>
                  )}
                  {selectedDiagnosisDetails.specificDetails.commonSymptoms && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Yleiset oireet:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDiagnosisDetails.specificDetails.commonSymptoms.map((symptom: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{symptom}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDiagnosisDetails.specificDetails.typicalTreatments && (
                    <div>
                      <p className="text-xs text-gray-500">Tyypilliset hoidot:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDiagnosisDetails.specificDetails.typicalTreatments.map((treatment: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{treatment}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedDiagnosisDetails.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Muistiinpanot</p>
                  <p className="text-sm text-yellow-700">{selectedDiagnosisDetails.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedDiagnosisDetails.isPrimary && (
                  <Badge className="bg-blue-100 text-blue-800">Ensisijainen</Badge>
                )}
                {selectedDiagnosisDetails.isChronic && (
                  <Badge className="bg-orange-100 text-orange-800">Krooninen</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
