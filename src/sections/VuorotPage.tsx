import { useState, useEffect } from 'react';
import { useShiftStatus, useUsers, useWorkShifts, useCustomStatus } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarClock, 
  CheckCircle2,
  MapPin,
  User,
  Coffee,
  Briefcase,
  LogOut,
  Play,
  Square,
  History,
  Timer
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fi } from 'date-fns/locale';

export function VuorotPage() {
  const { user, isJYL, updateShiftStatus, getShiftStatus } = useAuth();
  const { getOnDutyUsers, updateShiftStatus: updateGlobalShift } = useShiftStatus();
  const { activeUsers } = useUsers();
  const { 
    startShift, 
    endShift, 
    getActiveShift, 
    getUserShifts, 
    getTotalHoursForPeriod,
    addBreakToShift
  } = useWorkShifts();
  const { updateStatus: updateCustomStatus, getUserStatus } = useCustomStatus();
  
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [activeTab, setActiveTab] = useState('status');
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  
  const myShiftStatus = getShiftStatus();
  const onDutyUsers = getOnDutyUsers();
  const activeShift = user ? getActiveShift(user.id) : null;
  const myCustomStatus = user ? getUserStatus(user.id) : null;

  // Calculate elapsed time for active shift
  useEffect(() => {
    if (!activeShift) {
      setElapsedTime('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const started = new Date(activeShift.startedAt);
      const now = new Date();
      const diffMs = now.getTime() - started.getTime() - (activeShift.breakMinutes * 60 * 1000);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  const [status, setStatus] = useState<'available' | 'busy' | 'break' | 'offduty'>('available');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [customStatusText, setCustomStatusText] = useState('');

  const handleUpdateStatus = () => {
    const isOnDuty = status !== 'offduty';
    updateShiftStatus(isOnDuty, status, location);
    
    if (user) {
      updateGlobalShift({
        userId: user.id,
        userName: user.name,
        jobTitle: user.jobTitle,
        isOnDuty,
        startedAt: isOnDuty ? new Date() : undefined,
        location,
        status,
        note,
      });

      // Update custom status
      if (isOnDuty) {
        updateCustomStatus({
          userId: user.id,
          userName: user.name,
          status: status === 'available' ? 'available' : status === 'busy' ? 'busy' : status === 'break' ? 'break' : 'offduty',
          message: note,
          visibleToAll: true,
        });
      }
    }
    
    setIsStatusDialogOpen(false);
  };

  const handleStartShift = () => {
    if (!user) return;
    startShift(user.id, user.name, location, note);
    updateShiftStatus(true, 'available', location);
    updateCustomStatus({
      userId: user.id,
      userName: user.name,
      status: 'available',
      message: note,
      visibleToAll: true,
    });
  };

  const handleEndShift = () => {
    if (!activeShift) return;
    endShift(activeShift.id, activeShift.breakMinutes);
    updateShiftStatus(false, 'offduty');
    updateCustomStatus({
      userId: user!.id,
      userName: user!.name,
      status: 'offduty',
      visibleToAll: true,
    });
  };

  const handleAddBreak = () => {
    if (!activeShift) return;
    addBreakToShift(activeShift.id, breakMinutes);
    setIsBreakDialogOpen(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'available': return 'bg-green-100 text-green-700 border-green-300';
      case 'busy': return 'bg-red-100 text-red-700 border-red-300';
      case 'break': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'available': return <CheckCircle2 className="w-4 h-4" />;
      case 'busy': return <Briefcase className="w-4 h-4" />;
      case 'break': return <Coffee className="w-4 h-4" />;
      default: return <LogOut className="w-4 h-4" />;
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case 'available': return 'Tavoitettavissa';
      case 'busy': return 'Kiireinen';
      case 'break': return 'Tauolla';
      default: return 'Ei vuorossa';
    }
  };

  // Get work hours statistics
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: fi });
  const weekEnd = endOfWeek(today, { locale: fi });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const weekHours = user ? getTotalHoursForPeriod(user.id, weekStart, weekEnd) : 0;
  const monthHours = user ? getTotalHoursForPeriod(user.id, monthStart, monthEnd) : 0;
  const myShifts = user ? getUserShifts(user.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vuorot & Saatavuus</h2>
          <p className="text-gray-500">Hallitse omaa vuorotilannettasi ja seuraa työtunteja</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Oma tila</TabsTrigger>
          <TabsTrigger value="timer">Työaikalaskuri</TabsTrigger>
          <TabsTrigger value="team">Tiimi</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {/* My Status Card */}
          <Card className={`overflow-hidden ${activeShift ? 'border-green-400 shadow-lg shadow-green-100' : ''}`}>
            <div className={`h-1 ${activeShift ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-300'}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    activeShift 
                      ? 'bg-gradient-to-br from-green-500 to-green-400 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {activeShift ? <CheckCircle2 className="w-8 h-8" /> : <LogOut className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.jobTitle || 'Lääkäri'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={activeShift ? getStatusColor(myShiftStatus.status || 'available') : 'bg-gray-100 text-gray-600'}>
                        {activeShift ? getStatusIcon(myShiftStatus.status || 'available') : <LogOut className="w-3 h-3" />}
                        <span className="ml-1">
                          {activeShift ? getStatusText(myShiftStatus.status || 'available') : 'Ei vuorossa'}
                        </span>
                      </Badge>
                      {myShiftStatus.location && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <MapPin className="w-3 h-3 mr-1" />
                          {myShiftStatus.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!activeShift ? (
                    <Button onClick={handleStartShift} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Aloita vuoro
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => setIsStatusDialogOpen(true)} variant="outline">
                        Muokkaa tilaa
                      </Button>
                      <Button onClick={() => setIsBreakDialogOpen(true)} variant="outline">
                        <Coffee className="w-4 h-4 mr-2" />
                        Tauko
                      </Button>
                      <Button onClick={handleEndShift} variant="destructive">
                        <Square className="w-4 h-4 mr-2" />
                        Lopeta vuoro
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2" />
                Mukautettu tila
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Esim. 'Vastaanotolla klo 14 asti'"
                  value={customStatusText}
                  onChange={(e) => setCustomStatusText(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (user && customStatusText) {
                      updateCustomStatus({
                        userId: user.id,
                        userName: user.name,
                        status: 'custom',
                        customStatusText,
                        visibleToAll: true,
                      });
                      setCustomStatusText('');
                    }
                  }}
                >
                  Aseta
                </Button>
              </div>
              {myCustomStatus?.customStatusText && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{myCustomStatus.customStatusText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timer" className="space-y-4">
          {/* Work Hour Calculator */}
          {activeShift && (
            <Card className="border-green-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-green-700">
                  <Timer className="w-5 h-5 mr-2" />
                  Aktiivinen vuoro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-2">Kulunut aika (tauot vähennetty)</p>
                  <p className="text-5xl font-mono font-bold text-green-600">{elapsedTime}</p>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Alkamisaika:</span>
                      <span className="ml-2 font-medium">{format(new Date(activeShift.startedAt), 'HH:mm')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tauot:</span>
                      <span className="ml-2 font-medium">{activeShift.breakMinutes} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tämä viikko</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#0066b3]">{weekHours.toFixed(1)} h</p>
                <p className="text-xs text-gray-500">{format(weekStart, 'dd.MM')} - {format(weekEnd, 'dd.MM')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tämä kuukausi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#0066b3]">{monthHours.toFixed(1)} h</p>
                <p className="text-xs text-gray-500">{format(monthStart, 'MMMM', { locale: fi })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Shift History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <History className="w-5 h-5 mr-2" />
                Viimeisimmät vuorot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {myShifts.slice(0, 10).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{format(new Date(shift.startedAt), 'dd.MM.yyyy')}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(shift.startedAt), 'HH:mm')} - 
                        {shift.endedAt ? format(new Date(shift.endedAt), 'HH:mm') : 'Käynnissä'}
                      </p>
                    </div>
                    <div className="text-right">
                      {shift.totalHours !== undefined && (
                        <p className="font-bold text-[#0066b3]">{shift.totalHours.toFixed(2)} h</p>
                      )}
                      {shift.breakMinutes > 0 && (
                        <p className="text-xs text-gray-500">Tauot: {shift.breakMinutes} min</p>
                      )}
                    </div>
                  </div>
                ))}
                {myShifts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Ei vuorohistoriaa</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {/* On Duty Users */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#0066b3]" />
              Vuorossa olevat ({onDutyUsers.length})
            </h3>

            {onDutyUsers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">Ei ketään vuorossa tällä hetkellä</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {onDutyUsers.map((u) => (
                  <Card key={u.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066b3] to-[#00a8b3] flex items-center justify-center text-white font-semibold text-sm">
                          {u.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{u.userName}</p>
                          <p className="text-xs text-gray-500">{u.jobTitle}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getStatusColor(u.status)}>
                            {getStatusIcon(u.status)}
                          </Badge>
                          {u.location && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                              <MapPin className="w-3 h-3" />
                              {u.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {u.note && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {u.note}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* All Users */}
          {isJYL && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0066b3]" />
                Kaikki käyttäjät ({activeUsers.length})
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {activeUsers.map((u) => (
                  <Card key={u.id} className="opacity-70">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                          u.isOnDuty ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.jobTitle || u.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Päivitä vuorotilasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Tilasi</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { value: 'available', label: 'Tavoitettavissa', icon: CheckCircle2, color: 'green' },
                  { value: 'busy', label: 'Kiireinen', icon: Briefcase, color: 'red' },
                  { value: 'break', label: 'Tauolla', icon: Coffee, color: 'amber' },
                  { value: 'offduty', label: 'Ei vuorossa', icon: LogOut, color: 'gray' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatus(option.value as any)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      status === option.value 
                        ? `border-${option.color}-500 bg-${option.color}-50` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className={`w-4 h-4 text-${option.color}-600`} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {status !== 'offduty' && (
              <>
                <div>
                  <Label>Sijainti (valinnainen)</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse sijainti..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paivystys">Päivystys</SelectItem>
                      <SelectItem value="leikkaus">Leikkaussali</SelectItem>
                      <SelectItem value="vuodeosasto">Vuodeosasto</SelectItem>
                      <SelectItem value="poliklinikka">Poliklinikka</SelectItem>
                      <SelectItem value="toimisto">Toimisto</SelectItem>
                      <SelectItem value="muu">Muu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Huomio (valinnainen)</Label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Esim. Vain kiireelliset..."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              Päivitä tila
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Break Dialog */}
      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lisää tauko</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Tauon kesto (minuuttia)</Label>
            <div className="flex gap-2 mt-2">
              {[15, 30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  variant={breakMinutes === mins ? 'default' : 'outline'}
                  onClick={() => setBreakMinutes(mins)}
                  className="flex-1"
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBreakDialogOpen(false)}>Peruuta</Button>
            <Button onClick={handleAddBreak}>Lisää tauko</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
