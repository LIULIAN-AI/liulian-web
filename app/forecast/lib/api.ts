/** Thin liulian-api client. Server-side fetch; no client-side base URL leakage. */

import type { ForecastSeries, ModelCard, Experiment } from '../types';

const BASE = process.env.LIULIAN_API_URL ?? 'http://localhost:8000';

type Page<T> = { items: T[]; total: number; page: number; page_size: number };

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const qs = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const r = await fetch(`${BASE}${path}${qs}`, { next: { revalidate: 30 } });
  if (!r.ok) throw new Error(`api ${path} failed: ${r.status}`);
  return (await r.json()) as T;
}

export const api = {
  forecasts: {
    list: (station_id?: string, model_id?: string) =>
      get<Page<ForecastSeries>>('/forecasts', { station_id, model_id }),
    byId: (id: string) => get<ForecastSeries>(`/forecasts/${id}`),
  },
  models: {
    list: (family?: string) => get<ModelCard[]>('/models', { family }),
    byId: (id: string) => get<ModelCard>(`/models/${id}`),
  },
  experiments: {
    list: (status?: string) => get<Page<Experiment>>('/experiments', { status }),
    byId: (id: string) => get<Experiment>(`/experiments/${id}`),
  },
};
