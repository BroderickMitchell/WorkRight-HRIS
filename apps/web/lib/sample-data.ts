export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  avatarUrl?: string;
  managerId?: string;
  dottedLineManagerId?: string;
}

export const sampleEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Mason Manager',
    role: 'Superintendent',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'manager@acme.example.au',
    avatarUrl: 'https://i.pravatar.cc/128?img=68'
  },
  {
    id: 'emp-2',
    name: 'Sienna Surveyor',
    role: 'Surveyor',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'sienna.surveyor@acme.example.au',
    avatarUrl: 'https://i.pravatar.cc/128?img=49',
    managerId: 'emp-1'
  },
  {
    id: 'emp-3',
    name: 'Noah Navigator',
    role: 'HR Advisor',
    department: 'People & Culture',
    location: 'Brisbane, QLD',
    email: 'noah.navigator@acme.example.au',
    avatarUrl: 'https://i.pravatar.cc/128?img=12',
    managerId: 'emp-1',
    dottedLineManagerId: 'emp-2'
  }
];

export const sampleGoals = [
  {
    id: 'goal-1',
    title: 'Reduce safety incidents by 20%',
    owner: 'Mason Manager',
    progress: 0.55,
    dueDate: '30/09/2024',
    alignment: 'Corporate > Operations'
  },
  {
    id: 'goal-2',
    title: 'Complete cultural capability learning for all crew',
    owner: 'Noah Navigator',
    progress: 0.35,
    dueDate: '15/08/2024',
    alignment: 'Corporate > People & Culture'
  }
];

export const sampleLeave = [
  {
    id: 'leave-1',
    employee: 'Sienna Surveyor',
    type: 'Annual Leave',
    period: '12/04/2024 - 19/04/2024',
    status: 'Pending manager approval'
  },
  {
    id: 'leave-2',
    employee: 'Noah Navigator',
    type: 'Personal Leave',
    period: '02/05/2024 - 03/05/2024',
    status: 'Approved'
  }
];

export interface OrgNode {
  name: string;
  role: string;
  children: OrgNode[];
}

export const sampleOrg: OrgNode = {
  name: 'Mason Manager',
  role: 'Superintendent',
  children: [
    {
      name: 'Sienna Surveyor',
      role: 'Surveyor',
      children: []
    },
    {
      name: 'Noah Navigator',
      role: 'HR Advisor',
      children: []
    }
  ]
};

export const sampleReports = {
  headcount: 48,
  attritionRate: '4.2% (rolling 12 months)',
  leaveBalance: '312 days outstanding',
  reviewCompletion: '68% complete for FY24'
};

// Documents
export interface SignedDocument {
  id: string;
  employeeId: string;
  title: string;
  signedOn: string; // ISO date
  url?: string;
}
export const sampleDocuments: SignedDocument[] = [
  { id: 'doc-1', employeeId: 'emp-2', title: 'Employment Contract', signedOn: '2024-01-10' },
  { id: 'doc-2', employeeId: 'emp-3', title: 'Code of Conduct', signedOn: '2024-03-02' }
];

// Remuneration
export interface Remuneration {
  employeeId: string;
  baseSalaryAud: number; // AUD
  allowances?: string[];
}
export const sampleRemuneration: Remuneration[] = [
  { employeeId: 'emp-1', baseSalaryAud: 180000, allowances: ['Vehicle', 'Remote'] },
  { employeeId: 'emp-2', baseSalaryAud: 110000 },
  { employeeId: 'emp-3', baseSalaryAud: 98000 }
];

// Salary/Contract history
export interface EmploymentHistoryItem {
  id: string;
  employeeId: string;
  effective: string; // ISO
  type: 'Salary Change' | 'Contract Updated';
  details: string;
}
export const sampleEmploymentHistory: EmploymentHistoryItem[] = [
  { id: 'hist-1', employeeId: 'emp-2', effective: '2024-07-01', type: 'Salary Change', details: 'Base increased to $110,000' },
  { id: 'hist-2', employeeId: 'emp-3', effective: '2024-05-15', type: 'Contract Updated', details: 'Converted from casual to permanent' }
];

// Performance reviews
export interface PerformanceReview {
  id: string;
  employeeId: string;
  cycle: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Completed';
  overall?: string;
}
export const sampleReviews: PerformanceReview[] = [
  { id: 'rev-1', employeeId: 'emp-2', cycle: 'FY24', status: 'Completed', overall: 'Meets Expectations' },
  { id: 'rev-2', employeeId: 'emp-3', cycle: 'FY24', status: 'In Progress' }
];

// Disciplinary records
export interface DisciplinaryRecord {
  id: string;
  employeeId: string;
  date: string;
  category: 'Warning' | 'Performance Plan' | 'Other';
  notes: string;
}
export const sampleDiscipline: DisciplinaryRecord[] = [
  { id: 'disc-1', employeeId: 'emp-3', date: '2024-06-20', category: 'Warning', notes: 'Attendance reminder issued' }
];

export const sampleTasks = [
  { id: 'task-1', title: 'Approve leave request', dueDate: 'Today', context: 'Leave & time off' },
  { id: 'task-2', title: 'Review new goal draft', dueDate: 'Tomorrow', context: 'Performance' }
];

export const sampleWorkflows = [
  { id: 'wf-1', title: 'Onboarding – Sienna Surveyor', currentStep: 'Manager review', submitted: '2 days ago' },
  { id: 'wf-2', title: 'Policy acknowledgement', currentStep: 'Awaiting employee', submitted: '1 week ago' }
];
