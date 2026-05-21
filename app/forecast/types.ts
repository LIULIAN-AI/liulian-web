/**
 * Types mirroring liulian-api Pydantic models. Day 2: hand-written.
 * Day 3 swap: `pnpm gen:api` codegens from /api/openapi.json so this
 * file becomes the source of truth for the API contract.
 */

export type ForecastSeries = {
  id: string;
  model_id: string;
  dataset_id: string;
  station_id: string;
  horizon_hours: number;
  forecast_at: string; // ISO 8601
  timestamps: string[];
  observed: (number | null)[];
  mean: number[];
  q05: number[];
  q95: number[];
  units: string;
  real_data?: boolean;
};

export type StationCard = {
  id: string;
  label: string;
  field: string;
  unit: string;
  n_observations: number;
  span_start: string;
  span_end: string;
  latest_value: number | null;
  delta_7d: number | null;
};

export type TimeseriesPoint = { t: string; v: number | null };
export type TimeseriesResponse = {
  dataset_id: string;
  station_id: string;
  field: string;
  unit: string;
  points: TimeseriesPoint[];
};

export type Station = {
  id: string;
  name: string;
  basin?: string;
  river?: string;
  has_active_forecast?: boolean;
};

export type ModelCard = {
  id: string;
  name: string;
  family: string;
  capabilities: string[];
  source: string;
  parameters_M?: number;
  paper_url?: string;
};

export type ExperimentStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'aborted';

export type Experiment = {
  id: string;
  tenant_id: string;
  name: string;
  model_id: string;
  dataset_id: string;
  config_yaml: string | null;
  status: ExperimentStatus;
  liulian_version: string;
  created_at: string;
  completed_at: string | null;
};
