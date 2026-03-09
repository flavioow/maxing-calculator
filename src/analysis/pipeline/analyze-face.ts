import { scoreModel } from "../engine/score-model"
import { computeMetrics } from "../features/compute-metrics"
import type { RawMeasurements } from "../features/raw-measurements"
import { type ModelId, models } from "../models"
import type { MeasurementInput } from "../types/input"

export function analyzeFace(
  raw: RawMeasurements,
  extraMetrics: MeasurementInput = {},
  modelId: ModelId = "caucasian_male",
) {
  const computedMetrics = computeMetrics(raw)

  const metrics: MeasurementInput = {
    ...computedMetrics,
    ...extraMetrics,
  }

  const model = models[modelId]
  const result = scoreModel(model, metrics)

  return {
    modelId,
    model,
    metrics,
    result,
  }
}
