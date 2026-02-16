// This file is for testing allergy alerts
// Run in browser console to populate test data

export const testPatient = {
  id: 'patient-test-1',
  firstName: 'Pekka',
  lastName: 'Potilas',
  birthDate: new Date('1975-06-15'),
  age: 50,
  status: 'active' as const,
  phone: '+358501234567',
  email: 'pekka.potilas@example.com',
  address: 'Testikatu 123, 00100 Helsinki',
  allergies: ['Penisillini', 'Ibuprofeeni', 'Pähkinät'],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user',
};

export function initializeTestData() {
  try {
    // Get existing patients
    const existingPatients = JSON.parse(localStorage.getItem('hus_patients') || '[]');
    
    // Check if test patient already exists
    const testPatientExists = existingPatients.some((p: any) => p.id === 'patient-test-1');
    
    if (!testPatientExists) {
      existingPatients.push(testPatient);
      localStorage.setItem('hus_patients', JSON.stringify(existingPatients));
      console.log('✅ Test patient added:', testPatient);
    } else {
      console.log('ℹ️ Test patient already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
  }
}
