/*  Define o que é uma métrica
  1. padroniza como são descritas
  2. define os tipos possíveis de métrica
  3. garante type safety nos modelos */

export type MetricType = "range" | "target" | "min" | "boolean" | "categorical"

export type MetricId =
  // face
  | "face.upper_third_height"
  | "face.mid_third_height"
  | "face.lower_third_height"
  | "face.height_to_width_ratio"
  | "face.projection_to_height_ratio"
  | "face.convexity"
  // eyes
  | "eyes.interpupillary_distance"
  | "eyes.spacing_ratio"
  | "eyes.width_to_height_ratio"
  | "eyes.tilt"
  | "eyes.orbital_vector"
  // brows
  | "brows.tilt"
  | "brows.height"
  // midface
  | "midface.ratio"
  | "midface.width_to_height_ratio"
  | "midface.fwhr"
  | "midface.zygoma_width_to_height_ratio"
  | "midface.cheekbone_height"
  // jaw
  | "jaw.width_to_zygoma_ratio"
  | "jaw.width_to_neck_ratio"
  | "jaw.angle"
  | "jaw.left_third_width"
  | "jaw.center_third_width"
  | "jaw.right_third_width"
  | "jaw.gonial_angle"
  | "jaw.mandibular_plane_angle"
  | "jaw.ramus_length"
  // nose
  | "nose.nasofrontal_angle"
  | "nose.nasolabial_angle"
  // profile
  | "profile.chin_to_philtrum_ratio"
  | "profile.cervicomental_angle"
  // qualities
  | "skin.quality"
  | "symmetry.overall"
  | "fat.level"
  | "expression.neutrality"

export interface MetricBase {
  id: MetricId
  weight: number
  type: MetricType
}

export interface RangeMetric extends MetricBase {
  type: "range"
  idealMin: number
  idealMax: number
  tolerance?: number
}

export interface TargetMetric extends MetricBase {
  type: "target"
  ideal: number
  tolerance: number
}

export interface MinMetric extends MetricBase {
  type: "min"
  min: number
}

export interface BooleanMetric extends MetricBase {
  type: "boolean"
  trueScore: number
  falseScore: number
}

export interface CategoricalMetric extends MetricBase {
  type: "categorical"
  scores: Record<string, number>
}

export type Metric =
  | RangeMetric
  | TargetMetric
  | MinMetric
  | BooleanMetric
  | CategoricalMetric
