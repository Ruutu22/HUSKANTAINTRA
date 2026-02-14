import { useState } from 'react';
import { useSavedForms } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { 
  ClipboardList, 
  Plus, 
  Search, 
  FileText,
  Calendar,
  User,
  Eye,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

export function RaportitPage() {
  const { addForm, forms } = useSavedForms();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Filter reports
  const filteredReports = forms.filter(form => {
    if (form.templateName.toLowerCase().includes('raportti') || form.templateName.toLowerCase().includes('tapahtuma')) {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          form.patientName?.toLowerCase().includes(searchLower) ||
          form.templateName?.toLowerCase().includes(searchLower) ||
          form.createdByName?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    }
    return false;
  });

  // New report form
  const [reportType, setReportType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [involved, setInvolved] = useState('');
  const [actions, setActions] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const handleCreate = () => {
    if (title.trim() && description.trim()) {
      addForm({
        templateId: 'raportti',
        templateName: title.trim(),
        patientName: location || 'Ei määritelty',
        data: {
          description,
          location,
          involved,
          actions,
          followUp,
          reportType,
        },
        createdBy: user?.name || 'Tuntematon',
        createdByName: user?.name,
        isArchived: false,
        isConfidential,
        status: isConfidential ? 'pending' : 'approved',
      });

      // Reset
      setTitle('');
      setDescription('');
      setLocation('');
      setInvolved('');
      setActions('');
      setFollowUp('');
      setReportType('');
      setIsConfidential(false);
      setIsCreateDialogOpen(false);
    }
  };

  const selectedReportData = selectedReport ? forms.find(f => f.id === selectedReport) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raportit</h2>
          <p className="text-gray-500">Tapahtumaraportit ja dokumentaatio</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]">
          <Plus className="w-4 h-4 mr-2" />
          Uusi raportti
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Hae raporteista..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              {searchQuery ? 'Ei tuloksia haulle' : 'Ei raportteja'}
            </p>
            <p className="text-sm text-gray-400 text-center mt-1">
              Luo uusi raportti painamalla yllä olevaa nappia
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <ClipboardList className="w-3 h-3 mr-1" />
                        Raportti
                      </Badge>
                      {report.isConfidential && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Salassapidettävä
                        </Badge>
                      )}
                      {report.status === 'pending' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Odottaa hyväksyntää
                        </Badge>
                      )}
                      {report.status === 'approved' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Hyväksytty
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{report.templateName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {report.createdByName || report.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(report.createdAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                      </span>
                      {report.data?.location && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {report.data.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Uusi tapahtumaraportti</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div>
                <Label>Raportin otsikko *</Label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Esim. Potilastapaus 13.2.2025"
                />
              </div>
              <div>
                <Label>Tapahtumapaikka</Label>
                <Input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Esim. Päivystys, leikkaussali 3"
                />
              </div>
              <div>
                <Label>Tapahtuman kuvaus *</Label>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kuvaile tapahtuma yksityiskohtaisesti..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Osalliset henkilöt</Label>
                <Input 
                  value={involved}
                  onChange={(e) => setInvolved(e.target.value)}
                  placeholder="Esim. Dr. Virtanen, hoitaja Nieminen"
                />
              </div>
              <div>
                <Label>Toimenpiteet</Label>
                <Textarea 
                  value={actions}
                  onChange={(e) => setActions(e.target.value)}
                  placeholder="Mitä toimenpiteitä tehtiin?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Jatkotoimenpiteet / Suositukset</Label>
                <Textarea 
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Mitkä ovat jatkotoimenpiteet?"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <input 
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded border-amber-400"
                />
                <div>
                  <Label htmlFor="confidential" className="cursor-pointer font-medium text-amber-800">
                    Merkitse salassapidettäväksi
                  </Label>
                  <p className="text-xs text-amber-600">
                    Raportti vaatii esihenkilön hyväksynnän ennen kuin se näkyy muille
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!title.trim() || !description.trim()}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              Tallenna raportti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedReportData?.templateName}</span>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Tulosta
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedReportData && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  {selectedReportData.isConfidential && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Salassapidettävä
                    </Badge>
                  )}
                  {selectedReportData.status === 'approved' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Hyväksytty
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Kirjoittaja</Label>
                    <p className="font-medium">{selectedReportData.createdByName || selectedReportData.createdBy}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Päivämäärä</Label>
                    <p className="font-medium">
                      {format(new Date(selectedReportData.createdAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                    </p>
                  </div>
                  {selectedReportData.data?.location && (
                    <div>
                      <Label className="text-gray-500">Paikka</Label>
                      <p className="font-medium">{selectedReportData.data.location}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Label className="text-gray-500">Kuvaus</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedReportData.data?.description}</p>
                </div>

                {selectedReportData.data?.involved && (
                  <div className="border-t pt-4">
                    <Label className="text-gray-500">Osalliset</Label>
                    <p className="mt-1">{selectedReportData.data.involved}</p>
                  </div>
                )}

                {selectedReportData.data?.actions && (
                  <div className="border-t pt-4">
                    <Label className="text-gray-500">Toimenpiteet</Label>
                    <p className="mt-1 whitespace-pre-wrap">{selectedReportData.data.actions}</p>
                  </div>
                )}

                {selectedReportData.data?.followUp && (
                  <div className="border-t pt-4">
                    <Label className="text-gray-500">Jatkotoimenpiteet</Label>
                    <p className="mt-1 whitespace-pre-wrap">{selectedReportData.data.followUp}</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
