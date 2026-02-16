import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Check, X } from 'lucide-react';
import { getCriticalityLabel, getCriticalityColor } from '@/data/criticalDiagnoses';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

interface DiagnosisApprovalProps {
  diagnosis: {
    id: string;
    name: string;
    code: string;
    patientId: string;
    patientName: string;
    severity: string;
    diagnosedByName?: string;
    diagnosedAt: Date;
    status?: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    notes?: string;
  };
  onApprove?: (diagnosisId: string, notes: string) => void;
  onReject?: (diagnosisId: string, reason: string) => void;
  currentUserRole?: string;
  isDialog?: boolean;
}

export function DiagnosisApproval({
  diagnosis,
  onApprove,
  onReject,
  currentUserRole,
  isDialog = true,
}: DiagnosisApprovalProps) {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  const isAlreadyApproved = diagnosis.status === 'approved';
  const isAlreadyRejected = diagnosis.status === 'rejected';
  const isPending = diagnosis.status === 'pending';
  const canApprove = currentUserRole === 'JYL' && isPending;

  const handleApprove = () => {
    if (onApprove) {
      onApprove(diagnosis.id, approvalNotes);
      setApprovalNotes('');
      setApprovalAction(null);
      setIsApprovalDialogOpen(false);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(diagnosis.id, rejectionReason);
      setRejectionReason('');
      setApprovalAction(null);
      setIsApprovalDialogOpen(false);
    }
  };

  if (isDialog) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsApprovalDialogOpen(true)}
          className={isPending ? 'border-orange-300 text-orange-700' : ''}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          {isPending ? 'Odottaa hyväksyntää' : 'Näytä hyväksyntä'}
        </Button>

        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Kriittisen diagnoosin hyväksyntä</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Status Alert */}
              <Alert className={`border-2 ${getCriticalityColor(diagnosis.severity)}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getCriticalityLabel(diagnosis.severity)}
                </AlertDescription>
              </Alert>

              {/* Diagnosis Details */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Diagnoosin koodi</p>
                    <p className="text-lg font-semibold">{diagnosis.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Diagnoosin nimi</p>
                    <p className="text-lg font-semibold">{diagnosis.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Potilaan nimi</p>
                    <p className="text-lg font-semibold">{diagnosis.patientName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Diagnosoinut</p>
                      <p className="font-medium">{diagnosis.diagnosedByName || 'Tuntematon'}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(diagnosis.diagnosedAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      {isAlreadyApproved && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Hyväksytty
                        </Badge>
                      )}
                      {isAlreadyRejected && (
                        <Badge variant="destructive">
                          <X className="w-3 h-3 mr-1" />
                          Hylätty
                        </Badge>
                      )}
                      {isPending && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Odottaa
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isAlreadyApproved && diagnosis.approvedBy && (
                    <div className="pt-2 border-t bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Hyväksynyt</p>
                      <p className="font-medium">{diagnosis.approvedBy}</p>
                      {diagnosis.approvedAt && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(diagnosis.approvedAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                        </p>
                      )}
                      {diagnosis.notes && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-700">{diagnosis.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval/Rejection Section */}
              {isPending && (
                <div className="space-y-3 p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="font-semibold text-orange-900">Hyväksynnän toimenpiteet vaaditaan:</p>

                  {approvalAction === 'approve' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hyväksynnän muistiinpanot (valinnainen)</label>
                      <Textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Esim. Diagnoosi vahvistettu erikoislääkärin konsultaatiolla"
                        className="text-sm"
                      />
                    </div>
                  )}

                  {approvalAction === 'reject' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hylkäämisen syy</label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Kerro miksi diagnoosia ei hyväksytä"
                        className="text-sm"
                      />
                    </div>
                  )}

                  {!approvalAction && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => setApprovalAction('approve')}
                        disabled={!canApprove}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Hyväksy
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => setApprovalAction('reject')}
                        disabled={!canApprove}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hylkää
                      </Button>
                    </div>
                  )}

                  {approvalAction && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setApprovalAction(null)}
                      >
                        Peruuta
                      </Button>
                      <Button
                        className={`flex-1 ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        onClick={approvalAction === 'approve' ? handleApprove : handleReject}
                      >
                        {approvalAction === 'approve' ? 'Vahvista hyväksyntä' : 'Vahvista hylkääminen'}
                      </Button>
                    </div>
                  )}

                  {!canApprove && (
                    <p className="text-sm text-orange-700">
                      Vain johtava ylilääkäri voi hyväksyä kriittiset diagnoosat
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Sulje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Card view for non-dialog mode
  return (
    <Card className={`border-2 ${getCriticalityColor(diagnosis.severity)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-lg">{diagnosis.name}</p>
            <p className="text-sm text-gray-600">{diagnosis.code}</p>
            <p className="text-sm text-gray-500 mt-1">{diagnosis.patientName}</p>
          </div>
          <Badge className={getCriticalityColor(diagnosis.severity)}>
            {getCriticalityLabel(diagnosis.severity).split(' - ')[0]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
