import { useState } from 'react';
import { useSavedForms } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Archive, 
  Search, 
  Calendar, 
  User, 
  RotateCcw, 
  Trash2, 
  Eye,
  Download,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

export function ArkistoidutPage() {
  const { archivedForms, unarchiveForm, deleteForm, getFormById, searchForms } = useSavedForms();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Search through archived forms
  const filteredForms = searchForms(searchQuery, true).filter(form => {
    if (!form.isArchived) return false;
    if (activeTab === 'confidential') return form.isConfidential;
    if (activeTab === 'normal') return !form.isConfidential;
    return true;
  });

  const handleView = (formId: string) => {
    setSelectedForm(formId);
    setIsViewDialogOpen(true);
  };

  const handleUnarchive = (formId: string) => {
    unarchiveForm(formId);
  };

  const handleDelete = (formId: string) => {
    setSelectedForm(formId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedForm) {
      deleteForm(selectedForm);
      setIsDeleteDialogOpen(false);
      setSelectedForm(null);
    }
  };

  const selectedFormData = selectedForm ? getFormById(selectedForm) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Arkistoidut arvioinnit</h2>
          <p className="text-gray-500">Arkistoidut lomakkeet ja arvioinnit</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Archive className="w-4 h-4" />
          <span>{archivedForms.length} arkistoitua</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Hae arkistoituja nimellä, tyypillä tai kirjoittajalla..."
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
          {filteredForms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  {searchQuery ? 'Ei tuloksia haulle' : 'Ei arkistoituja arviointeja'}
                </p>
                <p className="text-sm text-gray-400 text-center mt-1">
                  {searchQuery ? 'Kokeile toista hakusanaa' : 'Arkistoidut lomakkeet näkyvät täällä'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                            {form.templateName}
                          </Badge>
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <Archive className="w-3 h-3 mr-1" />
                            Arkistoitu
                          </Badge>
                          {form.isConfidential && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Salassapidettävä
                            </Badge>
                          )}
                          {form.status === 'approved' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Hyväksytty
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(form.createdAt), 'dd.MM.yyyy', { locale: fi })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {form.patientName || 'Nimetön potilas'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Kirjoittanut: {form.createdByName || form.createdBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(form.id)}
                          title="Näytä"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnarchive(form.id)}
                          title="Palauta arkistosta"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(form.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Poista pysyvästi"
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedFormData?.templateName}</span>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Tulosta
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 bg-white">
              {selectedFormData && (
                <div className="printable-form">
                  <div className="watermark">.ruutu</div>
                  <div className="flex items-center gap-2 mb-4">
                    <Archive className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-600 font-semibold">ARKISTOITU</span>
                    {selectedFormData.isConfidential && (
                      <>
                        <Lock className="w-5 h-5 text-amber-600 ml-2" />
                        <span className="text-amber-600 font-semibold">SALASSAPIDETTÄVÄ</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl font-bold mb-4">{selectedFormData.templateName}</h1>
                  <p><strong>Potilas:</strong> {selectedFormData.patientName}</p>
                  <p><strong>Päivämäärä:</strong> {format(new Date(selectedFormData.createdAt), 'dd.MM.yyyy', { locale: fi })}</p>
                  <p><strong>Lääkäri:</strong> {selectedFormData.createdByName || selectedFormData.createdBy}</p>
                  <hr className="my-4" />
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(selectedFormData.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poista pysyvästi</AlertDialogTitle>
            <AlertDialogDescription>
              Oletko varma että haluat poistaa tämän arvioinnin <b>pysyvästi</b>? Toimintoa ei voi peruuttaa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Poista pysyvästi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-form, .printable-form * {
            visibility: visible;
          }
          .printable-form {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(0, 0, 0, 0.08);
            pointer-events: none;
            z-index: 1000;
            font-weight: bold;
          }
        }
      `}</style>
    </div>
  );
}
