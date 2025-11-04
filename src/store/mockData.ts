import { Patient, Employee, Department, Pharmaceutical, PharmaceuticalCategory, Bed, Ward } from '../types';

export const mockDepartments: Department[] = [
  { id: '1', name: 'Emergency', description: 'Emergency care and trauma' },
  { id: '2', name: 'Cardiology', description: 'Heart and cardiovascular care' },
  { id: '3', name: 'Pediatrics', description: 'Child healthcare' },
  { id: '4', name: 'Orthopedics', description: 'Bone and joint care' },
  { id: '5', name: 'Pharmacy', description: 'Medication dispensary' },
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@hospital.com',
    phone: '555-0101',
    departmentId: '1',
    position: 'Chief Emergency Physician',
    status: 'active',
    hireDate: '2020-01-15',
    salary: 150000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'michael.c@hospital.com',
    phone: '555-0102',
    departmentId: '2',
    position: 'Cardiologist',
    status: 'active',
    hireDate: '2019-03-20',
    salary: 180000,
  },
];

export const mockPatients: Patient[] = [
  {
    id: '1',
    patientId: 'PAT001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '555-1001',
    email: 'john.doe@email.com',
    address: '123 Main St, City',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '555-1002',
    status: 'active',
  },
  {
    id: '2',
    patientId: 'PAT002',
    firstName: 'Emma',
    lastName: 'Wilson',
    dateOfBirth: '1990-08-22',
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '555-1003',
    email: 'emma.w@email.com',
    address: '456 Oak Ave, City',
    emergencyContact: 'Tom Wilson',
    emergencyPhone: '555-1004',
    status: 'active',
  },
];

export const mockCategories: PharmaceuticalCategory[] = [
  { id: '1', name: 'Antibiotics', description: 'Bacterial infection treatment' },
  { id: '2', name: 'Analgesics', description: 'Pain relief medications' },
  { id: '3', name: 'Cardiovascular', description: 'Heart and blood pressure medications' },
  { id: '4', name: 'Vitamins', description: 'Nutritional supplements' },
];

export const mockPharmaceuticals: Pharmaceutical[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    categoryId: '1',
    description: 'Broad-spectrum antibiotic',
    dosageForm: 'Capsule',
    strength: '500mg',
    unitPrice: 15.99,
    stockQuantity: 500,
    reorderLevel: 100,
  },
  {
    id: '2',
    name: 'Ibuprofen',
    categoryId: '2',
    description: 'Pain and inflammation relief',
    dosageForm: 'Tablet',
    strength: '200mg',
    unitPrice: 8.99,
    stockQuantity: 1000,
    reorderLevel: 200,
  },
];

export const mockWards: Ward[] = [
  { id: '1', name: 'ICU Ward', departmentId: '1', floorNumber: 2, capacity: 20 },
  { id: '2', name: 'General Ward A', departmentId: '1', floorNumber: 3, capacity: 40 },
  { id: '3', name: 'Cardiac Ward', departmentId: '2', floorNumber: 4, capacity: 30 },
];

export const mockBeds: Bed[] = [
  { id: '1', bedNumber: 'ICU-001', wardId: '1', status: 'occupied' },
  { id: '2', bedNumber: 'ICU-002', wardId: '1', status: 'available' },
  { id: '3', bedNumber: 'GA-001', wardId: '2', status: 'available' },
  { id: '4', bedNumber: 'GA-002', wardId: '2', status: 'occupied' },
];
