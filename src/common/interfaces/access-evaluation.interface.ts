export interface AccessEvaluationRequest {
  userId: string;
  service: string;
  resource: string;
  action: string;
  resourceId?: string;
  context?: Record<string, unknown>;
}

export interface AccessEvaluationResult {
  allowed: boolean;
  reasons: string[];
  evaluatedModels: string[];
}
