import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals, usePatients, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Plus, FileText, CheckCircle, Clock, Stethoscope } from 'lucide-react';

const SPECIALTIES = [
  'Kardiologia',
  'Neurologia',
  'Ortopedia',
  'Ihotaudit',
  'Silmätaudit',
  'Korva-, nenä- ja kurkkutaudit',
  'Gynekologia',
  'Urologia',
  'Gastroenterologia',
  'Keuhkosairaudet',
  'Psykiatria',
  'Reumatologia',
  'Endokrinologia',
  'Onkologia',
  'Anestesiologia',
];

export function LahetteetPage() {
  const { user } = useAuth();
  const { referrals, createReferral, sendReferral, getPendingReferrals } = useReferrals();
  const { patients, searchPatients } = usePatients();
  const { addLog } = useAuditLogs();

  const [activeTab, setActiveTab] = useState('new');
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [toSpecialty, setToSpecialty] = useState<string>('');
  const [toDoctorName, setToDoctorName] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalInfo, setClinicalInfo] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const filteredPatients = patientSearch ? searchPatients(patientSearch) : patients;
  const pendingReferrals = getPendingReferrals();

  const handleCreateReferral = () => {
    if (!user || !selectedPatient || !toSpecialty || !reason) return;

    const referralId = createReferral({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      fromDoctorId: user.id,
      fromDoctorName: user.name,
      toSpecialty,
      toDoctorName: toDoctorName || undefined,
      reason,
      urgency,
      status: 'pending',
      diagnosis,
      clinicalInfo,
    });

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_form',
      targetName: `Lähete ${referralId}`,
      details: `Lähete luotu: ${toSpecialty}`,
    });

    setIsNewReferralOpen(false);
    setSelectedPatient(null);
    setToSpecialty('');
    setToDoctorName('');
    setReason('');
    setUrgency('routine');
    setDiagnosis('');
    setClinicalInfo('');
  };

  const handleSendReferral = (referralId: string) => {
    sendReferral(referralId);
    
    addLog({
      userId: user!.id,
      userName: user!.name,
      userRole: user!.role,
      action: 'update_form',
      targetName: `Lähete ${referralId}`,
      details: 'Lähete lähetetty',
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lähetteet</h1>
          <p className="text-gray-500 mt-1">Lähetä potilaita erikoislääkäreille</p>
        </div>
        <Button onClick={() => setIsNewReferralOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi lähete
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">Uusi lähete</TabsTrigger>
          <TabsTrigger value="pending">Odottavat ({pendingReferrals.length})</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#0066b3]" />
                Erikoisalat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {SPECIALTIES.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => {
                      setToSpecialty(specialty);
                      setIsNewReferralOpen(true);
                    }}
                    className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                  >
                    <p className="font-medium text-sm">{specialty}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {pendingReferrals.map((referral) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{referral.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {referral.toSpecialty} {referral.toDoctorName && `• ${referral.toDoctorName}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          Luotu {new Date(referral.createdAt).toLocaleDateString('fi-FI')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getUrgencyColor(referral.urgency)}>
                        {referral.urgency === 'emergency' ? 'PÄIVYSTYS' : referral.urgency === 'urgent' ? 'Kiireellinen' : 'Rutiini'}
                      </Badge>
                      <div>
                        {referral.status === 'pending' ? (
                          <Button size="sm" onClick={() => handleSendReferral(referral.id)}>
                            <Send className="w-4 h-4 mr-2" />
                            Lähetä
                          </Button>
                        ) : (
                          <Badge className={getStatusColor(referral.status)}>
                            {referral.status === 'sent' ? 'Lähetetty' : referral.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingReferrals.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                  <p className="text-gray-500">Ei odottavia lähetteitä</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {referrals.filter(r => r.status === 'completed').map((referral) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{referral.patientName}</p>
                        <p className="text-sm text-gray-500">{referral.toSpecialty}</p>
                        <p className="text-xs text-gray-400">
                          Valmistunut {referral.completedAt ? new Date(referral.completedAt).toLocaleDateString('fi-FI') : '-'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedReferral(referral)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Näytä
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Referral Dialog */}
      <Dialog open={isNewReferralOpen} onOpenChange={setIsNewReferralOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi lähete</DialogTitle>
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
                  <Label>Erikoisala</Label>
                  <Select value={toSpecialty} onValueChange={setToSpecialty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Valitse erikoisala..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Vastaanottava lääkäri (valinnainen)</Label>
                  <Input
                    value={toDoctorName}
                    onChange={(e) => setToDoctorName(e.target.value)}
                    placeholder="Esim. Dr. Virtanen"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Lähettämisperuste</Label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Miksi potilas lähetetään?"
                    className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Kiireellisyys</Label>
                  <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Rutiini</SelectItem>
                      <SelectItem value="urgent">Kiireellinen</SelectItem>
                      <SelectItem value="emergency">Päivystys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Diagnoosi / Epäily</Label>
                  <Input
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Esim. Epäilty sydänsairaus"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Kliiniset tiedot</Label>
                  <textarea
                    value={clinicalInfo}
                    onChange={(e) => setClinicalInfo(e.target.value)}
                    placeholder="Oireet, löydökset, aikaisemmat tutkimukset..."
                    className="w-full p-2 border rounded-md mt-1 min-h-[100px]"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewReferralOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleCreateReferral}
              disabled={!selectedPatient || !toSpecialty || !reason}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Luo lähete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Referral Dialog */}
      <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lähetteen tiedot</DialogTitle>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Potilas</p>
                  <p className="font-medium">{selectedReferral.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Erikoisala</p>
                  <p className="font-medium">{selectedReferral.toSpecialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lähettävä lääkäri</p>
                  <p className="font-medium">{selectedReferral.fromDoctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kiireellisyys</p>
                  <Badge className={getUrgencyColor(selectedReferral.urgency)}>
                    {selectedReferral.urgency}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="font-medium mb-2">Lähettämisperuste:</p>
                <p className="text-sm">{selectedReferral.reason}</p>
              </div>

              {selectedReferral.diagnosis && (
                <div>
                  <p className="font-medium">Diagnoosi / Epäily:</p>
                  <p className="text-sm">{selectedReferral.diagnosis}</p>
                </div>
              )}

              {selectedReferral.clinicalInfo && (
                <div>
                  <p className="font-medium">Kliiniset tiedot:</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedReferral.clinicalInfo}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
