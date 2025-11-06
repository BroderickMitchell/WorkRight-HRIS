import type {
  WorkflowNodeType,
  WorkflowAssignmentMode,
  WorkflowNodeRunStatus,
  WorkflowRunStatus,
  WorkflowStatus
} from '@prisma/client';

type NodePosition = { x: number; y: number };

type TaskAssignmentMode = Extract<
  WorkflowAssignmentMode,
  'assignee' | 'assignee_manager' | 'user' | 'group'
>;

export type WorkflowNodeSettings = Record<string, unknown>;

export interface WorkflowNodeDefinition {
  id: string;
  type: WorkflowNodeType;
  title: string;
  settings: WorkflowNodeSettings;
  position: NodePosition;
}

export interface WorkflowEdgeDefinition {
  id: string;
  from: string;
  to: string;
  label?: 'true' | 'false' | null;
  order?: number | null;
}

export interface WorkflowGraphDefinition {
  nodes: WorkflowNodeDefinition[];
  edges: WorkflowEdgeDefinition[];
}

export interface AssignmentConfig {
  mode: TaskAssignmentMode;
  id?: string | null;
}

export interface DueRuleConfig {
  basis: 'assignee.start_date' | 'assignee.end_date' | 'node.activation_time';
  offset?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  } | null;
  direction?: 'BEFORE' | 'AFTER';
}

export type ConditionOperator = 'IS' | 'IS_PARENT_OF' | 'IS_CHILD_OF';

export interface ConditionCriterion {
  field: 'department' | 'location' | 'position' | 'manager' | 'legal_entity';
  op: ConditionOperator;
  valueId: string;
}

export interface ConditionSettings {
  logic: 'ALL' | 'ANY';
  criteria: ConditionCriterion[];
}

export type NodeSettingsMap = {
  task: {
    taskTemplateId: string;
    assignment: AssignmentConfig;
    dueRule?: DueRuleConfig | null;
  };
  form: {
    formTemplateId: string;
    assignment: AssignmentConfig;
    dueRule?: DueRuleConfig | null;
  };
  course: {
    courseId: string;
    assignment: Extract<TaskAssignmentMode, 'assignee' | 'assignee_manager'>;
  };
  email: {
    emailTemplateId: string;
    recipients: AssignmentConfig;
    schedule?: {
      relativeTo: 'start_date' | 'end_date' | 'activation_time';
      offset?: {
        value: number;
        unit: 'days' | 'weeks' | 'months';
      } | null;
      direction?: 'BEFORE' | 'AFTER';
      sendTime?: string | null;
    } | null;
  };
  profile_task: {
    profileTaskTemplateId: string;
  };
  survey: {
    surveyId: string;
  };
  condition: ConditionSettings;
  dummy_task: {
    taskTemplateId: string;
    assignment: AssignmentConfig;
    dueRule?: DueRuleConfig | null;
  };
};

export type WorkflowStatusType = WorkflowStatus;
export type WorkflowRunStatusType = WorkflowRunStatus;
export type WorkflowNodeRunStatusType = WorkflowNodeRunStatus;
