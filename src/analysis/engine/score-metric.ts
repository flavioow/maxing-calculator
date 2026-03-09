// Calcula o score de uma única métrica

import type { MeasurementValue } from "../types/input"
import type { Metric } from "../types/metric"

export function scoreMetric(
  metric: Metric,
  value: MeasurementValue
): number {
  switch (metric.type) {

    case "range": {
      if (typeof value !== "number") return 0

      if (value >= metric.idealMin && value <= metric.idealMax) return 10

      const distance = Math.min(
        Math.abs(value - metric.idealMin),
        Math.abs(value - metric.idealMax)
      )

      return Math.max(0, 10 - distance * 10)
    }

    case "target": {
      if (typeof value !== "number") return 0

      const error = Math.abs(value - metric.ideal)
      return Math.max(0, 10 - error / metric.tolerance * 10)
    }

    case "min": {
      if (typeof value !== "number") return 0

      if (value >= metric.min) return 10
      return Math.max(0, 10 - (metric.min - value) * 10)
    }

    case "boolean": {
      if (typeof value !== "boolean") return 0

      return value ? metric.trueScore : metric.falseScore
    }

    case "categorical": {
      if (typeof value !== "string") return 0

      return metric.scores[value] ?? 0
    }
  }
}
