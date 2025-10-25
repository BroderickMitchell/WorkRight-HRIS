export const sampleEmployees = [
  {
    id: 'emp-1',
    name: 'Mason Manager',
    role: 'Superintendent',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'manager@acme.example.au',
    reports: 4
  },
  {
    id: 'emp-2',
    name: 'Sienna Surveyor',
    role: 'Surveyor',
    department: 'Operations',
    location: 'Perth, WA',
    email: 'sienna.surveyor@acme.example.au',
    reports: 0
  },
  {
    id: 'emp-3',
    name: 'Noah Navigator',
    role: 'HR Advisor',
    department: 'People & Culture',
    location: 'Brisbane, QLD',
    email: 'noah.navigator@acme.example.au',
    reports: 0
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
