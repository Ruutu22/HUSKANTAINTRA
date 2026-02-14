import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { featureSuggestions, getSuggestionsByCategory, type FeatureSuggestion } from '@/data/featureSuggestions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Shield, 
  Zap, 
  Plug, 
  BarChart3, 
  MessageSquare, 
  HeartPulse, 
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

const categoryIcons: Record<FeatureSuggestion['category'], React.ElementType> = {
  SECURITY: Shield,
  USABILITY: Zap,
  INTEGRATION: Plug,
  ANALYTICS: BarChart3,
  COMMUNICATION: MessageSquare,
  PATIENT_CARE: HeartPulse,
  ADMINISTRATION: Briefcase,
};

const categoryLabels: Record<FeatureSuggestion['category'], string> = {
  SECURITY: 'Tietoturva',
  USABILITY: 'Käytettävyys',
  INTEGRATION: 'Integraatiot',
  ANALYTICS: 'Analytiikka',
  COMMUNICATION: 'Viestintä',
  PATIENT_CARE: 'Potilashoito',
  ADMINISTRATION: 'Hallinto',
};

const priorityColors: Record<FeatureSuggestion['priority'], string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const effortLabels: Record<FeatureSuggestion['estimatedEffort'], string> = {
  SMALL: 'Pieni',
  MEDIUM: 'Keskisuuri',
  LARGE: 'Suuri',
};

export function FeatureSuggestionsPage() {
  const { isJYL } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const filteredSuggestions = activeTab === 'all' 
    ? featureSuggestions 
    : activeTab === 'high' 
      ? featureSuggestions.filter(s => s.priority === 'HIGH')
      : getSuggestionsByCategory(activeTab as FeatureSuggestion['category']);

  const highPriorityCount = featureSuggestions.filter(s => s.priority === 'HIGH').length;
  const mediumPriorityCount = featureSuggestions.filter(s => s.priority === 'MEDIUM').length;
  const lowPriorityCount = featureSuggestions.filter(s => s.priority === 'LOW').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            Ominaisuusehdotukset
          </h1>
          <p className="text-gray-500 mt-1">
            40+ ehdotusta järjestelmän kehittämiseen
          </p>
        </div>
        {isJYL && (
          <Button className="bg-[#0066b3] hover:bg-[#005291]">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Merkitse toteutetuiksi
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featureSuggestions.length}</p>
                <p className="text-xs text-gray-500">Ehdotusta yhteensä</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-xs text-gray-500">Korkea prioriteetti</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mediumPriorityCount}</p>
                <p className="text-xs text-gray-500">Keskiprioriteetti</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowPriorityCount}</p>
                <p className="text-xs text-gray-500">Matala prioriteetti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Kaikki</TabsTrigger>
          <TabsTrigger value="high">Korkea prioriteetti</TabsTrigger>
          <TabsTrigger value="SECURITY">Tietoturva</TabsTrigger>
          <TabsTrigger value="INTEGRATION">Integraatiot</TabsTrigger>
          <TabsTrigger value="PATIENT_CARE">Potilashoito</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredSuggestions.map((suggestion) => {
              const Icon = categoryIcons[suggestion.category];
              return (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                              <Badge className={priorityColors[suggestion.priority]}>
                                {suggestion.priority === 'HIGH' ? 'Korkea' : 
                                 suggestion.priority === 'MEDIUM' ? 'Keski' : 'Matala'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm">{suggestion.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline">{categoryLabels[suggestion.category]}</Badge>
                            <span className="text-xs text-gray-400">
                              Työmäärä: {effortLabels[suggestion.estimatedEffort]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <div className="grid gap-4">
            {filteredSuggestions.map((suggestion) => {
              const Icon = categoryIcons[suggestion.category];
              return (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow border-red-200">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Korkea
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm">{suggestion.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline">{categoryLabels[suggestion.category]}</Badge>
                            <span className="text-xs text-gray-400">
                              Työmäärä: {effortLabels[suggestion.estimatedEffort]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {['SECURITY', 'INTEGRATION', 'PATIENT_CARE', 'USABILITY', 'ANALYTICS', 'COMMUNICATION', 'ADMINISTRATION'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {getSuggestionsByCategory(category as FeatureSuggestion['category']).map((suggestion) => {
                const Icon = categoryIcons[suggestion.category];
                return (
                  <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                                <Badge className={priorityColors[suggestion.priority]}>
                                  {suggestion.priority === 'HIGH' ? 'Korkea' : 
                                   suggestion.priority === 'MEDIUM' ? 'Keski' : 'Matala'}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">{suggestion.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-gray-400">
                                Työmäärä: {effortLabels[suggestion.estimatedEffort]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary Section */}
      <Card className="bg-gradient-to-r from-[#0066b3]/5 to-[#00a8b3]/5">
        <CardHeader>
          <CardTitle>Yhteenveto</CardTitle>
          <CardDescription>
            Nämä ehdotukset on koottu järjestelmän kehittämistä varten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = featureSuggestions.filter(s => s.category === key).length;
              const Icon = categoryIcons[key as FeatureSuggestion['category']];
              return (
                <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Icon className="w-5 h-5 text-[#0066b3]" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{count} ehdotusta</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Suositukset toteutusjärjestykseksi:</h4>
            <ol className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Toteuta ensin korkean prioriteetin tietoturvaominaisuudet (2FA, istunnon aikakatkaisu)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Integroi Kanta.fi ja muut kriittiset järjestelmät
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Kehitä potilashoidon työkalut (hoitopolku, muistutukset)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                Paranna käytettävyyttä ja lisää analytiikka
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
                Toteuta viestintä- ja hallinto-ominaisuudet
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
