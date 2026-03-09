// groupos -> score ponderado do pilar

import type { MeasurementInput } from "../types/input"
import type { Pillar } from "../types/model"
import { scoreGroup } from "./score-groups"

export function scorePillar(
  pillar: Pillar,
  inputs: MeasurementInput
) {
  let totalWeight = 0
  let weightedScore = 0

  const groupScores: Record<string, number> = {}
  const metricScores: Record<string, number> = {}

  for (const group of pillar.groups) {
    const result = scoreGroup(group, inputs)

    groupScores[group.id] = result.groupScore

    Object.assign(metricScores, result.metricScores)

    weightedScore += result.groupScore * group.weight
    totalWeight += group.weight
  }

  const pillarScore =
    totalWeight > 0 ? weightedScore / totalWeight : 0

  return {
    pillarScore,
    groupScores,
    metricScores
  }
}
