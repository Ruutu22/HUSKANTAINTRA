import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Star, 
  Check, 
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Bug,
  Search,
  Eye,
  Reply
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
  assignedTo?: string;
}

const FEEDBACK_TYPES = [
  { value: 'general', label: 'Yleinen', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { value: 'compliment', label: 'Kehu', icon: ThumbsUp, color: 'bg-green-100 text-green-700' },
  { value: 'complaint', label: 'Valitus', icon: ThumbsDown, color: 'bg-red-100 text-red-700' },
  { value: 'suggestion', label: 'Ehdotus', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'technical', label: 'Tekninen', icon: Bug, color: 'bg-purple-100 text-purple-700' },
];

export function PalautteetPage() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load feedback from localStorage
  useEffect(() => {
    const loadFeedback = () => {
      const stored = localStorage.getItem('hus_patient_feedback');
      if (stored) {
        setFeedbackList(JSON.parse(stored));
      }
    };
    loadFeedback();
    // Refresh every 5 seconds
    const interval = setInterval(loadFeedback, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter feedback
  const filteredFeedback = feedbackList.filter(f => {
    // Search filter
    const matchesSearch = 
      f.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    const matchesTab = activeTab === 'all' || f.type === activeTab;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: feedbackList.length,
      new: feedbackList.filter(f => f.status === 'new').length,
      unread: feedbackList.filter(f => f.status === 'new').length,
      in_progress: feedbackList.filter(f => f.status === 'in_progress').length,
      resolved: feedbackList.filter(f => f.status === 'resolved').length,
    };
  };

  const counts = getStatusCounts();

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
    
    // Mark as read if new
    if (feedback.status === 'new') {
      updateFeedbackStatus(feedback.id, 'read');
    }
  };

  const updateFeedbackStatus = (feedbackId: string, newStatus: Feedback['status']) => {
    const updated = feedbackList.map(f => 
      f.id === feedbackId ? { ...f, status: newStatus } : f
    );
    setFeedbackList(updated);
    localStorage.setItem('hus_patient_feedback', JSON.stringify(updated));
  };

  const handleReply = () => {
    if (!selectedFeedback || !replyMessage.trim()) return;

    const updated = feedbackList.map(f => 
      f.id === selectedFeedback.id 
        ? { 
            ...f, 
            response: replyMessage.trim(),
            respondedAt: new Date(),
            respondedBy: user?.id,
            respondedByName: user?.name,
            status: 'resolved' as const
          } 
        : f
    );
    
    setFeedbackList(updated);
    localStorage.setItem('hus_patient_feedback', JSON.stringify(updated));
    
    toast.success('Vastaus lähetetty');
    setIsReplyDialogOpen(false);
    setReplyMessage('');
    setSelectedFeedback(null);
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
            Potilaspalautteet
          </h1>
          <p className="text-gray-500 mt-1">
            Hallitse ja vastaa potilaiden palautteisiin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
            {counts.new} uutta
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{counts.all}</p>
            <p className="text-xs text-gray-500">Kaikki</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{counts.new}</p>
            <p className="text-xs text-gray-500">Uudet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-purple-600">{counts.in_progress}</p>
            <p className="text-xs text-gray-500">Käsittelyssä</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{counts.resolved}</p>
            <p className="text-xs text-gray-500">Ratkaistut</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {feedbackList.filter(f => f.rating).reduce((acc, f) => acc + (f.rating || 0), 0) / 
               feedbackList.filter(f => f.rating).length || 0}
            </p>
            <p className="text-xs text-gray-500">Keskiarvo</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Hae palautteista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Kaikki tilat</option>
          <option value="new">Uudet</option>
          <option value="read">Luetut</option>
          <option value="in_progress">Käsittelyssä</option>
          <option value="resolved">Ratkaistut</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Kaikki</TabsTrigger>
          {FEEDBACK_TYPES.map(type => (
            <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-1">
              <type.icon className="w-3 h-3" />
              <span className="hidden md:inline">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredFeedback.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Ei palautteita</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((feedback) => (
                <Card 
                  key={feedback.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    feedback.status === 'new' ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleViewFeedback(feedback)}
                >
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
                          {feedback.status === 'new' && (
                            <Badge className="bg-red-100 text-red-700 animate-pulse">
                              UUSI
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {format(new Date(feedback.createdAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{feedback.message}</p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            <strong>Lähettäjä:</strong> {feedback.patientName}
                          </span>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < feedback.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {feedback.response && (
                          <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Vastattu
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge className={getTypeColor(selectedFeedback.type)}>
                    {getTypeLabel(selectedFeedback.type)}
                  </Badge>
                  {selectedFeedback.subject}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    <strong>Lähettäjä:</strong> {selectedFeedback.patientName}
                  </span>
                  <span>
                    {format(new Date(selectedFeedback.createdAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                  </span>
                </div>
                
                {selectedFeedback.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < selectedFeedback.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                {/* Response Section */}
                {selectedFeedback.response ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800 mb-2">Vastaus:</p>
                    <p className="text-green-700 whitespace-pre-wrap">{selectedFeedback.response}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Vastannut: {selectedFeedback.respondedByName} • {' '}
                      {selectedFeedback.respondedAt && format(new Date(selectedFeedback.respondedAt), 'dd.MM.yyyy HH:mm', { locale: fi })}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsReplyDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Vastaa
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        updateFeedbackStatus(selectedFeedback.id, 'in_progress');
                        toast.success('Merkitty käsittelyyn');
                      }}
                    >
                      Merkitse käsittelyyn
                    </Button>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedFeedback.status !== 'resolved' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        updateFeedbackStatus(selectedFeedback.id, 'resolved');
                        toast.success('Merkitty ratkaistuksi');
                      }}
                      className="text-green-600"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Ratkaistu
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'closed');
                      toast.success('Palaute suljettu');
                    }}
                  >
                    Sulje
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Vastaa palautteeseen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-sm">{selectedFeedback?.subject}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{selectedFeedback?.message}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Vastauksesi</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Kirjoita vastaus..."
                className="w-full p-3 border rounded-md min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleReply}
              disabled={!replyMessage.trim()}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Reply className="w-4 h-4 mr-2" />
              Lähetä vastaus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
