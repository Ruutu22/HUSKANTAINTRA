import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs, useUsers } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Download, Trash2, User, Calendar, 
  FileText, Activity, AlertTriangle
} from 'lucide-react';
import type { LogAction } from '@/types';

const ACTION_LABELS: Record<LogAction, string> = {
  login: 'Kirjautuminen',
  logout: 'Uloskirjautuminen',
  view_patient: 'Potilaan katselu',
  create_patient: 'Potilaan luonti',
  update_patient: 'Potilaan päivitys',
  delete_patient: 'Potilaan poisto',
  create_diagnosis: 'Diagnoosin luonti',
  create_treatment: 'Hoidon luonti',
  create_examination: 'Tutkimuksen luonti',
  create_lab: 'Labra-arvon luonti',
  view_form: 'Lomakkeen katselu',
  create_form: 'Lomakkeen luonti',
  update_form: 'Lomakkeen päivitys',
  delete_form: 'Lomakkeen poisto',
  archive_form: 'Lomakkeen arkistointi',
  export_pdf: 'PDF-vienti',
  create_prescription: 'Reseptin luonti',
  send_notification: 'Ilmoituksen lähetys',
  update_settings: 'Asetusten päivitys',
  chat_message: 'Viesti',
  create_note: 'Muistion luonti',
  update_note: 'Muistion päivitys',
  approve_request: 'Hyväksyntä',
};

const ACTION_COLORS: Record<LogAction, string> = {
  login: 'bg-green-100 text-green-800',
  logout: 'bg-gray-100 text-gray-800',
  view_patient: 'bg-blue-100 text-blue-800',
  create_patient: 'bg-green-100 text-green-800',
  update_patient: 'bg-yellow-100 text-yellow-800',
  delete_patient: 'bg-red-100 text-red-800',
  create_diagnosis: 'bg-purple-100 text-purple-800',
  create_treatment: 'bg-cyan-100 text-cyan-800',
  create_examination: 'bg-indigo-100 text-indigo-800',
  create_lab: 'bg-pink-100 text-pink-800',
  view_form: 'bg-blue-100 text-blue-800',
  create_form: 'bg-green-100 text-green-800',
  update_form: 'bg-yellow-100 text-yellow-800',
  delete_form: 'bg-red-100 text-red-800',
  archive_form: 'bg-orange-100 text-orange-800',
  export_pdf: 'bg-gray-100 text-gray-800',
  create_prescription: 'bg-teal-100 text-teal-800',
  send_notification: 'bg-blue-100 text-blue-800',
  update_settings: 'bg-purple-100 text-purple-800',
  chat_message: 'bg-gray-100 text-gray-800',
  create_note: 'bg-yellow-100 text-yellow-800',
  update_note: 'bg-yellow-100 text-yellow-800',
  approve_request: 'bg-green-100 text-green-800',
};

export function LokitPage() {
  const { isJYL } = useAuth();
  const { logs, searchLogs, clearOldLogs } = useAuditLogs();
  const { users } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Filter logs
  let filteredLogs = logs;
  
  if (searchQuery) {
    filteredLogs = searchLogs(searchQuery);
  }
  
  if (filterUser !== 'all') {
    filteredLogs = filteredLogs.filter(l => l.userId === filterUser);
  }
  
  if (filterAction !== 'all') {
    filteredLogs = filteredLogs.filter(l => l.action === filterAction);
  }
  
  if (dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59);
    filteredLogs = filteredLogs.filter(l => {
      const ts = new Date(l.timestamp);
      return ts >= start && ts <= end;
    });
  }

  const handleExport = () => {
    const csv = [
      ['Aika', 'Käyttäjä', 'Rooli', 'Toiminto', 'Kohde', 'Tiedot'].join(';'),
      ...filteredLogs.map(l => [
        new Date(l.timestamp).toLocaleString('fi-FI'),
        l.userName,
        l.userRole,
        ACTION_LABELS[l.action] || l.action,
        l.targetName || '-',
        l.details || '-',
      ].join(';')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hus_lokit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleClearOld = () => {
    if (!confirm('Haluatko poistaa yli 30 päivää vanhat lokit?')) return;
    clearOldLogs(30);
  };

  if (!isJYL) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Pääsy kielletty</h1>
        <p className="text-gray-500 mt-2">Vain johtava ylilääkäri voi tarkastella lokeja</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toimintaloki</h1>
          <p className="text-gray-500 mt-1">Käyttäjien toimintojen auditointiloki</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Vie CSV
          </Button>
          <Button variant="outline" onClick={handleClearOld}>
            <Trash2 className="w-4 h-4 mr-2" />
            Poista vanhat
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Haku</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hae lokeista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Käyttäjä</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Kaikki</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Toiminto</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Kaikki</SelectItem>
                  {Object.entries(ACTION_LABELS).map(([action, label]) => (
                    <SelectItem key={action} value={action}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aikaväli</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Lokitapahtumat
            </span>
            <Badge variant="outline">{filteredLogs.length} kpl</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#0066b3] flex items-center justify-center text-white text-xs font-semibold">
                        {log.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.userName}</span>
                          <Badge className={ACTION_COLORS[log.action]}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {log.userRole}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(log.timestamp).toLocaleString('fi-FI')}
                          </span>
                        </div>
                        {log.targetName && (
                          <div className="flex items-center space-x-2 mt-1">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{log.targetName}</span>
                          </div>
                        )}
                        {log.details && (
                          <p className="text-sm text-gray-500 mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Ei lokimerkintöjä</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

