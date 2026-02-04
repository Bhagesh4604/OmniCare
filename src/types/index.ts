export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'active' | 'discharged' | 'transferred';
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  salary: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Pharmaceutical {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
}

export interface PharmaceuticalCategory {
  id: string;
  name: string;
  description: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  prescriptionDate: string;
  notes: string;
  status: string;
}

export interface AccountPayable {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial';
  description: string;
}

export interface AccountReceivable {
  id: string;
  invoiceNumber: string;
  patientId: string;
  amount: number;
  dueDate: string;
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partial';
  description: string;
}

export interface LabTest {
  id: string;
  testNumber: string;
  patientId: string;
  doctorId: string;
  testName: string;
  testDate: string;
  status: string;
}

export interface SurgeryRecord {
  id: string;
  surgeryNumber: string;
  patientId: string;
  surgeonId: string;
  surgeryType: string;
  surgeryDate: string;
  durationMinutes: number;
  notes: string;
  status: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: string;
}

export interface Vendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  vendorType: string;
  status: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface Ward {
  id: string;
  name: string;
  departmentId: string;
  floorNumber: number;
  capacity: number;
}
