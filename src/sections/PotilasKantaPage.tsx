import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatients, usePrescriptions, useLabOrders, useImagingStudies, useReferrals, useSavedForms, useDiagnoses, useExaminations } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  UserCircle, 
  FileText, 
  FlaskConical, 
  Scan, 
  Send, 
  Pill, 
  Download,
  AlertCircle,
  Shield,
  Stethoscope,
  FileBarChart,
  ChevronRight,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

export function PotilasKantaPage() {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { prescriptions } = usePrescriptions();
  const { orders: labOrders } = useLabOrders();
  const { studies: imagingStudies } = useImagingStudies();
  const { referrals } = useReferrals();
  const { forms } = useSavedForms();
  const { diagnoses } = useDiagnoses();
  const { examinations } = useExaminations();

  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState<any>(null);

  // Get patient's own data only
  useEffect(() => {
    if (user?.patientId) {
      const p = patients.find(pat => pat.id === user.patientId);
      setPatient(p);
    }
  }, [user, patients]);

  // Filter data for this patient only - using patientName for prescriptions since they don't have patientId
  const patientPrescriptions = prescriptions.filter(p => 
    patient && p.patientName === `${patient.firstName} ${patient.lastName}`
  );
  const patientLabOrders = labOrders.filter(l => l.patientId === user?.patientId);
  const patientImaging = imagingStudies.filter(i => i.patientId === user?.patientId);
  const patientReferrals = referrals.filter(r => r.patientId === user?.patientId);
  const patientForms = forms.filter(f => f.patientName === `${patient?.firstName} ${patient?.lastName}`);
  const patientDiagnoses = diagnoses.filter(d => d.patientId === user?.patientId);
  const patientExaminations = examinations.filter(e => e.patientId === user?.patientId);

  // Get active prescriptions only
  const activePrescriptions = patientPrescriptions.filter(p => {
    if (!p.validUntil) return true;
    return new Date(p.validUntil) > new Date();
  });

  const downloadPDF = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tiedosto ladattu');
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Potilastietoja ei löytynyt</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Ota yhteyttä henkilökuntaan.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-[#0066b3]" />
            Omat terveystiedot
          </h1>
          <p className="text-gray-500 mt-1">
            {patient.firstName} {patient.lastName} • {format(new Date(patient.birthDate), 'dd.MM.yyyy')}
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700">
          <Shield className="w-3 h-3 mr-1" />
          Suojattu yhteys
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePrescriptions.length}</p>
                <p className="text-xs text-gray-500">Voimassa olevat reseptit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patientLabOrders.length}</p>
                <p className="text-xs text-gray-500">Laboratoriotutkimukset</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patientImaging.length}</p>
                <p className="text-xs text-gray-500">Kuvantamistutkimukset</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patientForms.length}</p>
                <p className="text-xs text-gray-500">Asiakirjat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <FileBarChart className="w-4 h-4" />
            <span className="hidden md:inline">Yhteenveto</span>
          </TabsTrigger>
          <TabsTrigger value="diagnoses" className="flex items-center gap-1">
            <Stethoscope className="w-4 h-4" />
            <span className="hidden md:inline">Diagnoosit</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-1">
            <Pill className="w-4 h-4" />
            <span className="hidden md:inline">Reseptit</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden md:inline">Labra</span>
          </TabsTrigger>
          <TabsTrigger value="imaging" className="flex items-center gap-1">
            <Scan className="w-4 h-4" />
            <span className="hidden md:inline">Kuvantaminen</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            <span className="hidden md:inline">Lähetteet</span>
          </TabsTrigger>
          <TabsTrigger value="examinations" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span className="hidden md:inline">Tutkimukset</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Asiakirjat</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viimeisimmät tapahtumat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...patientForms.map(f => ({ ...f, date: f.createdAt, name: f.templateName })), 
                  ...patientLabOrders.map(l => ({ ...l, date: l.orderedAt, name: l.tests.map(t => t.name).join(', ') })), 
                  ...patientImaging.map(i => ({ ...i, date: i.orderedAt, name: `${i.type.toUpperCase()} - ${i.bodyPart}` }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((item: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{item.name || 'Tapahtuma'}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(item.date), 'dd.MM.yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {patientForms.length === 0 && patientLabOrders.length === 0 && patientImaging.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Ei tapahtumia</p>
                )}
              </div>
            </CardContent>
          </Card>

          {activePrescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Voimassa olevat reseptit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activePrescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{prescription.medication}</p>
                          <p className="text-sm text-gray-500">{prescription.dosage}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Voimassa
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {patientDiagnoses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aktiiviset diagnoosit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientDiagnoses.slice(0, 3).map((diagnosis) => (
                    <div key={diagnosis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">{diagnosis.name}</p>
                          <p className="text-sm text-gray-500">{diagnosis.code}</p>
                        </div>
                      </div>
                      {diagnosis.isPrimary && (
                        <Badge className="bg-blue-100 text-blue-700">Ensisijainen</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Diagnoses Tab */}
        <TabsContent value="diagnoses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnoosit</CardTitle>
              <CardDescription>Kaikki diagnoosisi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientDiagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{diagnosis.name}</p>
                          <Badge variant="outline">{diagnosis.code}</Badge>
                          {diagnosis.isPrimary && (
                            <Badge className="bg-blue-100 text-blue-700">Ensisijainen</Badge>
                          )}
                          {diagnosis.isChronic && (
                            <Badge className="bg-orange-100 text-orange-700">Krooninen</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Todettu: {format(new Date(diagnosis.diagnosedAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lääkäri: {diagnosis.diagnosedByName}
                        </p>
                        {diagnosis.description && (
                          <p className="text-sm text-gray-600 mt-2">{diagnosis.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {patientDiagnoses.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei diagnooseja</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reseptit</CardTitle>
              <CardDescription>Voimassa olevat ja vanhat reseptit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientPrescriptions.map((prescription) => {
                  const isActive = !prescription.validUntil || new Date(prescription.validUntil) > new Date();
                  return (
                    <div key={prescription.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{prescription.medication}</p>
                            {isActive ? (
                              <Badge className="bg-green-100 text-green-700">Voimassa</Badge>
                            ) : (
                              <Badge variant="secondary">Vanhentunut</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{prescription.dosage}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Kirjoitettu: {format(new Date(prescription.prescribedAt), 'dd.MM.yyyy')}
                          </p>
                          {prescription.validUntil && (
                            <p className="text-sm text-gray-500">
                              Voimassa: {format(new Date(prescription.validUntil), 'dd.MM.yyyy')}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Kirjoittaja: {prescription.prescribedByName}
                          </p>
                          {prescription.instructions && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              <strong>Ohje:</strong> {prescription.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {patientPrescriptions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei reseptejä</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Results Tab */}
        <TabsContent value="lab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laboratoriotutkimukset</CardTitle>
              <CardDescription>Tutkimukset ja tulokset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientLabOrders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{order.tests.map(t => t.name).join(', ')}</p>
                          <Badge 
                            variant={order.status === 'completed' ? 'default' : 'secondary'}
                            className={order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {order.status === 'completed' ? 'Valmis' : 
                             order.status === 'pending' ? 'Odottaa' : 'Käsittelyssä'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Tilattu: {format(new Date(order.orderedAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tilaaja: {order.orderedByName}
                        </p>
                        {order.results && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium">Tulokset:</p>
                            <p className="text-sm text-gray-600 mt-1">{order.results}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {patientLabOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei laboratoriotutkimuksia</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imaging Tab */}
        <TabsContent value="imaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kuvantamistutkimukset</CardTitle>
              <CardDescription>Röntgen, CT, MRI ja muut kuvantamistutkimukset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientImaging.map((study) => (
                  <div key={study.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{study.type.toUpperCase()} - {study.bodyPart}</p>
                          <Badge 
                            variant={study.status === 'completed' || study.status === 'reported' ? 'default' : 'secondary'}
                            className={study.status === 'completed' || study.status === 'reported' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {study.status === 'completed' || study.status === 'reported' ? 'Valmis' : 
                             study.status === 'ordered' ? 'Tilattu' : 
                             study.status === 'scheduled' ? 'Ajastettu' : 'Käsittelyssä'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{study.indication}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Tilattu: {format(new Date(study.orderedAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tilaaja: {study.orderedByName}
                        </p>
                        {study.report && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium">Lausunto:</p>
                            <p className="text-sm text-gray-600 mt-1">{study.report}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {patientImaging.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei kuvantamistutkimuksia</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lähetteet</CardTitle>
              <CardDescription>Erikoislähetteet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientReferrals.map((referral) => (
                  <div key={referral.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{referral.toSpecialty}</p>
                          <Badge 
                            variant={referral.status === 'completed' ? 'default' : 'secondary'}
                            className={referral.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                       referral.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                          >
                            {referral.status === 'completed' ? 'Täytetty' : 
                             referral.status === 'pending' ? 'Odottaa' : 'Käsittelyssä'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Laadittu: {format(new Date(referral.createdAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Laatija: {referral.fromDoctorName}
                        </p>
                        {referral.reason && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Syy:</strong> {referral.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {patientReferrals.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei lähetteitä</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examinations Tab */}
        <TabsContent value="examinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tutkimukset</CardTitle>
              <CardDescription>Lääkärin tutkimukset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientExaminations.map((exam) => (
                  <div key={exam.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{exam.type}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Päivämäärä: {format(new Date(exam.performedAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tutkija: {exam.performedByName}
                        </p>
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium">Tulokset:</p>
                          <p className="text-sm text-gray-600 mt-1">{exam.results}</p>
                        </div>
                        {exam.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Muistiinpanot:</strong> {exam.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {patientExaminations.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei tutkimuksia</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asiakirjat</CardTitle>
              <CardDescription>Lomakkeet ja muut asiakirjat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patientForms.map((form) => (
                  <div key={form.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{form.templateName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Luotu: {format(new Date(form.createdAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Luonut: {form.createdByName}
                        </p>
                        {form.isConfidential && (
                          <Badge variant="secondary" className="mt-2 bg-red-100 text-red-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Salassapidettävä
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const content = `
                            <h1>${form.templateName}</h1>
                            <p>Potilas: ${patient.firstName} ${patient.lastName}</p>
                            <p>Päivämäärä: ${format(new Date(form.createdAt), 'dd.MM.yyyy')}</p>
                            <hr>
                            <pre>${JSON.stringify(form.data, null, 2)}</pre>
                          `;
                          downloadPDF(content, `${form.templateName}_${format(new Date(form.createdAt), 'dd.MM.yyyy')}.html`);
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Lataa
                      </Button>
                    </div>
                  </div>
                ))}
                {patientForms.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Ei asiakirjoja</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-400 pt-8">
        <p>Näet tässä vain omat terveystietosi. Tietojasi ei näytetä muille potilaille.</p>
        <p className="mt-1">Kysyttävää? Ota yhteyttä henkilökuntaan.</p>
      </div>
    </div>
  );
}
