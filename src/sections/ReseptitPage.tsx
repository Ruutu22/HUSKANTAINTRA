import { useState } from 'react';
import { usePrescriptions, usePatients, usePatientDocuments } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pill, 
  Plus, 
  Search, 
  User,
  Calendar,
  Trash2,
  FileText,
  Download,
  Clock,
  Lock,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { toast } from 'sonner';
import { medications } from '@/data/medications';
import { checkDrugAllergies, checkDrugInteractions } from '@/data/drugAlerts';
import { AllergyAlerts } from '@/components/AllergyAlerts';

export function ReseptitPage() {
  const { prescriptions, addPrescription, deletePrescription, searchPrescriptions } = usePrescriptions();
  const { searchPatients } = usePatients();
  const { addDocument } = usePatientDocuments();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // New prescription form
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [isConfidential, setIsConfidential] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [showMedicationList, setShowMedicationList] = useState(false);
  
  // Allergy and interaction warnings
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);
  const [interactionWarnings, setInteractionWarnings] = useState<Array<{medication: string; severity: 'minor' | 'moderate' | 'severe'; description: string}>>([]);

  // Filter medications
  const filteredMedications = medicationSearch 
    ? medications.filter(m => 
        m.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
        m.activeIngredient.toLowerCase().includes(medicationSearch.toLowerCase())
      )
    : [];

  // Search prescriptions
  const filteredPrescriptions = searchPrescriptions(searchQuery).filter(p => {
    // If patient is logged in, only show their prescriptions
    if (user?.isPatient) {
      if (p.patientId !== user.patientId) return false;
    }
    
    if (activeTab === 'confidential') return p.isConfidential;
    if (activeTab === 'normal') return !p.isConfidential;
    return true;
  });

  const handleSelectMedication = (med: any) => {
    setMedication(med.name);
    setDosage(med.dosage?.adult || 'Määritä annostus');
    setInstructions(med.instructions);
    setShowMedicationList(false);
    setMedicationSearch('');
    
    // Check for allergies and interactions
    if (selectedPatient) {
      const allergies = selectedPatient.allergies || [];
      const newAlergies = checkDrugAllergies(med.name, allergies);
      setAllergyWarnings(newAlergies);
      
      // Check interactions with existing prescriptions
      const existingPrescriptions = prescriptions.filter(p => p.patientId === selectedPatient.id);
      const existingMeds = existingPrescriptions.map(p => p.medication);
      const interactions = checkDrugInteractions(existingMeds, med.name);
      setInteractionWarnings(interactions);
    }
  };

  const handleCreate = () => {
    if (!selectedPatient || !medication.trim() || !dosage.trim()) {
      toast.error('Täytä kaikki pakolliset kentät');
      return;
    }

    // Check for critical allergies
    if (allergyWarnings.length > 0) {
      const message = `VAROITUS: Potilaalla on allergia seuraaviin lääkkeiden ainesosiin: ${allergyWarnings.join(', ')}. Haluatko silti kirjoittaa reseptin?`;
      if (!confirm(message)) {
        return;
      }
    }

    // Check for critical interactions
    const severeInteractions = interactionWarnings.filter(i => i.severity === 'severe');
    if (severeInteractions.length > 0) {
      const message = `KRIITTINEN VAROITUS: Lääkkeen seuraavat yhdysvaikutukset on merkitty kriittisinä:\n${severeInteractions.map(i => `- ${i.medication}: ${i.description}`).join('\n')}\n\nHaluatko silti jatkaa?`;
      if (!confirm(message)) {
        return;
      }
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validDays || '30'));

    addPrescription({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      medication: medication.trim(),
      dosage: dosage.trim(),
      instructions: instructions.trim(),
      prescribedBy: user?.id || '',
      prescribedByName: user?.name,
      validUntil,
      isConfidential,
    });

    // Also add as patient document so patient can see it
    if (!isConfidential) {
      addDocument({
        patientId: selectedPatient.id,
        name: `Resepti: ${medication}`,
        type: 'prescription',
        content: JSON.stringify({
          medication: medication.trim(),
          dosage: dosage.trim(),
          instructions: instructions.trim(),
          prescribedByName: user?.name,
          prescribedAt: new Date(),
          validUntil,
        }),
        uploadedBy: user?.id || '',
        uploadedByName: user?.name || '',
        isVisibleToPatient: true,
        description: `Resepti määrätty: ${medication}`,
      });
      toast.success('Resepti tallennettu potilaan tietoihin');
    }

    // Reset form
    setSelectedPatient(null);
    setPatientSearch('');
    setMedication('');
    setDosage('');
    setInstructions('');
    setValidDays('30');
    setIsConfidential(false);
    setAllergyWarnings([]);
    setInteractionWarnings([]);
    setIsCreateDialogOpen(false);
    toast.success('Resepti kirjoitettu');
  };

  const handleView = (id: string) => {
    setSelectedPrescription(id);
    setIsViewDialogOpen(true);
  };

  const selectedPrescriptionData = selectedPrescription 
    ? prescriptions.find(p => p.id === selectedPrescription) 
    : null;

  const handlePrint = () => {
    window.print();
  };

  const filteredPatients = patientSearch ? searchPatients(patientSearch) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reseptit</h2>
          <p className="text-gray-500">Hallitse potilaiden reseptejä</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi resepti
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Hae potilaan, lääkkeen tai kirjoittajan nimellä..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">Kaikki</TabsTrigger>
          <TabsTrigger value="normal">Normaalit</TabsTrigger>
          <TabsTrigger value="confidential" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Salassapidettävät
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPrescriptions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pill className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  {searchQuery ? 'Ei tuloksia haulle' : 'Ei reseptejä'}
                </p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  {searchQuery ? 'Kokeile toista hakusanaa' : 'Luo uusi resepti painamalla yllä olevaa nappia'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Pill className="w-3 h-3 mr-1" />
                            Resepti
                          </Badge>
                          {prescription.isConfidential && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Salassapidettävä
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(prescription.prescribedAt), 'dd.MM.yyyy', { locale: fi })}
                          </span>
                          {prescription.validUntil && (
                            <span className={`text-xs flex items-center gap-1 ${
                              new Date(prescription.validUntil) < new Date() 
                                ? 'text-red-500' 
                                : 'text-amber-600'
                            }`}>
                              <Clock className="w-3 h-3" />
                              Voimassa: {format(new Date(prescription.validUntil), 'dd.MM.yyyy', { locale: fi })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {prescription.patientName}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>{prescription.medication}</strong> - {prescription.dosage}
                        </p>
                        {prescription.instructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            {prescription.instructions}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Kirjoittanut: {prescription.prescribedByName || 'Tuntematon'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(prescription.id)}
                          title="Näytä"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePrescription(prescription.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Poista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Prescription Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi resepti</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Patient Selection */}
            <div>
              <Label>Valitse potilas *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setSelectedPatient(null);
                  }}
                  placeholder="Hae potilasta..."
                  className="pl-10"
                />
              </div>
              {!selectedPatient && patientSearch && filteredPatients.length > 0 && (
                <ScrollArea className="max-h-40 mt-2 border rounded-md">
                  <div className="space-y-1 p-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setPatientSearch('');
                        }}
                        className="p-2 rounded cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200"
                      >
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-500">{format(new Date(patient.birthDate), 'dd.MM.yyyy')}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {selectedPatient && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Medication Selection */}
            <div>
              <Label>Lääke *</Label>
              <div className="relative">
                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  value={medication}
                  onChange={(e) => {
                    setMedication(e.target.value);
                    setMedicationSearch(e.target.value);
                    setShowMedicationList(true);
                    setAllergyWarnings([]);
                    setInteractionWarnings([]);
                  }}
                  onFocus={() => setShowMedicationList(true)}
                  placeholder="Hae lääkettä tai kirjoita nimi..."
                  className="pl-10"
                />
              </div>
              {showMedicationList && medicationSearch && filteredMedications.length > 0 && (
                <ScrollArea className="max-h-48 mt-2 border rounded-md">
                  <div className="space-y-1 p-2">
                    {filteredMedications.map((med, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMedication(med)}
                        className="p-2 rounded cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200"
                      >
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-500">{med.activeIngredient} • {med.dosage?.adult}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {/* Allergy and Interaction Warnings */}
              <div className="mt-3">
                <AllergyAlerts allergyWarnings={allergyWarnings} interactionWarnings={interactionWarnings} />
              </div>
            </div>

            <div>
              <Label>Annostus *</Label>
              <Input 
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Esim. 1 tabletti 3x päivässä"
              />
            </div>
            <div>
              <Label>Ohjeet</Label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Esim. Otettava ruoan kanssa"
                className="w-full p-2 border rounded-md min-h-[80px]"
              />
            </div>
            <div>
              <Label>Voimassaolo (päivää)</Label>
              <Input 
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <input 
                type="checkbox"
                id="confidentialRx"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="rounded border-amber-400 w-4 h-4"
              />
              <Label htmlFor="confidentialRx" className="cursor-pointer font-medium text-amber-800">
                Merkitse salassapidettäväksi (ei näy potilaalle)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!selectedPatient || !medication.trim() || !dosage.trim()}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Pill className="w-4 h-4 mr-2" />
              Kirjoita resepti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Resepti</span>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Tulosta
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedPrescriptionData && (
            <div className="printable-prescription">
              {/* Printable Area with proper borders */}
              <div 
                className="bg-white p-8"
                style={{
                  border: '3px solid #000',
                  minHeight: '500px',
                  position: 'relative'
                }}
              >
                {/* Inner border */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    bottom: '8px',
                    border: '1px solid #666',
                    pointerEvents: 'none'
                  }}
                />
                
                {/* Watermark */}
                <div 
                  className="watermark"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    fontSize: '60px',
                    color: 'rgba(0, 102, 179, 0.08)',
                    pointerEvents: 'none',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}
                >
                  HUS
                </div>

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <svg width="40" height="32" viewBox="0 0 28 24" fill="none">
                      <path d="M14 0L28 12L14 24L0 12L14 0Z" fill="#00a8b3"/>
                    </svg>
                    <span className="text-4xl font-bold text-[#0066b3]">HUS</span>
                  </div>
                  <p className="text-sm text-gray-600">Helsingin yliopistollinen sairaala</p>
                  <div className="mt-4 pb-3 border-b-2 border-gray-800">
                    <p className="text-xl font-bold tracking-wide">LÄÄKEMÄÄRÄYS / RESEPTI</p>
                  </div>
                  {selectedPrescriptionData.isConfidential && (
                    <Badge variant="secondary" className="mt-3 bg-amber-100 text-amber-700 text-sm px-3 py-1">
                      <Lock className="w-4 h-4 mr-1" />
                      SALASSAPIDETTÄVÄ
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between border-b border-gray-300 pb-3">
                    <div>
                      <p className="text-sm text-gray-500">Päivämäärä</p>
                      <p className="font-medium text-lg">
                        {format(new Date(selectedPrescriptionData.prescribedAt), 'dd.MM.yyyy', { locale: fi })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Voimassa asti</p>
                      <p className="font-medium text-lg">
                        {selectedPrescriptionData.validUntil 
                          ? format(new Date(selectedPrescriptionData.validUntil), 'dd.MM.yyyy', { locale: fi })
                          : 'Ei määritelty'}
                      </p>
                    </div>
                  </div>

                  <div className="border-b-2 border-gray-800 py-4 bg-gray-50 px-4">
                    <p className="text-sm text-gray-500">POTILAS</p>
                    <p className="text-2xl font-bold">{selectedPrescriptionData.patientName}</p>
                  </div>

                  <div className="py-3">
                    <p className="text-sm text-gray-500">LÄÄKE</p>
                    <p className="text-xl font-bold text-[#0066b3]">{selectedPrescriptionData.medication}</p>
                  </div>

                  <div className="py-3 border-b border-gray-300">
                    <p className="text-sm text-gray-500">ANNOSTUS</p>
                    <p className="font-medium text-lg">{selectedPrescriptionData.dosage}</p>
                  </div>

                  {selectedPrescriptionData.instructions && (
                    <div className="py-3 border-b border-gray-300">
                      <p className="text-sm text-gray-500">OHJEET</p>
                      <p className="font-medium">{selectedPrescriptionData.instructions}</p>
                    </div>
                  )}

                  {/* Footer with signature */}
                  <div className="pt-8 mt-8 border-t-2 border-gray-800">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500">Määrännyt</p>
                        <p className="font-medium text-lg">{selectedPrescriptionData.prescribedByName || 'Tuntematon'}</p>
                        <p className="text-sm text-gray-400">
                          {selectedPrescriptionData.prescribedByName?.includes('ylilääkäri') ? 'Johtava ylilääkäri' : 'Lääkäri'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div 
                          style={{
                            borderBottom: '2px solid #000',
                            width: '250px',
                            height: '60px',
                            marginBottom: '8px'
                          }}
                        />
                        <p className="text-sm font-medium">Allekirjoitus ja leima</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
                    <p>HUS - Helsingin yliopistollinen sairaala</p>
                    <p>Meilahden tornisairaala, Haartmaninkatu 4, 00290 Helsinki</p>
                    <p>Puh. 09 4711 | www.hus.fi</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-prescription, .printable-prescription * {
            visibility: visible !important;
          }
          .printable-prescription {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 99999 !important;
            background: white !important;
            padding: 20px !important;
          }
          .watermark {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
