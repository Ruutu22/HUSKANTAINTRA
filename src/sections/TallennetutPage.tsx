import { useState } from 'react';
import { useSavedForms, useApprovalRequests, useUsers } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Edit2, 
  Trash2, 
  Archive, 
  Search,
  Calendar,
  User,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

interface TallennetutPageProps {
  onEditForm?: (formId: string) => void;
}

export function TallennetutPage({ onEditForm }: TallennetutPageProps) {
  const { forms, deleteForm, archiveForm, renameForm, getFormById, searchForms } = useSavedForms();
  const { addRequest, approveRequest, rejectRequest, getPendingRequests } = useApprovalRequests();
  const { activeUsers } = useUsers();
  const { isJYL, canApprove, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRequestConfidentialOpen, setIsRequestConfidentialOpen] = useState(false);
  const [isPasswordProtectionOpen, setIsPasswordProtectionOpen] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [newName, setNewName] = useState('');
  const [visibleToUsers, setVisibleToUsers] = useState<string[]>([]);
  const [rejectionReason] = useState('');
  const [confidentialPassword, setConfidentialPassword] = useState('');
  const [confidentialPasswordError, setConfidentialPasswordError] = useState('');

  const filteredForms = searchForms(searchQuery).filter(form => {
    if (activeTab === 'confidential') return form.isConfidential;
    if (activeTab === 'pending') return form.status === 'pending';
    if (activeTab === 'approved') return form.status === 'approved';
    return true;
  });

  const pendingApprovals = getPendingRequests();

  const handleView = (formId: string) => {
    const form = getFormById(formId);
    if (form?.isConfidential) {
      // Require password for confidential documents
      setSelectedForm(formId);
      setIsPasswordProtectionOpen(true);
      setConfidentialPassword('');
      setConfidentialPasswordError('');
    } else {
      setSelectedForm(formId);
      setIsViewDialogOpen(true);
    }
  };

  const handleConfidentialPasswordSubmit = () => {
    if (!confidentialPassword) {
      setConfidentialPasswordError('Syötä salasana');
      return;
    }
    
    // Check password against user's edit password (should match to view confidential)
    // For now, we'll use a simplified check - in production, this would verify against user's actual password
    if (confidentialPassword === 'confidential') {
      setIsPasswordProtectionOpen(false);
      setSelectedForm(selectedForm);
      setIsViewDialogOpen(true);
      setConfidentialPassword('');
    } else {
      setConfidentialPasswordError('Väärä salasana');
    }
  };

  const handleEditClick = (formId: string) => {
    if (isJYL) {
      onEditForm?.(formId);
    } else {
      setSelectedForm(formId);
      setIsEditDialogOpen(true);
      setEditPassword('');
      setEditError('');
    }
  };

  const handleRequestConfidential = (formId: string) => {
    setSelectedForm(formId);
    setIsRequestConfidentialOpen(true);
  };

  const submitConfidentialRequest = () => {
    if (selectedForm) {
      const form = getFormById(selectedForm);
      if (form) {
        addRequest({
          formId: selectedForm,
          formName: form.templateName,
          requestedBy: user?.id || '',
          requestedByName: user?.name || '',
          status: 'pending',
        });
        // Update form status
        // This would need to be connected to the storage hook
      }
      setIsRequestConfidentialOpen(false);
    }
  };

  const handleApprove = (requestId: string) => {
    approveRequest(requestId, user?.id || '', visibleToUsers);
    setIsApprovalDialogOpen(false);
  };

  const handleReject = (requestId: string) => {
    rejectRequest(requestId, rejectionReason);
    setIsApprovalDialogOpen(false);
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

  const handleArchive = (formId: string) => {
    archiveForm(formId);
  };

  const handleRenameClick = (formId: string) => {
    const form = getFormById(formId);
    setSelectedForm(formId);
    setNewName(form?.patientName || '');
    setIsRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (selectedForm && newName.trim()) {
      renameForm(selectedForm, newName.trim());
      setIsRenameDialogOpen(false);
      setSelectedForm(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedFormData = selectedForm ? getFormById(selectedForm) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tallennetut arvioinnit</h2>
          <p className="text-gray-500">Hallitse tallennettuja lomakkeita ja arviointeja</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>{forms.length} tallennettua</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Hae nimellä, lomakkeen tyypillä tai kirjoittajalla..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="all">Kaikki</TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Hyväksytyt
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Odottaa
          </TabsTrigger>
          <TabsTrigger value="confidential" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Salassapidettävät
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredForms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  {searchQuery ? 'Ei tuloksia haulle' : 'Ei tallennettuja arviointeja'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {form.templateName}
                          </Badge>
                          {form.isConfidential && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Salassapidettävä
                            </Badge>
                          )}
                          {form.status === 'pending' && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3 mr-1" />
                              Odottaa hyväksyntää
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
                          onClick={() => handleEditClick(form.id)}
                          title="Muokkaa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRenameClick(form.id)}
                          title="Nimeä uudelleen"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        {!form.isConfidential && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRequestConfidential(form.id)}
                            title="Pyydä salassapitoa"
                          >
                            <Lock className="w-4 h-4 text-amber-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(form.id)}
                          title="Arkistoi"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(form.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Poista"
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

      {/* Pending Approvals Section for Supervisors */}
      {canApprove() && pendingApprovals.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Hyväksyntää odottavat ({pendingApprovals.length})
          </h3>
          <div className="grid gap-3">
            {pendingApprovals.map((request) => (
              <Card key={request.id} className="border-amber-300 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{request.formName}</p>
                      <p className="text-sm text-gray-600">
                        Pyytänyt: {request.requestedByName} • {format(new Date(request.requestedAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsApprovalDialogOpen(true)}
                        className="border-green-500 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Hyväksy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Hylkää
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedFormData?.templateName}</span>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Tallenna PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 bg-white">
              {selectedFormData && (
                <div className="printable-form">
                  <div className="watermark">.ruutu</div>
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

      {/* Edit Password Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Vaaditaan salasana
            </DialogTitle>
            <DialogDescription>
              Lääkäreiden muokkaus vaatii erillisen salasanan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Syötä salasana..."
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            {editError && (
              <p className="text-sm text-red-500">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Peruuta
            </Button>
            <Button onClick={() => {
              if (editPassword === 'Muokkaalaakarit') {
                setIsEditDialogOpen(false);
                if (selectedForm) onEditForm?.(selectedForm);
              } else {
                setEditError('Virheellinen salasana');
              }
            }}>
              Vahvista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Confidential Dialog */}
      <Dialog open={isRequestConfidentialOpen} onOpenChange={setIsRequestConfidentialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Pyydä salassapitoa
            </DialogTitle>
            <DialogDescription>
              Tämä arviointi vaatii esihenkilön hyväksynnän ennen kuin se näkyy muille
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Hyväksyntäpyyntö lähetetään johtavalle ylilääkärille
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestConfidentialOpen(false)}>
              Peruuta
            </Button>
            <Button onClick={submitConfidentialRequest} className="bg-amber-600 hover:bg-amber-700">
              <Send className="w-4 h-4 mr-2" />
              Lähetä pyyntö
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Hyväksy salassapidettäväksi</DialogTitle>
            <DialogDescription>
              Valitse ketkä saavat nähdä tämän arvioinnin hyväksynnän jälkeen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Näkyvyys</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {activeUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={visibleToUsers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleToUsers([...visibleToUsers, u.id]);
                        } else {
                          setVisibleToUsers(visibleToUsers.filter(id => id !== u.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{u.name} ({u.jobTitle || u.role})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={() => pendingApprovals[0] && handleApprove(pendingApprovals[0].id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Hyväksy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poista arviointi</AlertDialogTitle>
            <AlertDialogDescription>
              Oletko varma että haluat poistaa tämän arvioinnin? Toimintoa ei voi peruuttaa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Poista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nimeä uudelleen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Potilaan nimi..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Peruuta
            </Button>
            <Button onClick={confirmRename}>
              Tallenna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Protection Dialog for Confidential Documents */}
      <Dialog open={isPasswordProtectionOpen} onOpenChange={setIsPasswordProtectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salassapidettävä dokumentti</DialogTitle>
            <DialogDescription>
              Tämä dokumentti on merkitty salassapidettäväksi. Syötä salasanasi nähdäksesi sen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="confidentialPassword">Salasana</Label>
              <Input
                id="confidentialPassword"
                type="password"
                placeholder="Syötä salasanasi"
                value={confidentialPassword}
                onChange={(e) => {
                  setConfidentialPassword(e.target.value);
                  setConfidentialPasswordError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleConfidentialPasswordSubmit()}
              />
              {confidentialPasswordError && (
                <p className="text-sm text-red-500 mt-2">{confidentialPasswordError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordProtectionOpen(false)}>
              Peruuta
            </Button>
            <Button onClick={handleConfidentialPasswordSubmit}>
              Jatka
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
