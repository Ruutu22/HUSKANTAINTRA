import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatients, useDiagnoses, useTreatments, useExaminations, useLabValues, useDiseases, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, User, Phone, AlertCircle, Plus, Search, Edit, Trash2, Activity, FlaskConical, Stethoscope, Pill } from 'lucide-react';
import type { Patient, PatientStatus, Diagnosis, Treatment, Examination, LabValue, Disease } from '@/types';

export function PotilaatPage() {
  const { user, isJYL } = useAuth();
  const { patients, addPatient, updatePatient, deletePatient, searchPatients } = usePatients();
  const { addDiagnosis, getDiagnosesByPatient } = useDiagnoses();
  const { addTreatment, getTreatmentsByPatient } = useTreatments();
  const { addExamination, getExaminationsByPatient } = useExaminations();
  const { addLabValue, getLabValuesByPatient } = useLabValues();
  const { addDisease, getDiseasesByPatient } = useDiseases();
  const { addLog } = useAuditLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Form states
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    status: 'active',
  });

  const filteredPatients = searchQuery ? searchPatients(searchQuery) : patients;

  const handleAddPatient = useCallback(() => {
    if (!user || !newPatient.firstName || !newPatient.lastName || !newPatient.birthDate) return;
    
    const id = addPatient({
      ...newPatient,
      createdBy: user.id,
    } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'>);

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_patient',
      targetId: id,
      targetName: `${newPatient.firstName} ${newPatient.lastName}`,
      details: 'Potilas lisätty rekisteriin',
    });

    setNewPatient({ status: 'active' });
    setIsAddDialogOpen(false);
  }, [user, newPatient, addPatient, addLog]);

  const handleUpdatePatient = useCallback(() => {
    if (!user || !selectedPatient) return;
    
    updatePatient(selectedPatient.id, selectedPatient);

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'update_patient',
      targetId: selectedPatient.id,
      targetName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      details: 'Potilaan tiedot päivitetty',
    });

    setIsEditDialogOpen(false);
  }, [user, selectedPatient, updatePatient, addLog]);

  const handleDeletePatient = useCallback((patient: Patient) => {
    if (!user) return;
    if (!confirm(`Haluatko varmasti poistaa potilaan ${patient.firstName} ${patient.lastName}?`)) return;
    
    deletePatient(patient.id);

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'delete_patient',
      targetId: patient.id,
      targetName: `${patient.firstName} ${patient.lastName}`,
      details: 'Potilas poistettu rekisteristä',
    });
  }, [user, deletePatient, addLog]);

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deceased': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: PatientStatus) => {
    switch (status) {
      case 'active': return 'Aktiivinen';
      case 'inactive': return 'Passiivinen';
      case 'deceased': return 'Kuollut';
      case 'transferred': return 'Siirretty';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Potilasrekisteri</h1>
          <p className="text-gray-500 mt-1">Hallinnoi potilaita ja heidän tietojaan</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0066b3] hover:bg-[#005291]">
              <Plus className="w-4 h-4 mr-2" />
              Lisää potilas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lisää uusi potilas</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Etunimi *</Label>
                <Input
                  id="firstName"
                  value={newPatient.firstName || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sukunimi *</Label>
                <Input
                  id="lastName"
                  value={newPatient.lastName || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Syntymäaika *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newPatient.birthDate ? new Date(newPatient.birthDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewPatient({ ...newPatient, birthDate: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Ammatti</Label>
                <Input
                  id="occupation"
                  value={newPatient.occupation || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, occupation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Puhelin</Label>
                <Input
                  id="phone"
                  value={newPatient.phone || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Sähköposti</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Osoite</Label>
                <Input
                  id="address"
                  value={newPatient.address || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Hätäyhteyshenkilö</Label>
                <Input
                  id="emergencyContact"
                  value={newPatient.emergencyContact || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Hätäyhteyshenkilön puhelin</Label>
                <Input
                  id="emergencyPhone"
                  value={newPatient.emergencyPhone || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyPhone: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Muistiinpanot</Label>
                <Textarea
                  id="notes"
                  value={newPatient.notes || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="allergies">Allergiat (pilkuilla eroteltuna)</Label>
                <Input
                  id="allergies"
                  value={newPatient.allergies?.join(', ') || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Esim. penisilliini, sulfa"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Peruuta</Button>
              <Button onClick={handleAddPatient} className="bg-[#0066b3] hover:bg-[#005291]">Tallenna</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Hae potilaita nimellä tai ammatilla..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelectedPatient(patient); setIsDetailDialogOpen(true); }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#0066b3] flex items-center justify-center text-white font-semibold">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{patient.firstName} {patient.lastName}</CardTitle>
                    <p className="text-sm text-gray-500">{patient.occupation || 'Ei ammattia'}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(patient.status)}>{getStatusText(patient.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(patient.birthDate).toLocaleDateString('fi-FI')} ({patient.age} v)
                </div>
                {patient.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {patient.phone}
                  </div>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-start text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="text-xs">{patient.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Ei potilaita rekisterissä</p>
        </div>
      )}

      {/* Patient Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-[#0066b3] flex items-center justify-center text-white text-xl font-semibold">
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedPatient.firstName} {selectedPatient.lastName}</DialogTitle>
                      <p className="text-gray-500">{selectedPatient.occupation || 'Ei ammattia'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setIsEditDialogOpen(true); setIsDetailDialogOpen(false); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Muokkaa
                    </Button>
                    {isJYL && (
                      <Button variant="destructive" size="sm" onClick={() => { handleDeletePatient(selectedPatient); setIsDetailDialogOpen(false); }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Poista
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="info">Tiedot</TabsTrigger>
                  <TabsTrigger value="diagnoses">Diagnoosit</TabsTrigger>
                  <TabsTrigger value="treatments">Hoidot</TabsTrigger>
                  <TabsTrigger value="examinations">Tutkimukset</TabsTrigger>
                  <TabsTrigger value="lab">Labra</TabsTrigger>
                  <TabsTrigger value="diseases">Sairaudet</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Syntymäaika</Label>
                      <p className="font-medium">{new Date(selectedPatient.birthDate).toLocaleDateString('fi-FI')} ({selectedPatient.age} v)</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Status</Label>
                      <p className="font-medium">{getStatusText(selectedPatient.status)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Puhelin</Label>
                      <p className="font-medium">{selectedPatient.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sähköposti</Label>
                      <p className="font-medium">{selectedPatient.email || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-500">Osoite</Label>
                      <p className="font-medium">{selectedPatient.address || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Hätäyhteyshenkilö</Label>
                      <p className="font-medium">{selectedPatient.emergencyContact || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Hätäpuhelin</Label>
                      <p className="font-medium">{selectedPatient.emergencyPhone || '-'}</p>
                    </div>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div className="col-span-2">
                        <Label className="text-red-500">Allergiat</Label>
                        <p className="font-medium text-red-600">{selectedPatient.allergies.join(', ')}</p>
                      </div>
                    )}
                    {selectedPatient.notes && (
                      <div className="col-span-2">
                        <Label className="text-gray-500">Muistiinpanot</Label>
                        <p className="font-medium">{selectedPatient.notes}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="diagnoses">
                  <PatientDiagnoses patientId={selectedPatient.id} diagnoses={getDiagnosesByPatient(selectedPatient.id)} addDiagnosis={addDiagnosis} user={user} />
                </TabsContent>

                <TabsContent value="treatments">
                  <PatientTreatments patientId={selectedPatient.id} treatments={getTreatmentsByPatient(selectedPatient.id)} addTreatment={addTreatment} user={user} />
                </TabsContent>

                <TabsContent value="examinations">
                  <PatientExaminations patientId={selectedPatient.id} examinations={getExaminationsByPatient(selectedPatient.id)} addExamination={addExamination} user={user} />
                </TabsContent>

                <TabsContent value="lab">
                  <PatientLabValues patientId={selectedPatient.id} labValues={getLabValuesByPatient(selectedPatient.id)} addLabValue={addLabValue} user={user} />
                </TabsContent>

                <TabsContent value="diseases">
                  <PatientDiseases patientId={selectedPatient.id} diseases={getDiseasesByPatient(selectedPatient.id)} addDisease={addDisease} user={user} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Muokkaa potilasta</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Etunimi</Label>
                <Input
                  value={selectedPatient.firstName}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sukunimi</Label>
                <Input
                  value={selectedPatient.lastName}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Syntymäaika</Label>
                <Input
                  type="date"
                  value={new Date(selectedPatient.birthDate).toISOString().split('T')[0]}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, birthDate: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedPatient.status}
                  onValueChange={(value) => setSelectedPatient({ ...selectedPatient, status: value as PatientStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiivinen</SelectItem>
                    <SelectItem value="inactive">Passiivinen</SelectItem>
                    <SelectItem value="deceased">Kuollut</SelectItem>
                    <SelectItem value="transferred">Siirretty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ammatti</Label>
                <Input
                  value={selectedPatient.occupation || ''}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, occupation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Puhelin</Label>
                <Input
                  value={selectedPatient.phone || ''}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Osoite</Label>
                <Input
                  value={selectedPatient.address || ''}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Peruuta</Button>
            <Button onClick={handleUpdatePatient} className="bg-[#0066b3] hover:bg-[#005291]">Tallenna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components for patient details
function PatientDiagnoses({ patientId, diagnoses, addDiagnosis, user }: { patientId: string; diagnoses: Diagnosis[]; addDiagnosis: any; user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState<Partial<Diagnosis>>({ isPrimary: false, isChronic: false });

  const handleAdd = () => {
    if (!user || !newDiagnosis.code || !newDiagnosis.name) return;
    addDiagnosis({
      ...newDiagnosis,
      patientId,
      diagnosedBy: user.id,
      diagnosedByName: user.name,
    } as Omit<Diagnosis, 'id' | 'diagnosedAt'>);
    setIsAdding(false);
    setNewDiagnosis({ isPrimary: false, isChronic: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Diagnoosit</h3>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" />Lisää</Button>
      </div>
      
      {isAdding && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Koodi (ICD-10)" value={newDiagnosis.code || ''} onChange={(e) => setNewDiagnosis({ ...newDiagnosis, code: e.target.value })} />
            <Input placeholder="Nimi" value={newDiagnosis.name || ''} onChange={(e) => setNewDiagnosis({ ...newDiagnosis, name: e.target.value })} />
            <Textarea className="col-span-2" placeholder="Kuvaus" value={newDiagnosis.description || ''} onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })} />
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="checkbox" checked={newDiagnosis.isPrimary} onChange={(e) => setNewDiagnosis({ ...newDiagnosis, isPrimary: e.target.checked })} className="mr-2" />
                Ensisijainen
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={newDiagnosis.isChronic} onChange={(e) => setNewDiagnosis({ ...newDiagnosis, isChronic: e.target.checked })} className="mr-2" />
                Krooninen
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Peruuta</Button>
            <Button size="sm" onClick={handleAdd}>Tallenna</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {diagnoses.map((d) => (
          <Card key={d.id} className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{d.code}</span>
                  <span>{d.name}</span>
                  {d.isPrimary && <Badge className="bg-blue-100 text-blue-800">Ensisijainen</Badge>}
                  {d.isChronic && <Badge className="bg-orange-100 text-orange-800">Krooninen</Badge>}
                </div>
                {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(d.diagnosedAt).toLocaleDateString('fi-FI')} - {d.diagnosedByName}</p>
              </div>
            </div>
          </Card>
        ))}
        {diagnoses.length === 0 && <p className="text-gray-500 text-center py-4">Ei diagnooseja</p>}
      </div>
    </div>
  );
}

function PatientTreatments({ patientId, treatments, addTreatment, user }: { patientId: string; treatments: Treatment[]; addTreatment: any; user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({ type: 'procedure' });

  const handleAdd = () => {
    if (!user || !newTreatment.name) return;
    addTreatment({
      ...newTreatment,
      patientId,
      performedBy: user.id,
      performedByName: user.name,
    } as Omit<Treatment, 'id' | 'performedAt'>);
    setIsAdding(false);
    setNewTreatment({ type: 'procedure' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Hoitotoimenpiteet</h3>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" />Lisää</Button>
      </div>

      {isAdding && (
        <Card className="p-4">
          <div className="space-y-3">
            <Select value={newTreatment.type} onValueChange={(v) => setNewTreatment({ ...newTreatment, type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="procedure">Toimenpide</SelectItem>
                <SelectItem value="surgery">Leikkaus</SelectItem>
                <SelectItem value="therapy">Terapia</SelectItem>
                <SelectItem value="medication">Lääkitys</SelectItem>
                <SelectItem value="other">Muu</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Nimi" value={newTreatment.name || ''} onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })} />
            <Textarea placeholder="Kuvaus" value={newTreatment.description || ''} onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })} />
            <Textarea placeholder="Muistiinpanot" value={newTreatment.notes || ''} onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })} />
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Peruuta</Button>
            <Button size="sm" onClick={handleAdd}>Tallenna</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {treatments.map((t) => (
          <Card key={t.id} className="p-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#0066b3]" />
              <span className="font-semibold">{t.name}</span>
              <Badge variant="outline">{t.type}</Badge>
            </div>
            {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(t.performedAt).toLocaleDateString('fi-FI')} - {t.performedByName}</p>
          </Card>
        ))}
        {treatments.length === 0 && <p className="text-gray-500 text-center py-4">Ei hoitotoimenpiteitä</p>}
      </div>
    </div>
  );
}

function PatientExaminations({ patientId, examinations, addExamination, user }: { patientId: string; examinations: Examination[]; addExamination: any; user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Examination>>({});

  const handleAdd = () => {
    if (!user || !newExam.type || !newExam.results) return;
    addExamination({
      ...newExam,
      patientId,
      performedBy: user.id,
      performedByName: user.name,
    } as Omit<Examination, 'id' | 'performedAt'>);
    setIsAdding(false);
    setNewExam({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Tutkimukset</h3>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" />Lisää</Button>
      </div>

      {isAdding && (
        <Card className="p-4">
          <div className="space-y-3">
            <Input placeholder="Tutkimustyyppi" value={newExam.type || ''} onChange={(e) => setNewExam({ ...newExam, type: e.target.value })} />
            <Textarea placeholder="Tulokset" value={newExam.results || ''} onChange={(e) => setNewExam({ ...newExam, results: e.target.value })} />
            <Textarea placeholder="Muistiinpanot" value={newExam.notes || ''} onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })} />
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Peruuta</Button>
            <Button size="sm" onClick={handleAdd}>Tallenna</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {examinations.map((e) => (
          <Card key={e.id} className="p-3">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-[#0066b3]" />
              <span className="font-semibold">{e.type}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{e.results}</p>
            {e.notes && <p className="text-sm text-gray-500 mt-1">{e.notes}</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(e.performedAt).toLocaleDateString('fi-FI')} - {e.performedByName}</p>
          </Card>
        ))}
        {examinations.length === 0 && <p className="text-gray-500 text-center py-4">Ei tutkimuksia</p>}
      </div>
    </div>
  );
}

function PatientLabValues({ patientId, labValues, addLabValue, user }: { patientId: string; labValues: LabValue[]; addLabValue: any; user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLab, setNewLab] = useState<Partial<LabValue>>({ isAbnormal: false });

  const handleAdd = () => {
    if (!user || !newLab.testName || !newLab.value) return;
    addLabValue({
      ...newLab,
      patientId,
      orderedBy: user.id,
      orderedByName: user.name,
      takenAt: new Date(),
    } as Omit<LabValue, 'id'>);
    setIsAdding(false);
    setNewLab({ isAbnormal: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Laboratorioarvot</h3>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" />Lisää</Button>
      </div>

      {isAdding && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Testin nimi" value={newLab.testName || ''} onChange={(e) => setNewLab({ ...newLab, testName: e.target.value })} />
            <Input placeholder="Arvo" value={newLab.value || ''} onChange={(e) => setNewLab({ ...newLab, value: e.target.value })} />
            <Input placeholder="Yksikkö" value={newLab.unit || ''} onChange={(e) => setNewLab({ ...newLab, unit: e.target.value })} />
            <Input placeholder="Viitearvo" value={newLab.referenceRange || ''} onChange={(e) => setNewLab({ ...newLab, referenceRange: e.target.value })} />
            <label className="flex items-center col-span-2">
              <input type="checkbox" checked={newLab.isAbnormal} onChange={(e) => setNewLab({ ...newLab, isAbnormal: e.target.checked })} className="mr-2" />
              Poikkeava
            </label>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Peruuta</Button>
            <Button size="sm" onClick={handleAdd}>Tallenna</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {labValues.map((l) => (
          <Card key={l.id} className={`p-3 ${l.isAbnormal ? 'border-red-300 bg-red-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className={`w-4 h-4 ${l.isAbnormal ? 'text-red-500' : 'text-[#0066b3]'}`} />
                <span className="font-semibold">{l.testName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold ${l.isAbnormal ? 'text-red-600' : ''}`}>{l.value} {l.unit}</span>
                {l.isAbnormal && <Badge className="bg-red-100 text-red-800">Poikkeava</Badge>}
              </div>
            </div>
            {l.referenceRange && <p className="text-sm text-gray-500">Viite: {l.referenceRange}</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(l.takenAt).toLocaleDateString('fi-FI')} - {l.orderedByName}</p>
          </Card>
        ))}
        {labValues.length === 0 && <p className="text-gray-500 text-center py-4">Ei labra-arvoja</p>}
      </div>
    </div>
  );
}

function PatientDiseases({ patientId, diseases, addDisease, user }: { patientId: string; diseases: Disease[]; addDisease: any; user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDisease, setNewDisease] = useState<Partial<Disease>>({ isActive: true });

  const handleAdd = () => {
    if (!user || !newDisease.name) return;
    addDisease({
      ...newDisease,
      patientId,
    } as Omit<Disease, 'id'>);
    setIsAdding(false);
    setNewDisease({ isActive: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Sairaudet</h3>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-1" />Lisää</Button>
      </div>

      {isAdding && (
        <Card className="p-4">
          <div className="space-y-3">
            <Input placeholder="Sairauden nimi" value={newDisease.name || ''} onChange={(e) => setNewDisease({ ...newDisease, name: e.target.value })} />
            <Input placeholder="ICD-10 koodi" value={newDisease.icd10Code || ''} onChange={(e) => setNewDisease({ ...newDisease, icd10Code: e.target.value })} />
            <label className="flex items-center">
              <input type="checkbox" checked={newDisease.isActive} onChange={(e) => setNewDisease({ ...newDisease, isActive: e.target.checked })} className="mr-2" />
              Aktiivinen
            </label>
            <Textarea placeholder="Muistiinpanot" value={newDisease.notes || ''} onChange={(e) => setNewDisease({ ...newDisease, notes: e.target.value })} />
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Peruuta</Button>
            <Button size="sm" onClick={handleAdd}>Tallenna</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {diseases.map((d) => (
          <Card key={d.id} className={`p-3 ${d.isActive ? 'border-l-4 border-l-red-400' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="w-4 h-4 text-[#0066b3]" />
                <span className="font-semibold">{d.name}</span>
                {d.icd10Code && <Badge variant="outline">{d.icd10Code}</Badge>}
              </div>
              <Badge className={d.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                {d.isActive ? 'Aktiivinen' : 'Epäaktiivinen'}
              </Badge>
            </div>
            {d.notes && <p className="text-sm text-gray-500 mt-1">{d.notes}</p>}
            {d.diagnosedAt && <p className="text-xs text-gray-400 mt-1">Diagnoosi: {new Date(d.diagnosedAt).toLocaleDateString('fi-FI')}</p>}
          </Card>
        ))}
        {diseases.length === 0 && <p className="text-gray-500 text-center py-4">Ei sairauksia kirjattuna</p>}
      </div>
    </div>
  );
}