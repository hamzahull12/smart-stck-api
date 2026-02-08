export interface PostgresError {
  code: string;
}

export function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}
