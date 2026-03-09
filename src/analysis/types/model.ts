/*  Descreve um modelo completo de avaliação
  ex: caucasian male, caucasian female, asian male */

import type { Metric } from "./metric"

export type PillarId =
  | "harmony"
  | "angularity"
  | "dimorphism"
  | "qualities"

export interface MetricGroup {
  id: string
  weight: number
  metrics: Metric[]
}

export interface Pillar {
  id: PillarId
  weight: number
  groups: MetricGroup[]
}

export interface Model {
  id: string
  pillars: Pillar[]
}
