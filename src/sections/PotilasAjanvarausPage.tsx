import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatients, useAppointments, useUsers, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, MapPin, X, CalendarDays, History, Plus, Check } from 'lucide-react';
import { format, isSameDay, isAfter } from 'date-fns';
import { fi } from 'date-fns/locale';
import { toast } from 'sonner';

const APPOINTMENT_TYPES = [
  { value: 'yleislaakari', label: 'Yleislääkäri', duration: 30 },
  { value: 'kontrolli', label: 'Kontrollikäynti', duration: 20 },
  { value: 'lausunto', label: 'Lausunto', duration: 15 },
  { value: 'jatkohoito', label: 'Jatkohoito', duration: 30 },
  { value: 'muu', label: 'Muu asia', duration: 30 },
];

export function PotilasAjanvarausPage() {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { appointments, createAppointment, cancelAppointment } = useAppointments();
  const { users } = useUsers();
  const { addLog } = useAuditLogs();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [patient, setPatient] = useState<any>(null);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Get patient's own data
  useEffect(() => {
    if (user?.patientId) {
      const p = patients.find(pat => pat.id === user.patientId);
      setPatient(p);
    }
  }, [user, patients]);

  // Filter appointments for this patient only
  const patientAppointments = appointments.filter(a => a.patientId === user?.patientId);
  
  const upcomingAppointments = patientAppointments
    .filter(a => ['scheduled', 'confirmed'].includes(a.status) && isAfter(new Date(a.date), new Date()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = patientAppointments
    .filter(a => a.status === 'completed' || !isAfter(new Date(a.date), new Date()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get available doctors (staff users)
  const doctors = users.filter(u => 
    ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'].includes(u.role)
  );

  // Generate available time slots (simplified - in real app would check doctor's schedule)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 16; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if time slot is available for doctor
  const isTimeSlotAvailable = (doctorId: string, date: string, time: string) => {
    if (!date || !time || !doctorId) return true;
    const dateTime = new Date(`${date}T${time}`);
    const doctorAppointments = appointments.filter(a => 
      a.doctorId === doctorId && 
      ['scheduled', 'confirmed'].includes(a.status) &&
      isSameDay(new Date(a.date), dateTime)
    );
    // Check if any appointment overlaps
    return !doctorAppointments.some(a => {
      const apptStart = new Date(a.date);
      const apptEnd = new Date(apptStart.getTime() + a.duration * 60000);
      return dateTime >= apptStart && dateTime < apptEnd;
    });
  };

  const handleBookAppointment = () => {
    if (!user || !patient || !selectedDoctor || !selectedDate || !selectedTime || !selectedType) {
      toast.error('Täytä kaikki kentät');
      return;
    }

    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    const appointmentType = APPOINTMENT_TYPES.find(t => t.value === selectedType);

    createAppointment({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: selectedDoctor,
      doctorName: doctors.find(d => d.id === selectedDoctor)?.name || 'Lääkäri',
      date: dateTime,
      duration: appointmentType?.duration || 30,
      type: appointmentType?.label || 'Muu',
      status: 'scheduled',
      createdBy: user.id,
    });

    addLog({
      userId: user.id,
      userName: user.name || patient.firstName,
      userRole: 'POTILAS',
      action: 'create_form',
      targetName: 'Ajanvaraus',
      details: `Potilas varasi ajan: ${appointmentType?.label}`,
    });

    toast.success('Aika varattu onnistuneesti!');
    setIsBookDialogOpen(false);
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedType('');
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (!confirm('Haluatko varmasti peruuttaa tämän ajan?')) return;
    
    cancelAppointment(appointmentId);
    
    if (user) {
      addLog({
        userId: user.id,
        userName: user.name || patient?.firstName || 'Potilas',
        userRole: 'POTILAS',
        action: 'update_form',
        targetName: 'Ajanvaraus',
        details: 'Potilas perui ajan',
      });
    }
    
    toast.success('Aika peruutettu');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Täytetty';
      case 'confirmed': return 'Vahvistettu';
      case 'scheduled': return 'Varattu';
      case 'cancelled': return 'Peruutettu';
      default: return status;
    }
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Potilastietoja ei löytynyt</h2>
        <p className="text-gray-500 text-center max-w-md mt-2">
          Ota yhteyttä henkilökuntaan saadaksesi lisätietoja.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-[#0066b3]" />
            Omat ajat
          </h1>
          <p className="text-gray-500 mt-1">
            Tarkastele ja varaa aikoja
          </p>
        </div>
        <Button 
          onClick={() => setIsBookDialogOpen(true)}
          className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Varaa aika
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                <p className="text-xs text-gray-500">Tulevat ajat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pastAppointments.filter(a => a.status === 'completed').length}</p>
                <p className="text-xs text-gray-500">Täytetyt käynnit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patientAppointments.length}</p>
                <p className="text-xs text-gray-500">Kaikki ajat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            Tulevat ajat ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-1">
            <History className="w-4 h-4" />
            Menneet ajat ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Ei tulevia aikoja</p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  Varaa uusi aika painamalla "Varaa aika" -nappia
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Clock className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">{appointment.type}</p>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {appointment.doctorName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(appointment.date), 'dd.MM.yyyy', { locale: fi })}
                            <span className="mx-1">•</span>
                            <Clock className="w-4 h-4" />
                            {format(new Date(appointment.date), 'HH:mm')}
                            <span className="text-gray-400">({appointment.duration} min)</span>
                          </p>
                          {appointment.room && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {appointment.room}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Peruuta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Ei menneitä aikoja</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <History className="w-7 h-7 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{appointment.type}</p>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.date), 'dd.MM.yyyy', { locale: fi })} • {' '}
                          {format(new Date(appointment.date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Book Appointment Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Varaa uusi aika</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Select Doctor */}
            <div>
              <label className="text-sm font-medium mb-2 block">Valitse lääkäri *</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse lääkäri..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.jobTitle || 'Lääkäri'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Käynnin tyyppi *</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse tyyppi..." />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Date */}
            <div>
              <label className="text-sm font-medium mb-2 block">Päivämäärä *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Select Time */}
            {selectedDate && selectedDoctor && (
              <div>
                <label className="text-sm font-medium mb-2 block">Aika *</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isAvailable = isTimeSlotAvailable(selectedDoctor, selectedDate, time);
                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable}
                        className={`p-2 text-sm rounded-md border ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isAvailable
                            ? 'bg-white hover:bg-blue-50 border-gray-300'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Harmaat ajat ovat jo varattuja
                </p>
              </div>
            )}

            {/* Summary */}
            {selectedDoctor && selectedDate && selectedTime && selectedType && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Varauksen tiedot:</p>
                <p className="text-sm text-blue-800 mt-1">
                  {APPOINTMENT_TYPES.find(t => t.value === selectedType)?.label} {' '}
                  {format(new Date(selectedDate), 'dd.MM.yyyy')} klo {selectedTime}
                </p>
                <p className="text-sm text-blue-800">
                  Lääkäri: {doctors.find(d => d.id === selectedDoctor)?.name}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleBookAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime || !selectedType}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Check className="w-4 h-4 mr-2" />
              Varaa aika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
