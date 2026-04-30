export interface AggregateRow {
  business_count: number;
  avg_questions_answered: number | null;
  p50_response_time: number | null;
  p90_response_time: number | null;
}

export function shouldSuppress(row: AggregateRow | null): boolean {
  if (!row) {
    return true;
  }
  if (row.business_count < 5) {
    return true;
  }
  return false;
}

export function suppressionResponse() {
  return {
    status: 'building',
    message: "You're building something. Check back soon.",
  };
}
