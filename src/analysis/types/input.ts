/*  Descreve o que o usuário envia */

import type { MetricId } from "./metric"

export type MeasurementValue =
  | number
  | boolean
  | string

export type MeasurementInput = Partial<
  Record<MetricId, MeasurementValue>
>

export interface ScoreResult {
  finalScore: number

  pillarScores: Record<string, number>

  groupScores: Record<string, number>

  metricScores: Record<string, number>
}
