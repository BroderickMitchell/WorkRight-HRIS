export type EmploymentChangeType = 'Promotion' | 'Secondment' | 'Remuneration change';
export type DisciplinaryActionType =
  | 'Record of Conversation'
  | 'Verbal warning'
  | 'Written warning'
  | 'Final written warning';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  preferred?: boolean;
}

export interface EmployeeWorkHistoryItem {
  organisation: string;
  role: string;
  start: string;
  end: string;
  notes?: string;
}

export interface EmploymentChange {
  type: EmploymentChangeType;
  date: string;
  details: string;
}

export interface PerformanceReviewRecord {
  cycle: string;
  date: string;
  rating: string;
  summary: string;
  reviewerId?: string;
}

export interface DisciplinaryActionRecord {
  type: DisciplinaryActionType;
  date: string;
  notes: string;
  investigatorId: string;
}

export interface EmployeePersonalDetails {
  dateOfBirth: string;
  preferredName: string;
  pronouns: string;
  homeAddress: string;
  postalAddress?: string;
  phone: string;
  secondaryEmail?: string;
  emergencyInformation?: string;
  indigenousStatus?: string;
}

export interface EmployeeJobDetails {
  positionId: string;
  positionTitle: string;
  reportsToName?: string;
  reportsToId?: string;
  team: string;
  costCentre: string;
  employmentStatus: string;
  employmentType: string;
  startDate: string;
  serviceDate: string;
  roster: string;
  workLocation: string;
  awardClassification?: string;
}

export interface AllowanceDetail {
  name: string;
  amount: string;
}

export interface EmployeeRemuneration {
  baseSalary: string;
  superannuation: string;
  bonusTarget?: string;
  allowances: AllowanceDetail[];
  payCycle: string;
  lastReviewed: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  employmentType: string;
  startDate: string;
  employeeNumber: string;
  reports: number;
  managerId?: string;
  profileImage: string;
  personalDetails: EmployeePersonalDetails;
  jobDetails: EmployeeJobDetails;
  remuneration: EmployeeRemuneration;
  emergencyContacts: EmergencyContact[];
  workHistory: EmployeeWorkHistoryItem[];
  employmentChanges: EmploymentChange[];
  performanceReviews: PerformanceReviewRecord[];
  disciplinaryActions: DisciplinaryActionRecord[];
}

export const sampleEmployees: EmployeeProfile[] = [
  {
    id: 'emp-1',
    name: 'Mason Manager',
    role: 'Superintendent',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'manager@acme.example.au',
    phone: '+61 8 6222 4001',
    employmentType: 'Permanent full-time',
    startDate: '15/02/2018',
    employeeNumber: 'ACM00123',
    reports: 4,
    profileImage: 'https://ui-avatars.com/api/?name=Mason+Manager&background=0D8ABC&color=fff',
    personalDetails: {
      dateOfBirth: '12/06/1982',
      preferredName: 'Mase',
      pronouns: 'he/him',
      homeAddress: '4 Cottesloe Parade, Perth WA 6000',
      postalAddress: 'PO Box 45, Perth WA 6850',
      phone: '+61 422 400 555',
      secondaryEmail: 'mason.manager@gmail.com'
    },
    jobDetails: {
      positionId: 'POS-1001',
      positionTitle: 'Superintendent - West Pit',
      reportsToName: 'Amelia Argent (GM Operations)',
      team: 'Operations Leadership',
      costCentre: '400-OPS',
      employmentStatus: 'Active',
      employmentType: 'Permanent full-time',
      startDate: '15/02/2018',
      serviceDate: '15/02/2014',
      roster: '8/6 FIFO roster',
      workLocation: 'Pilbara, WA',
      awardClassification: 'Enterprise Agreement - Band 6'
    },
    remuneration: {
      baseSalary: '$165,000.00',
      superannuation: '11% employer contribution',
      bonusTarget: '15% STI',
      allowances: [
        { name: 'Site allowance', amount: '$120 per swing' },
        { name: 'Vehicle allowance', amount: '$450 per month' }
      ],
      payCycle: 'Fortnightly',
      lastReviewed: '01/03/2024'
    },
    emergencyContacts: [
      {
        name: 'Harper Manager',
        relationship: 'Spouse',
        phone: '+61 422 400 556',
        email: 'harper.manager@example.com',
        preferred: true
      },
      {
        name: 'Jordan Manager',
        relationship: 'Sibling',
        phone: '+61 414 885 221'
      }
    ],
    workHistory: [
      {
        organisation: 'Acme Resources',
        role: 'Superintendent - West Pit',
        start: '07/2021',
        end: 'Present',
        notes: 'Responsible for 180-person crew across two digs.'
      },
      {
        organisation: 'Acme Resources',
        role: 'Production Supervisor',
        start: '02/2018',
        end: '06/2021',
        notes: 'Led shift teams and delivered continuous improvement projects.'
      },
      {
        organisation: 'Pilbara Metals',
        role: 'Shift Lead',
        start: '01/2012',
        end: '01/2018'
      }
    ],
    employmentChanges: [
      {
        type: 'Promotion',
        date: '01/07/2021',
        details: 'Promoted to Superintendent following leadership development program.'
      },
      {
        type: 'Remuneration change',
        date: '01/03/2024',
        details: 'Base salary adjustment following annual remuneration review.'
      }
    ],
    performanceReviews: [
      {
        cycle: 'FY23 Annual review',
        date: '30/06/2023',
        rating: 'Exceeds expectations',
        summary: 'Delivered 18% productivity uplift while improving safety outcomes.',
        reviewerId: 'emp-3'
      },
      {
        cycle: 'FY23 Mid-year check-in',
        date: '15/12/2022',
        rating: 'On track',
        summary: 'Team succession plans in place and turnover reduced to <5%.'
      }
    ],
    disciplinaryActions: []
  },
  {
    id: 'emp-2',
    name: 'Sienna Surveyor',
    role: 'Surveyor',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'sienna.surveyor@acme.example.au',
    phone: '+61 8 6222 4012',
    employmentType: 'Permanent full-time',
    startDate: '01/09/2020',
    employeeNumber: 'ACM00457',
    reports: 0,
    managerId: 'emp-1',
    profileImage: 'https://ui-avatars.com/api/?name=Sienna+Surveyor&background=FF8C42&color=fff',
    personalDetails: {
      dateOfBirth: '05/11/1991',
      preferredName: 'Sienna',
      pronouns: 'she/her',
      homeAddress: '11 Beaconsfield Rise, Fremantle WA 6160',
      phone: '+61 403 889 100',
      emergencyInformation: 'Asthma - inhaler carried in work kit.'
    },
    jobDetails: {
      positionId: 'POS-2045',
      positionTitle: 'Mine Surveyor',
      reportsToName: 'Mason Manager',
      reportsToId: 'emp-1',
      team: 'Survey & Technical Services',
      costCentre: '410-SURV',
      employmentStatus: 'Active',
      employmentType: 'Permanent full-time',
      startDate: '01/09/2020',
      serviceDate: '01/09/2020',
      roster: '5/2 Perth-based',
      workLocation: 'Perth Airport & Pilbara sites',
      awardClassification: 'Professional Award Level 3'
    },
    remuneration: {
      baseSalary: '$108,500.00',
      superannuation: '11% employer contribution',
      allowances: [
        { name: 'Travel allowance', amount: '$95 per overnight stay' },
        { name: 'Field meal allowance', amount: '$32 per day' }
      ],
      payCycle: 'Fortnightly',
      lastReviewed: '01/03/2024'
    },
    emergencyContacts: [
      {
        name: 'Theo Surveyor',
        relationship: 'Partner',
        phone: '+61 437 552 001',
        email: 'theo.surveyor@example.com',
        preferred: true
      },
      {
        name: 'Claudia Harms',
        relationship: 'Parent',
        phone: '+61 414 884 776'
      }
    ],
    workHistory: [
      {
        organisation: 'Acme Resources',
        role: 'Mine Surveyor',
        start: '09/2020',
        end: 'Present',
        notes: 'Supports weekly dig plan updates and drone surveys.'
      },
      {
        organisation: 'GeoSight Consulting',
        role: 'Graduate Surveyor',
        start: '01/2017',
        end: '08/2020',
        notes: 'Completed graduate rotations across exploration projects.'
      }
    ],
    employmentChanges: [
      {
        type: 'Secondment',
        date: '01/04/2023',
        details: 'Three-month secondment to the autonomous haulage project team.'
      },
      {
        type: 'Remuneration change',
        date: '01/03/2024',
        details: 'Base uplift following 2024 market review.'
      }
    ],
    performanceReviews: [
      {
        cycle: 'FY23 Annual review',
        date: '28/06/2023',
        rating: 'On track',
        summary: 'Delivered accurate pit surveys and mentored graduates.',
        reviewerId: 'emp-1'
      }
    ],
    disciplinaryActions: [
      {
        type: 'Record of Conversation',
        date: '14/02/2022',
        notes: 'Late submission of weekly survey report; coaching provided.',
        investigatorId: 'emp-1'
      },
      {
        type: 'Written warning',
        date: '22/08/2022',
        notes: 'Unauthorised drone flight in controlled zone; remedial training assigned.',
        investigatorId: 'emp-3'
      }
    ]
  },
  {
    id: 'emp-3',
    name: 'Noah Navigator',
    role: 'HR Advisor',
    department: 'People & Culture',
    location: 'Brisbane, QLD',
    email: 'noah.navigator@acme.example.au',
    phone: '+61 7 3123 4400',
    employmentType: 'Permanent part-time (0.8 FTE)',
    startDate: '18/01/2019',
    employeeNumber: 'ACM00211',
    reports: 0,
    profileImage: 'https://ui-avatars.com/api/?name=Noah+Navigator&background=6359E9&color=fff',
    personalDetails: {
      dateOfBirth: '19/03/1988',
      preferredName: 'Noah',
      pronouns: 'they/them',
      homeAddress: '28 Riverwalk Avenue, Teneriffe QLD 4005',
      phone: '+61 414 992 330',
      emergencyInformation: 'Contact HR Director if travelling interstate.'
    },
    jobDetails: {
      positionId: 'POS-3002',
      positionTitle: 'HR Advisor - Capability',
      reportsToName: 'Lina Lawson (HR Manager)',
      team: 'People Partnering',
      costCentre: '500-HR',
      employmentStatus: 'Active',
      employmentType: 'Permanent part-time',
      startDate: '18/01/2019',
      serviceDate: '18/01/2019',
      roster: '4 days per week',
      workLocation: 'Brisbane, QLD',
      awardClassification: 'Corporate Services Level 4'
    },
    remuneration: {
      baseSalary: '$92,000.00 (0.8 FTE)',
      superannuation: '11% employer contribution',
      allowances: [{ name: 'Mobile allowance', amount: '$60 per month' }],
      payCycle: 'Fortnightly',
      lastReviewed: '01/02/2024'
    },
    emergencyContacts: [
      {
        name: 'Eli Navigator',
        relationship: 'Emergency contact',
        phone: '+61 437 991 220',
        preferred: true
      }
    ],
    workHistory: [
      {
        organisation: 'Acme Resources',
        role: 'HR Advisor - Capability',
        start: '01/2019',
        end: 'Present',
        notes: 'Supports learning programs, performance cycles, and policy updates.'
      },
      {
        organisation: 'Queensland Rail',
        role: 'HR Officer',
        start: '02/2015',
        end: '12/2018'
      }
    ],
    employmentChanges: [
      {
        type: 'Remuneration change',
        date: '01/02/2024',
        details: 'Salary adjustment following part-time move to 0.8 FTE.'
      }
    ],
    performanceReviews: [
      {
        cycle: 'FY23 Annual review',
        date: '15/06/2023',
        rating: 'Strong contributor',
        summary: 'Implemented revamped onboarding and digitised policy acknowledgements.',
        reviewerId: 'emp-1'
      }
    ],
    disciplinaryActions: [
      {
        type: 'Verbal warning',
        date: '03/05/2021',
        notes: 'Missed critical onboarding paperwork follow-up; process updated.',
        investigatorId: 'emp-1'
      }
    ]
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

export const sampleTasks = [
  {
    id: 'task-1',
    title: 'Submit quarterly headcount reconciliation',
    dueDate: '05/04/2024',
    owner: 'You',
    context: 'Reporting'
  },
  {
    id: 'task-2',
    title: 'Review learning completion for maintenance crew',
    dueDate: '08/04/2024',
    owner: 'You',
    context: 'Learning'
  }
];

export const sampleWorkflows = [
  {
    id: 'workflow-1',
    title: 'Annual leave request · Sienna Surveyor',
    submitted: '2 hours ago',
    currentStep: 'Awaiting manager approval'
  },
  {
    id: 'workflow-2',
    title: 'Goal change · Mason Manager',
    submitted: 'Yesterday',
    currentStep: 'HR review'
  }
];
