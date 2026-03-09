// modelo + inputs -> scoreResult

import type { MeasurementInput } from "../types/input"
import type { Model } from "../types/model"
import { scorePillar } from "./score-pillar"

export function scoreModel(
  model: Model,
  inputs: MeasurementInput
) {
  let totalWeight = 0
  let weightedScore = 0

  const pillarScores: Record<string, number> = {}
  const groupScores: Record<string, number> = {}
  const metricScores: Record<string, number> = {}

  for (const pillar of model.pillars) {
    const result = scorePillar(pillar, inputs)

    pillarScores[pillar.id] = result.pillarScore

    Object.assign(groupScores, result.groupScores)
    Object.assign(metricScores, result.metricScores)

    weightedScore += result.pillarScore * pillar.weight
    totalWeight += pillar.weight
  }

  const finalScore =
    totalWeight > 0 ? weightedScore / totalWeight : 0

  return {
    finalScore,
    pillarScores,
    groupScores,
    metricScores
  }
}
