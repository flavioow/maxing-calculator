// métricas -> score ponderado do grupo

import type { MeasurementInput } from "../types/input"
import type { MetricGroup } from "../types/model"
import { scoreMetric } from "./score-metric"

export function scoreGroup(
  group: MetricGroup,
  inputs: MeasurementInput
) {
  let totalWeight = 0
  let weightedScore = 0

  const metricScores: Record<string, number> = {}

  for (const metric of group.metrics) {
    const value = inputs[metric.id]

    if (value === undefined) continue

    const score = scoreMetric(metric, value)

    metricScores[metric.id] = score

    weightedScore += score * metric.weight
    totalWeight += metric.weight
  }

  const groupScore = totalWeight > 0 ? weightedScore / totalWeight : 0

  return {
    groupScore,
    metricScores
  }
}
