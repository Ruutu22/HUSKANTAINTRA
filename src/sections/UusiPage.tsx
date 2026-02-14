import { useState, useEffect } from 'react';
import { useTemplates, useSavedForms, usePatients, useSettings, useAuditLogs } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Download,
  AlertCircle,
  Search,
  UserCircle,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Stamp
} from 'lucide-react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';

interface UusiPageProps {
  onFormCreated?: () => void;
}

// HUS Logo Component
const HUSLogo = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gradient-to-br from-[#0066b3] to-[#00a8b3] text-white flex flex-col items-center justify-center font-bold rounded-lg shadow-lg ${className}`}>
    <span className="text-2xl tracking-tight">HUS</span>
    <span className="text-[8px] font-normal leading-tight text-center px-1">Helsingin<br/>yliopisto</span>
  </div>
);

// Approval Stamp Component - Only visible in PDF
const ApprovalStamp = ({ approved, approverName, date }: { approved: boolean; approverName: string; date: string }) => (
  <div className={`w-40 h-40 border-4 ${approved ? 'border-green-500' : 'border-red-500'} rounded-full flex items-center justify-center transform -rotate-12 opacity-90 shadow-lg`}>
    <div className={`text-center ${approved ? 'text-green-600' : 'text-red-600'} font-bold`}>
      <div className="text-lg">{approved ? 'HYVÄKSYTTY' : 'HYLÄTTY'}</div>
      <div className="text-xs mt-1">{approverName}</div>
      <div className="text-xs">{date}</div>
    </div>
  </div>
);

export function UusiPage({ onFormCreated }: UusiPageProps) {
  const { templates } = useTemplates();
  const { addForm } = useSavedForms();
  const { patients, searchPatients } = usePatients();
  const { settings } = useSettings();
  const { addLog } = useAuditLogs();
  const { user } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfReason, setPdfReason] = useState('');
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  
  // Approval system
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showApprovalInPdf, setShowApprovalInPdf] = useState(true);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const filteredPatients = patientSearchQuery ? searchPatients(patientSearchQuery) : patients;

  // Real-time preview update
  useEffect(() => {
    // Preview updates automatically when formData changes
  }, [formData, patientName, approvalStatus]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setPatientName('');
    setSelectedPatient(null);
    setApprovalStatus('pending');
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setPatientName(`${patient.firstName} ${patient.lastName}`);
    setFormData(prev => ({
      ...prev,
      birthdate: patient.birthDate ? format(new Date(patient.birthDate), 'dd.MM.yyyy') : '',
      occupation: patient.occupation || '',
      patient_phone: patient.phone || '',
      patient_email: patient.email || '',
      patient_address: patient.address || '',
      patient_allergies: patient.allergies?.join(', ') || '',
    }));
    setShowPatientDialog(false);
  };

  const handlePrintWithValidation = () => {
    if (settings.security.requirePasswordForPdf) {
      setShowPdfDialog(true);
    } else if (settings.security.requireReasonForPdf) {
      setShowPdfDialog(true);
    } else {
      setShowPreview(true);
    }
  };

  const handlePdfConfirm = () => {
    if (settings.security.requirePasswordForPdf && pdfPassword !== 'Muokkaalaakarit') {
      alert('Virheellinen salasana!');
      return;
    }
    if (settings.security.requireReasonForPdf && !pdfReason.trim()) {
      alert('Syötä syy PDF-tallennukseen!');
      return;
    }
    
    // Log PDF export
    if (user) {
      addLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'export_pdf',
        targetName: selectedTemplateData?.name,
        details: `PDF tallennettu. Syy: ${pdfReason || 'Ei syytä annettu'}`,
      });
    }
    
    setShowPdfDialog(false);
    setShowPreview(true);
    setPdfPassword('');
    setPdfReason('');
  };

  const handleSave = () => {
    if (selectedTemplateData && patientName.trim()) {
      addForm({
        templateId: selectedTemplateData.id,
        templateName: selectedTemplateData.name,
        patientName: patientName.trim(),
        data: { ...formData, approvalStatus },
        createdBy: user?.name || 'Tuntematon',
        isArchived: false,
      });
      
      if (user) {
        addLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'create_form',
          targetName: selectedTemplateData.name,
          details: `Lomake luotu potilaalle ${patientName}`,
        });
      }
      
      onFormCreated?.();
      handleBack();
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setFormData({});
    setPatientName('');
    setSelectedPatient(null);
    setApprovalStatus('pending');
  };

  const getCurrentDate = () => {
    return format(new Date(), 'dd.MM.yyyy', { locale: fi });
  };

  // Render Police Health Form
  const renderPoliceForm = (isPdfPreview = false) => (
    <div className="space-y-6">
      {/* Header with HUS Logo */}
      <div className="border-b-2 border-double border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <HUSLogo className="w-24 h-20" />
          <div className="text-center flex-1 px-4">
            <h1 className="text-xl font-bold tracking-wide">TYÖTERVEYSTARKASTUSLOMAKE</h1>
            <p className="text-[#0066b3] font-semibold text-sm mt-1">Helsinki-Uusimaan sairaanhoitopiiri</p>
            <p className="text-xs text-gray-600 mt-1"><b>POLIISIVIRANOMAISTEN ERITYISTARKASTUS</b></p>
          </div>
          <div className="text-right text-sm">
            <p>Päivämäärä:</p>
            <Input 
              value={formData.date || getCurrentDate()} 
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-32 text-right"
              disabled={isPdfPreview}
            />
          </div>
        </div>
      </div>

      {/* Section 1: Personal Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">1. Henkilötiedot</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Nimi:</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Potilaan nimi"
                className="flex-1"
                disabled={isPdfPreview}
              />
              {!isPdfPreview && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPatientDialog(true)}
                  title="Valitse potilasrekisteristä"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Valitse
                </Button>
              )}
            </div>
            {selectedPatient && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Valittu rekisteristä: {selectedPatient.firstName} {selectedPatient.lastName}
              </Badge>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold">Syntymäaika:</Label>
            <Input 
              value={formData.birthdate || ''} 
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
              className="mt-1"
              placeholder="pp.kk.vvvv"
              disabled={isPdfPreview}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Ammatti:</Label>
            <Input value="Poliisi" disabled className="mt-1 bg-gray-100" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Yksikkö:</Label>
            <Input 
              value={formData.unit || ''} 
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="mt-1"
              placeholder="Esim. Päivystys, Tutkinta"
              disabled={isPdfPreview}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Palvelusvuodet:</Label>
            <Input 
              value={formData.service || ''} 
              onChange={(e) => handleInputChange('service', e.target.value)}
              className="mt-1"
              disabled={isPdfPreview}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Medical History */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">2. Anamneesi (Sairaushistoria)</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Aikaisemmat sairaudet:</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {['Ei merkittäviä', 'Sydänsairaus', 'Diabetes', 'Astma', 'Neurologiset', 'Psyykkiset'].map((disease) => (
                <label key={disease} className="flex items-center gap-1 text-sm">
                  <input 
                    type="checkbox" 
                    checked={formData[`disease_${disease}`] || false}
                    onChange={(e) => handleInputChange(`disease_${disease}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  {disease}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Leikkaukset:</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                placeholder="Vuosi" 
                className="w-24"
                value={formData.surgery_year || ''}
                onChange={(e) => handleInputChange('surgery_year', e.target.value)}
                disabled={isPdfPreview}
              />
              <Input 
                placeholder="Toimenpide" 
                className="flex-1"
                value={formData.surgery_desc || ''}
                onChange={(e) => handleInputChange('surgery_desc', e.target.value)}
                disabled={isPdfPreview}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Current Health */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">3. Nykyterveydentila</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Allergiat:</Label>
            <div className="space-y-1 mt-2">
              {['Ei', 'Lääkkeet', 'Latex', 'Ruoka'].map((allergy) => (
                <label key={allergy} className="flex items-center gap-1 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData[`allergy_${allergy}`] || false}
                    onChange={(e) => handleInputChange(`allergy_${allergy}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  {allergy}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Käytössä olevat lääkkeet:</Label>
            <Input 
              placeholder="Lääke 1"
              className="mt-2"
              value={formData.medication1 || ''}
              onChange={(e) => handleInputChange('medication1', e.target.value)}
              disabled={isPdfPreview}
            />
            <Input 
              placeholder="Lääke 2"
              className="mt-1"
              value={formData.medication2 || ''}
              onChange={(e) => handleInputChange('medication2', e.target.value)}
              disabled={isPdfPreview}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Clinical Measurements */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">4. Kliiniset mittaukset</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Mittaus</th>
              <th className="p-2 text-left">Arvo</th>
              <th className="p-2 text-left">Viitearvo</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'bp', name: 'Verenpaine (RR)', unit: 'mmHg', ref: '120-140/80-90' },
              { id: 'pulse', name: 'Syke (BPM)', unit: '/min', ref: '60-100' },
              { id: 'bmi', name: 'Painoindeksi (BMI)', unit: 'kg/m²', ref: '18,5-25' },
              { id: 'temp', name: 'Lämpö', unit: '°C', ref: '36,0-37,5' },
            ].map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2">
                  <Input 
                    className="w-32"
                    value={formData[`measure_${item.id}`] || ''}
                    onChange={(e) => handleInputChange(`measure_${item.id}`, e.target.value)}
                    disabled={isPdfPreview}
                  />
                </td>
                <td className="p-2 text-gray-500">{item.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 5: Drug Tests */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">5. Huumetestit & Rokotukset</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Huumeseulonta (virtsa):</Label>
            <div className="space-y-1 mt-2">
              {['Amfetamiini', 'Kannabis', 'Opioidit', 'Kokaiini', 'Bentsodiatsepiinit'].map((drug) => (
                <label key={drug} className="flex items-center gap-1 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData[`drug_${drug}`] || false}
                    onChange={(e) => handleInputChange(`drug_${drug}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  {drug} (neg)
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Rokotukset:</Label>
            <div className="space-y-1 mt-2">
              {['Tetanus', 'Hepatiitti A/B', 'Influenssa', 'COVID-19', 'Kurkkumätä', 'MPR'].map((vax) => (
                <label key={vax} className="flex items-center gap-1 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData[`vax_${vax}`] || false}
                    onChange={(e) => handleInputChange(`vax_${vax}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  {vax}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Critical Risk Factors */}
      <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
        <h2 className="bg-red-600 text-white px-3 py-2 text-sm font-bold uppercase mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          6. Kriittiset riskitekijät
        </h2>
        <p className="text-xs text-red-600 mb-3">Mikäli jokin seuraavista on todettu, työkyky hylättävä välittömästi</p>
        <div className="space-y-2">
          {[
            'Huumausaineriippuvuus (päihdevalmisteiden väärinkäyttö)',
            'Näkökyky ei korjaudu 0,5 parempaan (ajolupa/ammunta)',
            'Epävakaa persoonallisuus (todistettu/psykologinen lausunto)',
            'Aktiivinen alkoholiriippuvuus (kieltäytyminen testistä / positiivinen)',
            'Vakava sydänsairaus ilman hoitoa (fyysisen rasituksen riski)',
            'Ei kykene kantamaan 20kg painoa 50m matkaa (kollegan evakuointi)'
          ].map((risk, idx) => (
            <label key={idx} className="flex items-center gap-2 text-sm text-red-700">
              <input 
                type="checkbox"
                checked={formData[`risk_${idx}`] || false}
                onChange={(e) => handleInputChange(`risk_${idx}`, e.target.checked)}
                className="rounded border-red-500"
                disabled={isPdfPreview}
              />
              <b>{risk}</b>
            </label>
          ))}
        </div>
      </div>

      {/* Section 7: Doctor's Statement */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">7. Lääkärin lausunto</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Kliininen arvio ja havainnot:</Label>
            <textarea 
              className="w-full mt-2 p-2 border rounded-md min-h-[80px]"
              value={formData.doctor_notes || ''}
              onChange={(e) => handleInputChange('doctor_notes', e.target.value)}
              placeholder="Kirjoita havainnot tähän..."
              disabled={isPdfPreview}
            />
          </div>
          <div className="bg-yellow-50 p-3 rounded border-2 border-gray-800">
            <Label className="text-sm font-semibold">TYÖKYKYLUOKITUS:</Label>
            <div className="space-y-2 mt-2">
              {[
                'Täysin työkykyinen - Ei rajoituksia (kaikki tehtävät)',
                'Rajoitetusti työkykyinen - Suositukset:',
                'Tilapäisesti työkyvytön - Ajalle:',
                'Pysyvästi työkyvytön - Ei sovellu viranomaistyöhön',
                'Seuranta jatkossa - Kontrolli:'
              ].map((status, idx) => (
                <label key={idx} className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData[`status_${idx}`] || false}
                    onChange={(e) => handleInputChange(`status_${idx}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  <b>{status}</b>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature and Approval Stamp */}
      <div className="border-t-2 border-gray-800 pt-6 mt-6">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div>
              <div className="border-b border-black w-64 mb-1">
                <Input 
                  value={user?.name || ''}
                  className="border-0 bg-transparent text-center"
                  readOnly
                />
              </div>
              <p className="text-sm">Tarkastavan lääkärin nimi ja allekirjoitus</p>
            </div>
            <div>
              <p className="text-sm">Lääkärin rekisterinumero: <Input className="w-32 inline-block ml-2" value={formData.doctor_reg || ''} onChange={(e) => handleInputChange('doctor_reg', e.target.value)} disabled={isPdfPreview} /></p>
            </div>
          </div>
          
          {/* Approval Stamp - Only show in PDF preview */}
          {isPdfPreview && approvalStatus !== 'pending' && showApprovalInPdf && (
            <ApprovalStamp 
              approved={approvalStatus === 'approved'} 
              approverName={user?.name || ''}
              date={getCurrentDate()}
            />
          )}
        </div>
      </div>

      {/* OOC Info */}
      <div className="border-t border-gray-300 pt-4 mt-6 text-xs text-gray-500">
        <p><b>OOC-tiedot:</b> Pelaaja: <Input className="w-32 inline-block" value={formData.ooc_player || ''} onChange={(e) => handleInputChange('ooc_player', e.target.value)} disabled={isPdfPreview} /> | Discord: <Input className="w-32 inline-block" value={formData.ooc_discord || ''} onChange={(e) => handleInputChange('ooc_discord', e.target.value)} disabled={isPdfPreview} /> | Hahmon nimi: <Input className="w-32 inline-block" value={patientName} readOnly /></p>
      </div>
    </div>
  );

  // Render Psychologist Form
  const renderPsychForm = (isPdfPreview = false) => (
    <div className="space-y-6">
      {/* Header with HUS Logo */}
      <div className="border-b-2 border-double border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <HUSLogo className="w-20 h-16" />
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-bold text-[#0066b3]">PSYKOLOGIN ARVIOINTILOMAKE</h1>
            <p className="text-gray-600 text-sm mt-1">Helsinki-Uusimaan sairaanhoitopiiri | Mielenterveys- ja päihdeyksikkö</p>
          </div>
          <div className="text-right text-sm">
            <p>Päivämäärä: <Input className="w-28 inline-block" value={formData.date || getCurrentDate()} onChange={(e) => handleInputChange('date', e.target.value)} disabled={isPdfPreview} /></p>
            <p className="mt-1">Arvioija: <Input className="w-40 inline-block" value={user?.name || ''} readOnly /></p>
          </div>
        </div>
      </div>

      {/* Section 1: Basic Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">1. Perustiedot</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Nimi:</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={patientName} 
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Potilaan nimi"
                className="flex-1"
                disabled={isPdfPreview}
              />
              {!isPdfPreview && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPatientDialog(true)}
                  title="Valitse potilasrekisteristä"
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  Valitse
                </Button>
              )}
            </div>
            {selectedPatient && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Valittu rekisteristä: {selectedPatient.firstName} {selectedPatient.lastName}
              </Badge>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold">Syntymäaika:</Label>
            <Input 
              value={formData.birthdate || ''} 
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
              className="mt-1"
              placeholder="pp.kk.vvvv"
              disabled={isPdfPreview}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Ammatti:</Label>
            <Input 
              value={formData.occupation || ''} 
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="mt-1"
              disabled={isPdfPreview}
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Työnantaja:</Label>
            <Input 
              value={formData.employer || ''} 
              onChange={(e) => handleInputChange('employer', e.target.value)}
              className="mt-1"
              disabled={isPdfPreview}
            />
          </div>
        </div>
        <div className="mt-4">
          <Label className="text-sm font-semibold">Arvioinnin syy:</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {['Aloitus', 'Määräaikaistarkastus', 'Poissa jälkeen', 'Epäily päihteistä', 'Traumaattinen tapahtuma'].map((reason) => (
              <label key={reason} className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={formData[`reason_${reason}`] || false}
                  onChange={(e) => handleInputChange(`reason_${reason}`, e.target.checked)}
                  className="rounded"
                  disabled={isPdfPreview}
                />
                {reason}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Mental Health Screening */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">2. Mielenterveyden seulonta</h2>
        
        <div className="mb-4">
          <h3 className="bg-blue-100 text-blue-700 px-2 py-1 text-sm font-semibold mb-2">2.1 Masennus ja mielialahäiriöt (PHQ-9)</h3>
          <table className="w-full text-sm">
            <tbody>
              {[
                'Vähäinen mielenkiinto tai ilo asioihin',
                'Alakuloisuus, masentuneisuus tai toivottomuus',
                'Nukkumisvaikeudet (väsymys tai unettomuus)',
                'Väsymys tai energian puute',
                'Ruokahalun muutokset',
                'Itsetuhoiset ajatukset (kriittinen!)'
              ].map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{item}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((score) => (
                        <label key={score} className="flex items-center gap-1 text-xs">
                          <input 
                            type="radio"
                            name={`phq_${idx}`}
                            checked={formData[`phq_${idx}`] === score}
                            onChange={() => handleInputChange(`phq_${idx}`, score)}
                            disabled={isPdfPreview}
                          />
                          {score}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <h3 className="bg-blue-100 text-blue-700 px-2 py-1 text-sm font-semibold mb-2">2.2 PTSD (Trauma)</h3>
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <Label className="text-sm font-semibold">Traumaattiset kokemukset:</Label>
            <textarea 
              className="w-full mt-2 p-2 border rounded-md min-h-[60px]"
              value={formData.trauma || ''}
              onChange={(e) => handleInputChange('trauma', e.target.value)}
              placeholder="Kirjaa traumaattiset kokemukset..."
              disabled={isPdfPreview}
            />
          </div>
        </div>

        <div>
          <h3 className="bg-blue-100 text-blue-700 px-2 py-1 text-sm font-semibold mb-2">2.3 Ahdistuneisuus (GAD-7)</h3>
          <div className="flex flex-wrap gap-4">
            {['Hermostuneisuus', 'Hallitsematon huolehtiminen', 'Liiallinen huoli', 'Levottomuus', 'Ärsyyntyvyys'].map((item, idx) => (
              <label key={idx} className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={formData[`gad_${idx}`] || false}
                  onChange={(e) => handleInputChange(`gad_${idx}`, e.target.checked)}
                  className="rounded"
                  disabled={isPdfPreview}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Substance Abuse */}
      <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
        <h2 className="bg-red-600 text-white px-3 py-2 text-sm font-bold uppercase mb-4">3. Päihdekäyttö</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Alkoholin käyttö:</Label>
            <div className="space-y-1 mt-2">
              {['Ei käytä', 'Satunnaisesti', 'Säännöllisesti', 'Päivittäin'].map((level) => (
                <label key={level} className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio"
                    name="alcohol"
                    checked={formData.alcohol === level}
                    onChange={() => handleInputChange('alcohol', level)}
                    disabled={isPdfPreview}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Huumeiden käyttö:</Label>
            <div className="space-y-1 mt-2">
              {['Ei käytä', 'Entinen käyttäjä', 'Nykyinen käyttäjä'].map((level) => (
                <label key={level} className="flex items-center gap-1 text-sm">
                  <input 
                    type="radio"
                    name="drugs"
                    checked={formData.drugs === level}
                    onChange={() => handleInputChange('drugs', level)}
                    disabled={isPdfPreview}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Psychologist's Assessment */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="bg-[#0066b3] text-white px-3 py-2 text-sm font-bold uppercase mb-4">4. Psykologin arvio</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Yleiskuva ja havainnot:</Label>
            <textarea 
              className="w-full mt-2 p-2 border rounded-md min-h-[80px]"
              value={formData.psych_notes || ''}
              onChange={(e) => handleInputChange('psych_notes', e.target.value)}
              placeholder="Kirjaa yleiskuva ja havainnot..."
              disabled={isPdfPreview}
            />
          </div>
          <div className="bg-yellow-50 p-3 rounded border-2 border-gray-800">
            <Label className="text-sm font-semibold">SUOSITUS:</Label>
            <div className="space-y-2 mt-2">
              {[
                'Sopii virkaan - Ei huomautettavaa',
                'Sopii virkaan - Seuranta suositeltavaa',
                'Ei sovellu virkaan - Jatkoarviointi tarpeen',
                'Ei sovellu virkaan - Päihdeongelma',
                'Ei sovellu virkaan - Mielenterveysongelma'
              ].map((rec, idx) => (
                <label key={idx} className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox"
                    checked={formData[`rec_${idx}`] || false}
                    onChange={(e) => handleInputChange(`rec_${idx}`, e.target.checked)}
                    className="rounded"
                    disabled={isPdfPreview}
                  />
                  <b>{rec}</b>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature and Approval Stamp */}
      <div className="border-t-2 border-gray-800 pt-6 mt-6">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div>
              <div className="border-b border-black w-64 mb-1">
                <Input 
                  value={user?.name || ''}
                  className="border-0 bg-transparent text-center"
                  readOnly
                />
              </div>
              <p className="text-sm">Psykologin nimi ja allekirjoitus</p>
            </div>
            <div>
              <p className="text-sm">Psykologin rekisterinumero: <Input className="w-32 inline-block ml-2" value={formData.psych_reg || ''} onChange={(e) => handleInputChange('psych_reg', e.target.value)} disabled={isPdfPreview} /></p>
            </div>
          </div>
          
          {/* Approval Stamp - Only show in PDF preview */}
          {isPdfPreview && approvalStatus !== 'pending' && showApprovalInPdf && (
            <ApprovalStamp 
              approved={approvalStatus === 'approved'} 
              approverName={user?.name || ''}
              date={getCurrentDate()}
            />
          )}
        </div>
      </div>

      {/* OOC Info */}
      <div className="border-t border-gray-300 pt-4 mt-6 text-xs text-gray-500">
        <p><b>OOC-tiedot:</b> Pelaaja: <Input className="w-32 inline-block" value={formData.ooc_player || ''} onChange={(e) => handleInputChange('ooc_player', e.target.value)} disabled={isPdfPreview} /> | Discord: <Input className="w-32 inline-block" value={formData.ooc_discord || ''} onChange={(e) => handleInputChange('ooc_discord', e.target.value)} disabled={isPdfPreview} /> | Hahmon nimi: <Input className="w-32 inline-block" value={patientName} readOnly /></p>
      </div>
    </div>
  );

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Uusi lomake</h2>
            <p className="text-gray-500">Valitse pohja ja aloita täyttäminen</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0066b3] to-[#00a8b3] flex items-center justify-center text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{template.category}</span>
                  <span>•</span>
                  <span>Lomakepohja</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Takaisin
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedTemplateData?.name}</h2>
            <p className="text-gray-500">{selectedTemplateData?.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Tallenna
          </Button>
          <Button variant="outline" onClick={handlePrintWithValidation}>
            <Download className="w-4 h-4 mr-2" />
            Tallenna PDF
          </Button>
        </div>
      </div>

      {/* Real-time Preview Toggle */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Reaaliaikainen esikatselu</p>
                <p className="text-sm text-blue-700">Näet muutokset välittömästi alla</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Piilota esikatselu' : 'Näytä esikatselu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval System - Only visible in edit mode */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Stamp className="w-5 h-5" />
            Hyväksyntä (ei näy PDF:ssä)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setApprovalStatus('pending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  approvalStatus === 'pending' 
                    ? 'border-amber-500 bg-amber-100' 
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="w-4 h-4 rounded-full border-2 border-amber-500" />
                <span>Odottaa</span>
              </button>
              <button
                onClick={() => setApprovalStatus('approved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  approvalStatus === 'approved' 
                    ? 'border-green-500 bg-green-100' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Hyväksy</span>
              </button>
              <button
                onClick={() => setApprovalStatus('rejected')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  approvalStatus === 'rejected' 
                    ? 'border-red-500 bg-red-100' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Hylkää</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={showApprovalInPdf} 
                onCheckedChange={setShowApprovalInPdf}
              />
              <Label className="text-sm">Näytä hyväksyntäleima PDF:ssä</Label>
            </div>
            
            {approvalStatus !== 'pending' && (
              <div className={`p-3 rounded-lg ${approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-medium">
                  {approvalStatus === 'approved' ? '✓ Lomake hyväksytty' : '✗ Lomake hylätty'}
                </p>
                <p className="text-sm">
                  Hyväksyjä: {user?.name} | Päivämäärä: {getCurrentDate()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {selectedTemplate === 'poliisi-tt' && renderPoliceForm(false)}
          {selectedTemplate === 'psykologi' && renderPsychForm(false)}
        </CardContent>
      </Card>

      {/* Live Preview */}
      {showPreview && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Esikatselu (näyttää PDF-muodon)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <div className="watermark">.ruutu</div>
            {selectedTemplate === 'poliisi-tt' && renderPoliceForm(true)}
            {selectedTemplate === 'psykologi' && renderPsychForm(true)}
          </CardContent>
        </Card>
      )}

      {/* Patient Selection Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Valitse potilas rekisteristä</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Hae potilaita..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#0066b3] flex items-center justify-center text-white font-semibold">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-500">
                            {patient.occupation || 'Ei ammattia'} • {patient.age} v
                          </p>
                        </div>
                      </div>
                      <Badge className={patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {patient.status === 'active' ? 'Aktiivinen' : patient.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Ei potilaita rekisterissä</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>Peruuta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Password/Reason Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              PDF-tallennus
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {settings.security.requirePasswordForPdf && (
              <div>
                <Label>Salasana</Label>
                <Input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Syötä salasana..."
                />
                <p className="text-xs text-gray-500 mt-1">Oletus: Muokkaalaakarit</p>
              </div>
            )}
            {settings.security.requireReasonForPdf && (
              <div>
                <Label>Syy tallennukseen</Label>
                <textarea
                  value={pdfReason}
                  onChange={(e) => setPdfReason(e.target.value)}
                  placeholder="Miksi tallennat PDF:n?"
                  className="w-full p-2 border rounded-md min-h-[80px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfDialog(false)}>Peruuta</Button>
            <Button onClick={handlePdfConfirm}>Jatka</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>PDF Esikatselu</span>
              <Button onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Tulosta PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-8 bg-white">
              <div className="watermark">.ruutu</div>
              {selectedTemplate === 'poliisi-tt' && renderPoliceForm(true)}
              {selectedTemplate === 'psykologi' && renderPsychForm(true)}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
