export interface Env {
  DB: D1Database;
}

export async function runAggregation(env: Env): Promise<void> {
  const now = new Date();
  const periodEnd = now.toISOString().split('T')[0];
  const d = new Date(now);
  d.setDate(d.getDate() - 7);
  const periodStart = d.toISOString().split('T')[0];

  const metricsQuery = `
    SELECT
      b.vertical,
      b.geography,
      COUNT(DISTINCT b.id) AS business_count,
      AVG(c.questions_answered) AS avg_questions_answered,
      AVG(c.response_time_ms) AS p50_response_time,
      MAX(c.response_time_ms) AS p90_response_time
    FROM businesses b
    LEFT JOIN chat_logs c ON c.business_id = b.id
    WHERE b.opt_out_benchmarks = 0
      AND c.created_at >= ?
      AND c.created_at <= ?
    GROUP BY b.vertical, b.geography
    HAVING business_count >= 5
  `;

  const metrics = await env.DB.prepare(metricsQuery)
    .bind(periodStart, periodEnd + 'T23:59:59Z')
    .all();

  const faqQuery = `
    SELECT
      b.vertical,
      b.geography,
      f.question,
      COUNT(*) AS freq
    FROM businesses b
    JOIN faq_usage f ON f.business_id = b.id
    WHERE b.opt_out_benchmarks = 0
      AND f.created_at >= ?
      AND f.created_at <= ?
    GROUP BY b.vertical, b.geography, f.question
  `;

  const faqRows = await env.DB.prepare(faqQuery)
    .bind(periodStart, periodEnd + 'T23:59:59Z')
    .all();

  const faqMap: Record<string, Array<{ question: string; freq: number }>> = {};
  if (faqRows.results) {
    for (const row of faqRows.results) {
      const key = `${row.vertical}::${row.geography}`;
      if (!faqMap[key]) faqMap[key] = [];
      faqMap[key].push({ question: String(row.question), freq: Number(row.freq) });
    }
  }

  if (metrics.results) {
    for (const row of metrics.results) {
      const key = `${row.vertical}::${row.geography}`;
      const top = (faqMap[key] || [])
        .sort((a, b) => b.freq - a.freq)
        .slice(0, 5)
        .map((x) => x.question);

      await env.DB.prepare(
        `INSERT INTO benchmark_aggregates (
          vertical, geography, period_start, period_end,
          business_count, avg_questions_answered,
          p50_response_time, p90_response_time, top_faq_patterns
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          row.vertical,
          row.geography,
          periodStart,
          periodEnd,
          row.business_count,
          row.avg_questions_answered,
          row.p50_response_time,
          row.p90_response_time,
          JSON.stringify(top)
        )
        .run();
    }
  }

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 84);
  await env.DB.prepare(
    'DELETE FROM benchmark_aggregates WHERE period_end < ?'
  )
    .bind(cutoff.toISOString().split('T')[0])
    .run();
}
