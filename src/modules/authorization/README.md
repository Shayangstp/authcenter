Authorization evaluation flow:
1. External application registers through POST /api/services/register.
2. Auth Center persists enabled authorization models for that service.
3. AuthorizationEngineService loads the service configuration.
4. Only enabled models are evaluated in sequence.
5. The first ALLOW short-circuits the pipeline; otherwise access is denied.
