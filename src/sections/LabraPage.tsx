import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLabOrders, usePatients, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Plus, Calendar, FileText, CheckCircle, Clock, User } from 'lucide-react';

const COMMON_LAB_TESTS = [
  { code: 'B-Hb', name: 'Hemoglobiini', category: 'Verenkuva', unit: 'g/L', ref: 'Miehet: 134-170, Naiset: 117-153' },
  { code: 'B-Leuk', name: 'Leukosyytit', category: 'Verenkuva', unit: 'E9/L', ref: '3.4-8.2' },
  { code: 'B-Trom', name: 'Trombosyytit', category: 'Verenkuva', unit: 'E9/L', ref: '150-360' },
  { code: 'P-Gluk', name: 'Glukoosi', category: 'Metabolismi', unit: 'mmol/L', ref: '4.0-6.0' },
  { code: 'P-Krea', name: 'Kreatiniini', category: 'Munuaiset', unit: 'µmol/L', ref: 'Miehet: 60-100, Naiset: 50-90' },
  { code: 'P-ALAT', name: 'ALAT', category: 'Maksa', unit: 'U/L', ref: 'Miehet: 15-50, Naiset: 15-40' },
  { code: 'P-CRP', name: 'CRP', category: 'Tulehdus', unit: 'mg/L', ref: '<3' },
  { code: 'P-TSH', name: 'TSH', category: 'Kilpirauhanen', unit: 'mU/L', ref: '0.4-4.0' },
  { code: 'P-Kol', name: 'Kolesteroli', category: 'Lipidit', unit: 'mmol/L', ref: '<5.0' },
  { code: 'P-LDL', name: 'LDL-kolesteroli', category: 'Lipidit', unit: 'mmol/L', ref: '<3.0' },
  { code: 'P-HDL', name: 'HDL-kolesteroli', category: 'Lipidit', unit: 'mmol/L', ref: '>1.0' },
  { code: 'P-Trigly', name: 'Triglyseridit', category: 'Lipidit', unit: 'mmol/L', ref: '<1.7' },
  { code: 'B-INR', name: 'INR', category: 'Hyytyminen', unit: '', ref: '2.0-3.0 (warfarin)' },
  { code: 'P-PTT', name: 'PTT', category: 'Hyötyminen', unit: 's', ref: '28-40' },
  { code: 'E-PVK', name: 'PVK+Diffi', category: 'Verenkuva', unit: '', ref: '' },
];

export function LabraPage() {
  const { user } = useAuth();
  const { orders, createOrder, completeOrder, updateOrder, getPendingOrders } = useLabOrders();
  const { patients, searchPatients } = usePatients();
  const { addLog } = useAuditLogs();

  const [activeTab, setActiveTab] = useState('new');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat'>('normal');
  const [notes, setNotes] = useState('');
  const [resultsText, setResultsText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredPatients = patientSearch ? searchPatients(patientSearch) : patients;
  const pendingOrders = getPendingOrders();

  const handleCreateOrder = () => {
    if (!user || !selectedPatient || selectedTests.length === 0) return;

    const tests = selectedTests.map(testCode => {
      const testInfo = COMMON_LAB_TESTS.find(t => t.code === testCode);
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: testInfo?.name || testCode,
        code: testCode,
        category: testInfo?.category || 'Muu',
        status: 'pending' as const,
      };
    });

    const orderId = createOrder({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      orderedBy: user.id,
      orderedByName: user.name,
      tests,
      status: 'pending',
      priority,
      notes,
    });

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_lab',
      targetName: `Labratilaus ${orderId}`,
      details: `Tilattu ${tests.length} testiä potilaalle ${selectedPatient.firstName} ${selectedPatient.lastName}`,
    });

    setIsNewOrderOpen(false);
    setSelectedPatient(null);
    setSelectedTests([]);
    setNotes('');
    setPriority('normal');
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder || !resultsText.trim()) return;
    
    completeOrder(selectedOrder.id, resultsText);
    
    addLog({
      userId: user!.id,
      userName: user!.name,
      userRole: user!.role,
      action: 'update_form',
      targetName: `Labratilaus ${selectedOrder.id}`,
      details: 'Tulokset kirjattu',
    });

    setSelectedOrder(null);
    setResultsText('');
  };

  const handleSendForTesting = (orderId: string) => {
    if (!user) return;
    
    updateOrder(orderId, { status: 'in_progress' });
    
    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'update_form',
      targetName: `Labratilaus ${orderId}`,
      details: 'Lähetetty tutkimukseen',
    });
  };

  const handleOpenResults = (order: any) => {
    setSelectedOrder(order);
    setResultsText('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratoriotilaukset</h1>
          <p className="text-gray-500 mt-1">Tilaa laboratoriotutkimuksia ja seuraa tuloksia</p>
        </div>
        <Button onClick={() => setIsNewOrderOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi tilaus
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">Uusi tilaus</TabsTrigger>
          <TabsTrigger value="pending">Odottavat ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#0066b3]" />
                Valmiit testipaketit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Perusverenkuva', tests: ['B-Hb', 'B-Leuk', 'B-Trom', 'E-PVK'] },
                  { name: 'Maksa-arvot', tests: ['P-ALAT', 'P-Krea'] },
                  { name: 'Lipidit', tests: ['P-Kol', 'P-LDL', 'P-HDL', 'P-Trigly'] },
                  { name: 'Kilpirauhanen', tests: ['P-TSH'] },
                  { name: 'Tulehdus', tests: ['P-CRP'] },
                  { name: 'Hyötyminen', tests: ['B-INR', 'P-PTT'] },
                ].map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedTests([...new Set([...selectedTests, ...pkg.tests])])}
                    className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                  >
                    <p className="font-medium text-sm">{pkg.name}</p>
                    <p className="text-xs text-gray-500">{pkg.tests.length} testiä</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yksittäiset testit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {COMMON_LAB_TESTS.map((test) => (
                  <label
                    key={test.code}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                      selectedTests.includes(test.code)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTests([...selectedTests, test.code]);
                        } else {
                          setSelectedTests(selectedTests.filter(t => t !== test.code));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{test.name}</p>
                      <p className="text-xs text-gray-500">{test.code} • {test.unit}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            {pendingOrders.filter(o => user?.isPatient ? o.patientId === user.patientId : true).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {order.tests.length} testiä • Tilattu {new Date(order.orderedAt).toLocaleDateString('fi-FI')}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {order.tests.slice(0, 3).map((test) => (
                            <Badge key={test.id} variant="outline" className="text-xs">
                              {test.code}
                            </Badge>
                          ))}
                          {order.tests.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{order.tests.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority === 'stat' ? 'STAT' : order.priority === 'urgent' ? 'Kiireellinen' : 'Normaali'}
                      </Badge>
                      <p className="text-sm text-gray-500">{order.orderedByName}</p>
                      <div className="flex gap-2 mt-2">
                        {order.status === 'pending' && !user?.isPatient && (
                          <Button 
                            onClick={() => handleSendForTesting(order.id)}
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Lähetä tutkimukseen
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleOpenResults(order)}
                          size="sm" 
                          variant="outline"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {order.results ? 'Katsele tuloksia' : 'Kirjaa tuloksia'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingOrders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                  <p className="text-gray-500">Ei odottavia tilauksia</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {orders.filter(o => o.status === 'completed').filter(o => user?.isPatient ? o.patientId === user.patientId : true).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.patientName}</p>
                        <p className="text-sm text-gray-500">
                          Valmistunut {order.completedAt ? new Date(order.completedAt).toLocaleDateString('fi-FI') : '-'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Näytä tulokset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi laboratoriotilaus</DialogTitle>
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
                  <Label>Valitut testit ({selectedTests.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTests.map((testCode) => {
                      const test = COMMON_LAB_TESTS.find(t => t.code === testCode);
                      return (
                        <Badge key={testCode} className="bg-blue-100 text-blue-800">
                          {test?.name || testCode}
                        </Badge>
                      );
                    })}
                  </div>
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

                <div>
                  <Label>Lisätiedot</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kirjoita mahdolliset lisätiedot..."
                    className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={!selectedPatient || selectedTests.length === 0}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Lähetä tilaus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Labratulokset</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{selectedOrder.patientName}</span>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{new Date(selectedOrder.orderedAt).toLocaleDateString('fi-FI')}</span>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="font-medium mb-2">Tulokset:</p>
                {selectedOrder.results ? (
                  <pre className="whitespace-pre-wrap text-sm">{selectedOrder.results}</pre>
                ) : (
                  <textarea
                    value={resultsText}
                    onChange={(e) => setResultsText(e.target.value)}
                    placeholder="Kirjaa tulokset tähän..."
                    className="w-full p-2 border rounded-md min-h-[150px]"
                  />
                )}
              </div>

              {!selectedOrder.results && (
                <Button onClick={handleCompleteOrder} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Merkitse valmiiksi
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
