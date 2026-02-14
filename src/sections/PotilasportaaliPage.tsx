import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { PatientFeedback, FeedbackType, FeedbackStatus } from '@/types';
import {
  Hospital,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Filter,
  Search,
  User,
  Calendar,
  Eye,
  Reply,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface FeedbackStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  averageRating: number;
}

export function PotilasportaaliPage() {
  const { user, isJYL } = useAuth();
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<PatientFeedback | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feedbacks');
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    averageRating: 0
  });

  // Load feedbacks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hus_patient_feedback');
    if (stored) {
      const parsed = JSON.parse(stored);
      setFeedbacks(parsed.map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
        respondedAt: f.respondedAt ? new Date(f.respondedAt) : undefined
      })));
    } else {
      // Create sample feedbacks
      const sampleFeedbacks: PatientFeedback[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Matti Meikäläinen',
          type: 'compliment',
          subject: 'Erinomainen palvelu',
          message: 'Kiitos erittäin ystävällisestä ja ammattimaisesta hoidosta! Hoitajat ja lääkärit olivat todella huomaavaisia.',
          rating: 5,
          status: 'resolved',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isAnonymous: false,
          response: 'Kiitos palautteestasi! Olemme iloisia, että koit hoitomme hyväksi.',
          respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          respondedBy: 'user1',
          respondedByName: 'Dr. Koskela'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Liisa Virtanen',
          type: 'suggestion',
          subject: 'Odotusajan lyhentäminen',
          message: 'Voisiko poliklinikan odotusaikoja lyhentää? Jonotus kesti tänään yli tunnin.',
          rating: 3,
          status: 'in_progress',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isAnonymous: false,
          assignedTo: 'user1',
          assignedToName: 'Dr. Koskela'
        },
        {
          id: '3',
          patientId: 'p3',
          patientName: 'Anonyymi',
          type: 'complaint',
          subject: 'Puhelimeen ei vastata',
          message: 'Olen yrittänyt soittaa ajanvaraukseen useita kertoja, mutta kukaan ei vastaa.',
          status: 'new',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isAnonymous: true
        },
        {
          id: '4',
          patientId: 'p4',
          patientName: 'Pekka Korhonen',
          type: 'technical',
          subject: 'Sähköinen resepti ei näy',
          message: 'En löydä sähköistä reseptiä Kanta-palvelusta. Voitteko tarkistaa?',
          status: 'new',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          isAnonymous: false
        },
        {
          id: '5',
          patientId: 'p5',
          patientName: 'Anna Saarinen',
          type: 'general',
          subject: 'Kiitos hoidosta',
          message: 'Leikkaus sujui hyvin ja toipuminen on alkanut erinomaisesti. Kiitos koko tiimille!',
          rating: 5,
          status: 'resolved',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
          isAnonymous: false,
          response: 'Kiitos palautteestasi! Toivomme sinulle nopeaa paranemista.',
          respondedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
          respondedBy: 'user1',
          respondedByName: 'Dr. Koskela'
        }
      ];
      setFeedbacks(sampleFeedbacks);
      localStorage.setItem('hus_patient_feedback', JSON.stringify(sampleFeedbacks));
    }
  }, []);

  // Calculate stats
  useEffect(() => {
    const total = feedbacks.length;
    const new_count = feedbacks.filter(f => f.status === 'new').length;
    const inProgress = feedbacks.filter(f => f.status === 'in_progress').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const rated = feedbacks.filter(f => f.rating !== undefined);
    const averageRating = rated.length > 0 
      ? rated.reduce((sum, f) => sum + (f.rating || 0), 0) / rated.length 
      : 0;

    setStats({
      total,
      new: new_count,
      inProgress,
      resolved,
      averageRating: Math.round(averageRating * 10) / 10
    });
  }, [feedbacks]);

  // Save feedbacks
  const saveFeedbacks = (newFeedbacks: PatientFeedback[]) => {
    setFeedbacks(newFeedbacks);
    localStorage.setItem('hus_patient_feedback', JSON.stringify(newFeedbacks));
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesType = filterType === 'all' || feedback.type === filterType;
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesSearch = 
      feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Update feedback status
  const updateStatus = (feedbackId: string, newStatus: FeedbackStatus) => {
    const updated = feedbacks.map(f => 
      f.id === feedbackId 
        ? { ...f, status: newStatus, updatedAt: new Date() }
        : f
    );
    saveFeedbacks(updated);
    toast.success(`Palautteen tila vaihdettu: ${getStatusLabel(newStatus)}`);
  };

  // Respond to feedback
  const respondToFeedback = () => {
    if (!selectedFeedback || !responseText.trim()) return;

    const updated = feedbacks.map(f => 
      f.id === selectedFeedback.id 
        ? { 
            ...f, 
            response: responseText,
            respondedAt: new Date(),
            respondedBy: user?.id,
            respondedByName: user?.name,
            status: 'resolved' as FeedbackStatus,
            updatedAt: new Date()
          }
        : f
    );
    saveFeedbacks(updated);
    setIsResponseDialogOpen(false);
    setResponseText('');
    setSelectedFeedback(null);
    toast.success('Vastaus lähetetty!');
  };

  // Delete feedback
  const deleteFeedback = (feedbackId: string) => {
    if (!confirm('Haluatko varmasti poistaa tämän palautteen?')) return;
    const updated = feedbacks.filter(f => f.id !== feedbackId);
    saveFeedbacks(updated);
    toast.success('Palaute poistettu');
  };

  // Get type label
  const getTypeLabel = (type: FeedbackType) => {
    const labels: Record<FeedbackType, string> = {
      general: 'Yleinen',
      complaint: 'Valitus',
      compliment: 'Kiitos',
      suggestion: 'Ehdotus',
      technical: 'Tekninen'
    };
    return labels[type];
  };

  // Get status label
  const getStatusLabel = (status: FeedbackStatus) => {
    const labels: Record<FeedbackStatus, string> = {
      new: 'Uusi',
      read: 'Luettu',
      in_progress: 'Käsittelyssä',
      resolved: 'Ratkaistu',
      closed: 'Suljettu'
    };
    return labels[status];
  };

  // Get type color
  const getTypeColor = (type: FeedbackType) => {
    const colors: Record<FeedbackType, string> = {
      general: 'bg-blue-100 text-blue-700',
      complaint: 'bg-red-100 text-red-700',
      compliment: 'bg-green-100 text-green-700',
      suggestion: 'bg-yellow-100 text-yellow-700',
      technical: 'bg-purple-100 text-purple-700'
    };
    return colors[type];
  };

  // Get status color
  const getStatusColor = (status: FeedbackStatus) => {
    const colors: Record<FeedbackStatus, string> = {
      new: 'bg-red-100 text-red-700 border-red-200',
      read: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Hospital className="w-7 h-7 text-[#0066b3]" />
            Potilasportaali
          </h1>
          <p className="text-gray-500 mt-1">
            Hallitse potilaspalautteita ja -viestejä
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info('Päivitetty')}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Päivitä
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kaikki palautteet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#0066b3]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uudet</p>
                <p className="text-2xl font-bold text-red-600">{stats.new}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Käsittelyssä</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ratkaistut</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Keskiarvo</p>
                <p className="text-2xl font-bold text-[#0066b3]">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedbacks" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Palautteet ({feedbacks.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytiikka
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Asetukset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedbacks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Hae palautteista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as FeedbackType | 'all')}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tyyppi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kaikki tyypit</SelectItem>
                    <SelectItem value="general">Yleinen</SelectItem>
                    <SelectItem value="complaint">Valitus</SelectItem>
                    <SelectItem value="compliment">Kiitos</SelectItem>
                    <SelectItem value="suggestion">Ehdotus</SelectItem>
                    <SelectItem value="technical">Tekninen</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FeedbackStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tila" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kaikki tilat</SelectItem>
                    <SelectItem value="new">Uusi</SelectItem>
                    <SelectItem value="read">Luettu</SelectItem>
                    <SelectItem value="in_progress">Käsittelyssä</SelectItem>
                    <SelectItem value="resolved">Ratkaistu</SelectItem>
                    <SelectItem value="closed">Suljettu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-3">
            {filteredFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Ei palautteita valituilla suodattimilla</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <Card 
                  key={feedback.id} 
                  className={`hover:shadow-md transition-shadow ${feedback.status === 'new' ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066b3] to-[#00a8b3] flex items-center justify-center text-white font-semibold">
                        {feedback.isAnonymous ? '?' : feedback.patientName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                              <Badge className={getTypeColor(feedback.type)}>
                                {getTypeLabel(feedback.type)}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(feedback.status)}>
                                {getStatusLabel(feedback.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {feedback.isAnonymous ? 'Anonyymi' : feedback.patientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {feedback.createdAt.toLocaleDateString('fi-FI')}
                              </span>
                              {feedback.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  {feedback.rating}/5
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {feedback.status === 'new' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus(feedback.id, 'read')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setIsResponseDialogOpen(true);
                              }}
                            >
                              <Reply className="w-4 h-4" />
                            </Button>
                            {isJYL && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteFeedback(feedback.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 text-gray-700">{feedback.message}</p>

                        {feedback.response && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              <span className="font-semibold">Vastaus ({feedback.respondedByName}):</span>
                              <br />
                              {feedback.response}
                            </p>
                          </div>
                        )}

                        {feedback.assignedToName && feedback.status !== 'resolved' && (
                          <p className="mt-2 text-sm text-gray-500">
                            Osoitettu: {feedback.assignedToName}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Palauteanalytiikka
              </CardTitle>
              <CardDescription>
                Yleiskatsaus potilaspalautteista
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Distribution */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Palautteiden jakauma tyypin mukaan</h4>
                <div className="grid grid-cols-5 gap-3">
                  {(['general', 'complaint', 'compliment', 'suggestion', 'technical'] as FeedbackType[]).map(type => {
                    const count = feedbacks.filter(f => f.type === type).length;
                    const percentage = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                    return (
                      <div key={type} className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-[#0066b3]">{count}</p>
                        <p className="text-xs text-gray-500">{getTypeLabel(type)}</p>
                        <p className="text-xs text-gray-400">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Rating Distribution */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Arvostelujen jakauma</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = feedbacks.filter(f => f.rating === rating).length;
                    const totalRated = feedbacks.filter(f => f.rating !== undefined).length;
                    const percentage = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm">{rating}</span>
                        </div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Response Time */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Vastausajat</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-500">Keskimääräinen vastausaika</p>
                    <p className="text-2xl font-bold text-green-600">1.5 pv</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500">Nopein vastaus</p>
                    <p className="text-2xl font-bold text-blue-600">2 tuntia</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-500">Vastausprosentti</p>
                    <p className="text-2xl font-bold text-yellow-600">85%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portaalin asetukset</CardTitle>
              <CardDescription>
                Hallitse potilasportaalin toimintoja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ota palautteet käyttöön</p>
                  <p className="text-sm text-gray-500">Salli potilaiden lähettää palautetta</p>
                </div>
                <Button variant="outline">Käytössä</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Anonyymit palautteet</p>
                  <p className="text-sm text-gray-500">Salli anonyymit palautteet</p>
                </div>
                <Button variant="outline">Käytössä</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Arvostelut</p>
                  <p className="text-sm text-gray-500">Salli tähtiarvostelut</p>
                </div>
                <Button variant="outline">Käytössä</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Automaattivastaukset</p>
                  <p className="text-sm text-gray-500">Lähetä automaattivahvistus</p>
                </div>
                <Button variant="outline">Pois</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Vastaa palautteeseen</DialogTitle>
            <DialogDescription>
              {selectedFeedback?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{selectedFeedback?.message}</p>
            </div>
            <Textarea
              placeholder="Kirjoita vastaus..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={respondToFeedback}
              disabled={!responseText.trim()}
              className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
            >
              <Send className="w-4 h-4 mr-2" />
              Lähetä vastaus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
