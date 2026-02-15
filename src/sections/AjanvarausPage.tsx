import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments, usePatients, useAuditLogs, useNotifications } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, User, Clock, MapPin, XCircle } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fi } from 'date-fns/locale';

const APPOINTMENT_TYPES = [
  'Yleislääkäri',
  'Työterveyskäynti',
  'Kontrolli',
  'Jatkohoito',
  'Laboratoriokontrolli',
  'Kuvantamistulos',
  'Lausunto',
  'Muu',
];

const ROOMS = ['Vastaanotto 1', 'Vastaanotto 2', 'Vastaanotto 3', 'Toimenpidehuone', 'Konsultaatio'];

export function AjanvarausPage() {
  const { user } = useAuth();
  const { appointments, createAppointment, cancelAppointment, getTodayAppointments, getAppointmentsByDoctor } = useAppointments();
  const { patients, searchPatients } = usePatients();
  const { addLog } = useAuditLogs();
  const { sendNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('calendar');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const filteredPatients = patientSearch ? searchPatients(patientSearch) : patients;
  const todayAppointments = getTodayAppointments();
  const myAppointments = user ? getAppointmentsByDoctor(user.id) : [];

  const weekStart = startOfWeek(selectedWeek, { locale: fi });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleCreateAppointment = () => {
    if (!user || !selectedPatient || !appointmentDate || !appointmentTime || !type) return;

    const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);

    const appointmentId = createAppointment({
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      doctorId: user.id,
      doctorName: user.name,
      date: dateTime,
      duration,
      type,
      status: 'scheduled',
      room: room || undefined,
      notes,
      createdBy: user.id,
    });

    addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'create_form',
      targetName: `Ajanvaraus ${appointmentId}`,
      details: `Aika varattu: ${format(dateTime, 'dd.MM.yyyy HH:mm')}`,
    });

    setIsNewAppointmentOpen(false);
    setSelectedPatient(null);
    setAppointmentDate('');
    setAppointmentTime('');
    setDuration(30);
    setType('');
    setRoom('');
    setNotes('');
  };

  const handleCancel = (appointmentId: string) => {
    if (!confirm('Haluatko varmasti peruuttaa tämän ajan?')) return;
    
    const appointment = appointments.find(a => a.id === appointmentId);
    cancelAppointment(appointmentId);
    
    // Send notification to the doctor if patient cancelled, or to patient if doctor cancelled
    if (appointment && user) {
      const isPatientCancelling = user?.isPatient;
      const recipientId = isPatientCancelling ? appointment.doctorId : appointment.patientId;
      
      sendNotification({
        title: `Ajanvaraus peruutettu`,
        message: isPatientCancelling 
          ? `Potilas ${appointment.patientName} perui ajan ${format(new Date(appointment.date), 'dd.MM.yyyy HH:mm')}`
          : `Lääkäri ${appointment.doctorName} perui ajan ${format(new Date(appointment.date), 'dd.MM.yyyy HH:mm')}`,
        sentBy: user.id,
        sentByName: user.name,
        targetUsers: [recipientId],
        priority: 'normal',
      });
    }
    
    addLog({
      userId: user!.id,
      userName: user!.name,
      userRole: user!.role,
      action: 'update_form',
      targetName: `Ajanvaraus ${appointmentId}`,
      details: 'Aika peruutettu',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Valmis';
      case 'in_progress': return 'Meneillään';
      case 'confirmed': return 'Vahvistettu';
      case 'scheduled': return 'Varattu';
      case 'cancelled': return 'Peruutettu';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ajanvaraus</h1>
          <p className="text-gray-500 mt-1">Varaa aikoja potilaille</p>
        </div>
        <Button onClick={() => setIsNewAppointmentOpen(true)} className="bg-[#0066b3] hover:bg-[#005291]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi aika
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Kalenteri</TabsTrigger>
          <TabsTrigger value="today">Tänään ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="my">Omat ajat ({myAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0066b3]" />
                  Viikkonäkymä
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}>
                    Edellinen
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedWeek(new Date())}>
                    Tämä viikko
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}>
                    Seuraava
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="border rounded-lg p-2 min-h-[150px]">
                    <p className="text-sm font-semibold text-center mb-2">
                      {format(day, 'EEE', { locale: fi })}
                    </p>
                    <p className="text-lg font-bold text-center text-[#0066b3]">
                      {format(day, 'd')}
                    </p>
                    <div className="mt-2 space-y-1">
                      {appointments
                        .filter(a => isSameDay(new Date(a.date), day) && a.status !== 'cancelled')
                        .map(a => (
                          <div key={a.id} className="text-xs p-1 bg-blue-100 rounded truncate">
                            {format(new Date(a.date), 'HH:mm')} - {a.patientName}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today">
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {format(new Date(appointment.date), 'HH:mm')} ({appointment.duration} min)
                          {appointment.room && (
                            <>
                              <MapPin className="w-3 h-3 ml-2" />
                              {appointment.room}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(appointment.id)}>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {todayAppointments.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Ei aikoja tänään</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my">
          <div className="space-y-3">
            {myAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(appointment.date), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi ajanvaraus</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Päivämäärä</Label>
                    <Input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Aika</Label>
                    <Input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Kesto (min)</Label>
                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tapaamistyyppi</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Valitse tyyppi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Huone (valinnainen)</Label>
                  <Select value={room} onValueChange={setRoom}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Valitse huone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOMS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Muistiinpanot</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mahdolliset lisätiedot..."
                    className="w-full p-2 border rounded-md mt-1 min-h-[80px]"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>Peruuta</Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={!selectedPatient || !appointmentDate || !appointmentTime || !type}
              className="bg-[#0066b3] hover:bg-[#005291]"
            >
              Varaa aika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
