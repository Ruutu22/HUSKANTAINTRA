import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useImagingStudies, usePatients, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, Plus, FileText, CheckCircle, Brain, Activity } from 'lucide-react';

const IMAGING_TYPES = [
  { id: 'xray', name: 'Röntgen', icon: Scan, description: 'Perusröntgenkuvaus' },
  { id: 'ct', name: 'CT-tutkimus', icon: Scan, description: 'Tietokonetomografia' },
  { id: 'mri', name: 'MRI', icon: Brain, description: 'Magneettikuvaus' },
  { id: 'ultrasound', name: 'Ultraääni', icon: Activity, description: 'Ultraäänitutkimus' },
  { id: 'pet', name: 'PET', icon: Scan, description: 'Positroniemissiotomografia' },
  { id: 'mammography', name: 'Mammografia', icon: Scan, description: 'Rintaröntgen' },
];

const BODY_PARTS = [
  'Pää', 'Aivot', 'Kaula', 'Rinta', 'Keuhkot', 'Sydän', 'Vatsa', 'Maksa', 'Perna', 'Munuaiset',
  'Lantio', 'Selkä', 'Niska', 'Olkapää', 'Käsivarsi', 'Kyynärpää', 'Ranne', 'Käsi',
  'Lonkka', 'Reisi', 'Polvi', 'Sääri', 'Nilkka', 'Jalka', 'Koko keho'
];

export function KuvantaminenPage() {
  const { user } = useAuth();
  const { studies, createStudy, addReport, getPendingStudies } = useImagingStudies();
  const { patients, searchPatients } = usePatients();
  const { addLog } = useAuditLogs();

  const [activeTab, setActiveTab] = useState('new');
  const [isNewStudyOpen, setIsNewStudyOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [studyType, setStudyType] = useState<string>('');
  const [bodyPart, setBodyPart] = useState<string>('');
  const [indication, setIndication] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat'>('normal');
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [reportText, setReportText] = useState('');

  const filteredPatients = patientSearch ? searchPatients(patientSearch) : patients;
  const pendingStudies = getPendingStudies();

  const handleCreateStudy = () => {
    if (!user || !selectedPatient || !studyType || !bodyPart) return;

    const studyId = createStudy({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      type: studyType as any,
      bodyPart,
      indication,
      orderedBy: user.id,
      orderedByName: user.name,
      status: 'ordered',
      priority,
    });

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_examination',
      targetName: `Kuvantamistutkimus ${studyId}`,
      details: `${studyType.toUpperCase()} tilattu: ${bodyPart}`,
    });

    setIsNewStudyOpen(false);
    setSelectedPatient(null);
    setStudyType('');
    setBodyPart('');
    setIndication('');
    setPriority('normal');
  };

  const handleAddReport = () => {
    if (!selectedStudy || !reportText.trim() || !user) return;
    
    addReport(selectedStudy.id, reportText, user.name);
    
    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_examination',
      targetName: `Kuvantamistutkimus ${selectedStudy.id}`,
      details: 'Lausunto lisätty',
    });

    setSelectedStudy(null);
    setReportText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return 'Lausuttu';
      case 'completed': return 'Valmis';
      case 'in_progress': return 'Meneillään';
      case 'scheduled': return 'Ajastettu';
      case 'ordered': return 'Tilattu';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kuvantamistutkimukset</h1>
          <p className="text-gray-500 mt-1">Tilaa ja hallinnoi kuvantamistutkimuksia</p>
        </div>
        <Button onClick={() => setIsNewStudyOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi tutkimus
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">Uusi tutkimus</TabsTrigger>
          <TabsTrigger value="pending">Odottavat ({pendingStudies.length})</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {IMAGING_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    studyType === type.id ? 'ring-2 ring-[#0066b3] bg-blue-50' : ''
                  }`}
                  onClick={() => setStudyType(type.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Icon className="w-10 h-10 text-[#0066b3] mb-2" />
                    <p className="font-semibold">{type.name}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {pendingStudies.map((study) => (
              <Card key={study.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Scan className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{study.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {IMAGING_TYPES.find(t => t.id === study.type)?.name} • {study.bodyPart}
                        </p>
                        <p className="text-xs text-gray-400">
                          Tilattu {new Date(study.orderedAt).toLocaleDateString('fi-FI')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(study.status)}>
                        {getStatusText(study.status)}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{study.orderedByName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingStudies.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                  <p className="text-gray-500">Ei odottavia tutkimuksia</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {studies.filter(s => s.status === 'reported').map((study) => (
              <Card key={study.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{study.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {IMAGING_TYPES.find(t => t.id === study.type)?.name} • {study.bodyPart}
                        </p>
                        <p className="text-xs text-gray-400">
                          Lausuttu {study.reportedAt ? new Date(study.reportedAt).toLocaleDateString('fi-FI') : '-'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedStudy(study)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Näytä lausunto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Study Dialog */}
      <Dialog open={isNewStudyOpen} onOpenChange={setIsNewStudyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi kuvantamistutkimus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Valitse potilas</Label>
              <Input
                placeholder="Hae potilasta..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="mt-1"
              />
              <ScrollArea className="max-h-40 mt-2">
                <div className="space-y-1">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-2 rounded cursor-pointer ${
                        selectedPatient?.id === patient.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.occupation || 'Ei ammattia'}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {selectedPatient && (
              <>
                <div>
                  <Label>Tutkimustyyppi</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {IMAGING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setStudyType(type.id)}
                        className={`p-2 rounded border text-sm ${
                          studyType === type.id
                            ? 'bg-blue-100 border-blue-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tutkimuskohde</Label>
                  <Select value={bodyPart} onValueChange={setBodyPart}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Valitse kohde..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_PARTS.map((part) => (
                        <SelectItem key={part} value={part}>{part}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Vastaanottoaihe / Indikaatio</Label>
                  <textarea
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                    placeholder="Miksi tutkimus tarvitaan?"
                    className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Prioriteetti</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normaali</SelectItem>
                      <SelectItem value="urgent">Kiireellinen</SelectItem>
                      <SelectItem value="stat">STAT (välitön)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewStudyOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleCreateStudy}
              disabled={!selectedPatient || !studyType || !bodyPart}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Lähetä tilaus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={!!selectedStudy} onOpenChange={() => setSelectedStudy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Radiologinen lausunto</DialogTitle>
          </DialogHeader>
          {selectedStudy && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Potilas</p>
                  <p className="font-medium">{selectedStudy.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tutkimus</p>
                  <p className="font-medium">{IMAGING_TYPES.find(t => t.id === selectedStudy.type)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kohde</p>
                  <p className="font-medium">{selectedStudy.bodyPart}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Indikaatio</p>
                  <p className="font-medium">{selectedStudy.indication || '-'}</p>
                </div>
              </div>

              {selectedStudy.report ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-medium mb-2">Lausunto:</p>
                  <pre className="whitespace-pre-wrap text-sm">{selectedStudy.report}</pre>
                  <p className="text-sm text-gray-500 mt-4">
                    Lausunut: {selectedStudy.radiologist} • {selectedStudy.reportedAt ? new Date(selectedStudy.reportedAt).toLocaleDateString('fi-FI') : '-'}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Löydökset</Label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Kirjaa radiologiset löydökset..."
                      className="w-full p-2 border rounded-md min-h-[150px]"
                    />
                  </div>
                  <Button onClick={handleAddReport} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tallenna lausunto
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
