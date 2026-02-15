import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { Sidebar } from '@/sections/Sidebar';
import { PatientSidebar } from '@/sections/PatientSidebar';
import { TallennetutPage } from '@/sections/TallennetutPage';
import { UusiPage } from '@/sections/UusiPage';
import { ArkistoidutPage } from '@/sections/ArkistoidutPage';
import { PohjatPage } from '@/sections/PohjatPage';
import { MuokkaaPage } from '@/sections/MuokkaaPage';
import { ReseptitPage } from '@/sections/ReseptitPage';
import { KayttajatPage } from '@/sections/KayttajatPage';
import { StaffAccountsPage } from '@/sections/StaffAccountsPage';
import { MedicationPage } from '@/sections/MedicationPage';
import { DiagnosisSystemPage } from '@/sections/DiagnosisSystemPage';
import { OhjeistuksetPage } from '@/sections/OhjeistuksetPage';
import { RaportitPage } from '@/sections/RaportitPage';
import { VuorotPage } from '@/sections/VuorotPage';
import { PotilaatPage } from '@/sections/PotilaatPage';
import { DiagnoositPage } from '@/sections/DiagnoositPage';
import { LabraPage } from '@/sections/LabraPage';
import { KuvantaminenPage } from '@/sections/KuvantaminenPage';
import { LahetteetPage } from '@/sections/LahetteetPage';
import { AjanvarausPage } from '@/sections/AjanvarausPage';
import { RyhmatPage } from '@/sections/RyhmatPage';
import { PotilasportaaliPage } from '@/sections/PotilasportaaliPage';
import { PotilasKantaPage } from '@/sections/PotilasKantaPage';
import { PotilasAjanvarausPage } from '@/sections/PotilasAjanvarausPage';
import { PotilasPalautePage } from '@/sections/PotilasPalautePage';
import { ChatPage } from '@/sections/ChatPage';
import { MuistiotPage } from '@/sections/MuistiotPage';
import { AsetuksetPage } from '@/sections/AsetuksetPage';
import { LokitPage } from '@/sections/LokitPage';
import { SidebarCustomizerPage } from '@/sections/SidebarCustomizerPage';
import { FeatureSuggestionsPage } from '@/sections/FeatureSuggestionsPage';
import { PalautteetPage } from '@/sections/PalautteetPage';
import { ViestitPage } from '@/sections/ViestitPage';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { user, isPatient } = useAuth();
  const [activeTab, setActiveTab] = useState('tallennetut');
  const [patientTab, setPatientTab] = useState('overview');

  if (!user) {
    return <LoginPage />;
  }

  // Patient users only see patient portal
  if (isPatient) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PatientSidebar activeTab={patientTab} onTabChange={setPatientTab} />
        <main className="flex-1 ml-72 p-6">
          <div className="max-w-6xl mx-auto">
            {patientTab === 'overview' && <PotilasKantaPage />}
            {patientTab === 'appointments' && <PotilasAjanvarausPage />}
            {patientTab === 'feedback' && <PotilasPalautePage />}
            {patientTab === 'messages' && <ViestitPage />}
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tallennetut':
        return <TallennetutPage onEditForm={(formId) => {
          console.log('Edit form:', formId);
        }} />;
      case 'uusi':
        return <UusiPage onFormCreated={() => setActiveTab('tallennetut')} />;
      case 'arkistoidut':
        return <ArkistoidutPage />;
      case 'pohjat':
        return <PohjatPage />;
      case 'muokkaa':
        return <MuokkaaPage />;
      case 'reseptit':
        return <ReseptitPage />;
      case 'kayttajat':
        return <KayttajatPage />;
      case 'henkilokunnan-tunnukset':
        return <StaffAccountsPage />;
      case 'laakkeet':
        return <MedicationPage />;
      case 'diagnoosi-luokitus':
        return <DiagnosisSystemPage />;
      case 'ohjeistukset':
        return <OhjeistuksetPage />;
      case 'raportit':
        return <RaportitPage />;
      case 'vuorot':
        return <VuorotPage />;
      case 'potilaat':
        return <PotilaatPage />;
      case 'diagnoosit':
        return <DiagnoositPage />;
      case 'labra':
        return <LabraPage />;
      case 'kuvantaminen':
        return <KuvantaminenPage />;
      case 'lahetteet':
        return <LahetteetPage />;
      case 'ajanvaraus':
        return <AjanvarausPage />;
      case 'ryhmat':
        return <RyhmatPage />;
      case 'potilasportaali':
        return <PotilasportaaliPage />;
      case 'chat':
        return <ChatPage />;
      case 'muistiot':
        return <MuistiotPage />;
      case 'asetukset':
        return <AsetuksetPage />;
      case 'lokit':
        return <LokitPage />;
      case 'palautteet':
        return <PalautteetPage />;
      case 'viestit':
        return <ViestitPage />;
      case 'sidebar-customizer':
        return <SidebarCustomizerPage />;
      case 'feature-suggestions':
        return <FeatureSuggestionsPage />;
      default:
        return <TallennetutPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 ml-72 p-6">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
