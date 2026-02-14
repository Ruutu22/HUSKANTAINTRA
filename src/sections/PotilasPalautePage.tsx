import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatients, useAuditLogs } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Star, 
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Bug
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  patientId: string;
  patientName: string;
  type: 'general' | 'complaint' | 'compliment' | 'suggestion' | 'technical';
  subject: string;
  message: string;
  rating?: number;
  status: 'new' | 'read' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  respondedByName?: string;
  isAnonymous: boolean;
}

const FEEDBACK_TYPES = [
  { value: 'general', label: 'Yleinen palaute', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { value: 'compliment', label: 'Kiitos / Kehu', icon: ThumbsUp, color: 'bg-green-100 text-green-700' },
  { value: 'complaint', label: 'Valitus / Huoli', icon: ThumbsDown, color: 'bg-red-100 text-red-700' },
  { value: 'suggestion', label: 'Ehdotus', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'technical', label: 'Tekninen ongelma', icon: Bug, color: 'bg-purple-100 text-purple-700' },
];

export function PotilasPalautePage() {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { addLog } = useAuditLogs();

  const [isNewFeedbackOpen, setIsNewFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Get patient's feedback from localStorage
  const getPatientFeedback = (): Feedback[] => {
    const stored = localStorage.getItem('hus_patient_feedback');
    if (stored) {
      return JSON.parse(stored).filter((f: Feedback) => f.patientId === user?.patientId);
    }
    return [];
  };

  const [feedbackList, setFeedbackList] = useState<Feedback[]>(getPatientFeedback());

  const patient = patients.find(p => p.id === user?.patientId);

  const handleSubmitFeedback = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Täytä otsikko ja viesti');
      return;
    }

    const newFeedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: user?.patientId || '',
      patientName: isAnonymous ? 'Anonyymi' : `${patient?.firstName} ${patient?.lastName}`,
      type: feedbackType as any,
      subject: subject.trim(),
      message: message.trim(),
      rating: rating > 0 ? rating : undefined,
      status: 'new',
      createdAt: new Date(),
      isAnonymous,
    };

    // Save to localStorage (shared with staff view)
    const existing = JSON.parse(localStorage.getItem('hus_patient_feedback') || '[]');
    localStorage.setItem('hus_patient_feedback', JSON.stringify([newFeedback, ...existing]));

    // Add audit log
    addLog({
      userId: user?.id || '',
      userName: user?.name || 'Potilas',
      userRole: 'POTILAS',
      action: 'create_form',
      targetName: 'Palaute',
      details: `Potilas lähetti ${feedbackType}-tyyppisen palautteen`,
    });

    // Update local state
    setFeedbackList([newFeedback, ...feedbackList]);

    toast.success('Palaute lähetetty kiitos!');
    setIsNewFeedbackOpen(false);
    setSubject('');
    setMessage('');
    setRating(0);
    setIsAnonymous(false);
    setFeedbackType('general');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'read': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Uusi';
      case 'read': return 'Luettu';
      case 'in_progress': return 'Käsittelyssä';
      case 'resolved': return 'Ratkaistu';
      case 'closed': return 'Suljettu';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = FEEDBACK_TYPES.find(t => t.value === type);
    const Icon = typeInfo?.icon || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return FEEDBACK_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type: string) => {
    return FEEDBACK_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-[#0066b3]" />
            Anna palautetta
          </h1>
          <p className="text-gray-500 mt-1">
            Kerro meille kokemuksistasi
          </p>
        </div>
        <Button 
          onClick={() => setIsNewFeedbackOpen(true)}
          className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
        >
          <Send className="w-4 h-4 mr-2" />
          Kirjoita palaute
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Palautteesi on meille tärkeä</p>
              <p className="text-sm text-blue-700 mt-1">
                Kaikki palautteet käsitellään luottamuksellisesti. Voit halutessasi lähettää palautteen anonyymisti.
                Henkilökunta näkee palautteesi ja voi vastata siihen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Feedback */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Aiemmat palautteet</h2>
        {feedbackList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Ei palautteita vielä</p>
              <p className="text-sm text-gray-400 text-center mt-1">
                Kirjoita ensimmäinen palautteesi painamalla yllä olevaa nappia
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={getTypeColor(feedback.type)}>
                          {getTypeIcon(feedback.type)}
                          <span className="ml-1">{getTypeLabel(feedback.type)}</span>
                        </Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          {getStatusText(feedback.status)}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {format(new Date(feedback.createdAt), 'dd.MM.yyyy', { locale: fi })}
                        </span>
                        {feedback.isAnonymous && (
                          <Badge variant="outline" className="text-gray-500">
                            Anonyymi
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{feedback.message}</p>
                      
                      {feedback.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < feedback.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Response from staff */}
                      {feedback.response && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800">Vastaus henkilökunnalta:</p>
                          <p className="text-sm text-green-700 mt-1">{feedback.response}</p>
                          <p className="text-xs text-green-600 mt-1">
                            {feedback.respondedAt && format(new Date(feedback.respondedAt), 'dd.MM.yyyy', { locale: fi })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Feedback Dialog */}
      <Dialog open={isNewFeedbackOpen} onOpenChange={setIsNewFeedbackOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kirjoita palaute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Feedback Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Palautteen tyyppi *</label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFeedbackType(type.value)}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2 ${
                        feedbackType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium mb-2 block">Otsikko *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Kirjoita otsikko..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-2 block">Viesti *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kirjoita palautteesi..."
                className="w-full p-3 border rounded-md min-h-[120px]"
              />
            </div>

            {/* Rating (optional) */}
            <div>
              <label className="text-sm font-medium mb-2 block">Arvio (valinnainen)</label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="p-1"
                  >
                    <Star 
                      className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="anonymous" className="text-sm cursor-pointer">
                Lähetä anonyymisti (nimesi ei näy vastaanottajalle)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFeedbackOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={!subject.trim() || !message.trim()}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Send className="w-4 h-4 mr-2" />
              Lähetä palaute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
