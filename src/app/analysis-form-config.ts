import { z } from "zod"
import type { RawMeasurementId } from "@/analysis/features/raw-measurements"
import { type ModelId, models } from "@/analysis/models"
import { analyzeFace } from "@/analysis/pipeline/analyze-face"
import type { MetricId } from "@/analysis/types/metric"
import type { ChartConfig } from "@/components/ui/chart"

export type StepId =
  | "profile"
  | "global_proportions"
  | "eye_area"
  | "midface"
  | "nasal_region"
  | "jaw_structure"
  | "qualitative"
  | "results"

export type RawStep = Exclude<StepId, "profile" | "qualitative" | "results">

export type RawField = {
  id: RawMeasurementId
  key: string
  label: string
  unit: "px" | "deg"
  step: RawStep
  hint: string
}

export const STEP_ORDER: StepId[] = [
  "profile",
  "global_proportions",
  "eye_area",
  "midface",
  "nasal_region",
  "jaw_structure",
  "qualitative",
  "results",
]

export const RAW_STEPS: RawStep[] = [
  "global_proportions",
  "eye_area",
  "midface",
  "nasal_region",
  "jaw_structure",
]

export const STEP_META: Record<StepId, { label: string; description: string }> = {
  profile: {
    label: "Perfil",
    description: "Informações da pessoa e configurações da sessão",
  },
  global_proportions: {
    label: "Harmonia / Proporções Globais",
    description: "Medidas centrais da face e terços faciais",
  },
  eye_area: {
    label: "Harmonia / Área Ocular",
    description: "Olhos e sobrancelhas para estrutura orbital",
  },
  midface: {
    label: "Harmonia / Midface",
    description: "Largura zigomática e equilíbrio de terço médio",
  },
  nasal_region: {
    label: "Harmonia / Área Nasal",
    description: "Ângulos nasais e relação com boca",
  },
  jaw_structure: {
    label: "Angularidade / Mandíbula",
    description: "Mandíbula, pescoço e proporções do perfil",
  },
  qualitative: {
    label: "Qualidades Gerais",
    description: "Dados não numéricos de estrutura ocular e qualidades",
  },
  results: {
    label: "Resultados",
    description: "Painel completo, pontos fortes, fracos e cobertura",
  },
}

export const RAW_FIELDS: RawField[] = [
  {
    id: "face.height",
    key: "face_height",
    label: "Altura total da face",
    unit: "px",
    step: "global_proportions",
    hint: "Distância vertical do topo da testa ao mento.",
  },
  {
    id: "face.width",
    key: "face_width",
    label: "Largura total da face",
    unit: "px",
    step: "global_proportions",
    hint: "Largura bizigomática geral.",
  },
  {
    id: "face.upper_third_height",
    key: "face_upper_third_height",
    label: "Altura do terço superior",
    unit: "px",
    step: "global_proportions",
    hint: "Linha capilar até glabela.",
  },
  {
    id: "face.mid_third_height",
    key: "face_mid_third_height",
    label: "Altura do terço médio",
    unit: "px",
    step: "global_proportions",
    hint: "Glabela até base nasal.",
  },
  {
    id: "face.lower_third_height",
    key: "face_lower_third_height",
    label: "Altura do terço inferior",
    unit: "px",
    step: "global_proportions",
    hint: "Base nasal até mento.",
  },
  {
    id: "face.projection",
    key: "face_projection",
    label: "Projeção facial",
    unit: "px",
    step: "global_proportions",
    hint: "Distância antero-posterior da projeção facial.",
  },
  {
    id: "face.convexity_angle",
    key: "face_convexity_angle",
    label: "Ângulo de convexidade",
    unit: "deg",
    step: "global_proportions",
    hint: "Ângulo de convexidade do perfil lateral.",
  },
  {
    id: "eyes.left_center_x",
    key: "eyes_left_center_x",
    label: "Centro horizontal do olho esquerdo",
    unit: "px",
    step: "eye_area",
    hint: "Coordenada X do centro pupilar esquerdo.",
  },
  {
    id: "eyes.right_center_x",
    key: "eyes_right_center_x",
    label: "Centro horizontal do olho direito",
    unit: "px",
    step: "eye_area",
    hint: "Coordenada X do centro pupilar direito.",
  },
  {
    id: "eyes.left_width",
    key: "eyes_left_width",
    label: "Largura do olho esquerdo",
    unit: "px",
    step: "eye_area",
    hint: "Comissura externa e interna do olho esquerdo.",
  },
  {
    id: "eyes.left_height",
    key: "eyes_left_height",
    label: "Altura do olho esquerdo",
    unit: "px",
    step: "eye_area",
    hint: "Abertura palpebral vertical do olho esquerdo.",
  },
  {
    id: "eyes.right_width",
    key: "eyes_right_width",
    label: "Largura do olho direito",
    unit: "px",
    step: "eye_area",
    hint: "Comissura externa e interna do olho direito.",
  },
  {
    id: "eyes.right_height",
    key: "eyes_right_height",
    label: "Altura do olho direito",
    unit: "px",
    step: "eye_area",
    hint: "Abertura palpebral vertical do olho direito.",
  },
  {
    id: "eyes.tilt_angle",
    key: "eyes_tilt_angle",
    label: "Inclinação dos olhos",
    unit: "deg",
    step: "eye_area",
    hint: "Inclinação da linha entre os cantos palpebrais.",
  },
  {
    id: "eyes.outer_left_x",
    key: "eyes_outer_left_x",
    label: "Canto externo esquerdo (X)",
    unit: "px",
    step: "eye_area",
    hint: "Coordenada X do canto lateral esquerdo.",
  },
  {
    id: "eyes.outer_right_x",
    key: "eyes_outer_right_x",
    label: "Canto externo direito (X)",
    unit: "px",
    step: "eye_area",
    hint: "Coordenada X do canto lateral direito.",
  },
  {
    id: "brows.left_inner_y",
    key: "brows_left_inner_y",
    label: "Sobrancelha interna esquerda (Y)",
    unit: "px",
    step: "eye_area",
    hint: "Ponto vertical interno da sobrancelha esquerda.",
  },
  {
    id: "brows.right_inner_y",
    key: "brows_right_inner_y",
    label: "Sobrancelha interna direita (Y)",
    unit: "px",
    step: "eye_area",
    hint: "Ponto vertical interno da sobrancelha direita.",
  },
  {
    id: "brows.left_outer_y",
    key: "brows_left_outer_y",
    label: "Sobrancelha externa esquerda (Y)",
    unit: "px",
    step: "eye_area",
    hint: "Ponto vertical externo da sobrancelha esquerda.",
  },
  {
    id: "brows.right_outer_y",
    key: "brows_right_outer_y",
    label: "Sobrancelha externa direita (Y)",
    unit: "px",
    step: "eye_area",
    hint: "Ponto vertical externo da sobrancelha direita.",
  },
  {
    id: "brows.tilt_angle",
    key: "brows_tilt_angle",
    label: "Inclinação das sobrancelhas",
    unit: "deg",
    step: "eye_area",
    hint: "Inclinação média das sobrancelhas.",
  },
  {
    id: "midface.height",
    key: "midface_height",
    label: "Altura da midface",
    unit: "px",
    step: "midface",
    hint: "Altura total do terço medio.",
  },
  {
    id: "midface.width",
    key: "midface_width",
    label: "Largura da midface",
    unit: "px",
    step: "midface",
    hint: "Largura no nível zigomático médio.",
  },
  {
    id: "zygoma.width",
    key: "zygoma_width",
    label: "Largura zigomática",
    unit: "px",
    step: "midface",
    hint: "Distancia entre os arcos zigomáticos.",
  },
  {
    id: "cheekbone.height",
    key: "cheekbone_height",
    label: "Altura do cheekbone",
    unit: "px",
    step: "midface",
    hint: "Altura do ponto malar em relação a face.",
  },
  {
    id: "nose.width",
    key: "nose_width",
    label: "Largura nasal",
    unit: "px",
    step: "nasal_region",
    hint: "Largura alar no ponto mais externo.",
  },
  {
    id: "nose.nasofrontal_angle",
    key: "nose_nasofrontal_angle",
    label: "Ângulo nasofrontal",
    unit: "deg",
    step: "nasal_region",
    hint: "Transição testa-nariz no perfil.",
  },
  {
    id: "nose.nasolabial_angle",
    key: "nose_nasolabial_angle",
    label: "Ângulo nasolabial",
    unit: "deg",
    step: "nasal_region",
    hint: "Relação entre columela e lábio superior.",
  },
  {
    id: "mouth.width",
    key: "mouth_width",
    label: "Largura da boca",
    unit: "px",
    step: "nasal_region",
    hint: "Comissura labial esquerda até direita.",
  },
  {
    id: "jaw.width",
    key: "jaw_width",
    label: "Largura da mandíbula",
    unit: "px",
    step: "jaw_structure",
    hint: "Largura bicondilar ou bi-gonial usada no método.",
  },
  {
    id: "jaw.left_third_width",
    key: "jaw_left_third_width",
    label: "Largura do terço esquerdo da mandíbula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisão esquerda da base mandibular.",
  },
  {
    id: "jaw.center_third_width",
    key: "jaw_center_third_width",
    label: "Largura do terço central da mandíbula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisão central da base mandibular.",
  },
  {
    id: "jaw.right_third_width",
    key: "jaw_right_third_width",
    label: "Largura do terçço direito da mandíbula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisão direita da base mandibular.",
  },
  {
    id: "jaw.angle",
    key: "jaw_angle",
    label: "Ângulo mandibular",
    unit: "deg",
    step: "jaw_structure",
    hint: "Ângulo geral da linha mandibular.",
  },
  {
    id: "jaw.gonial_angle",
    key: "jaw_gonial_angle",
    label: "Ângulo gonial",
    unit: "deg",
    step: "jaw_structure",
    hint: "Ângulo gonial clássico.",
  },
  {
    id: "jaw.mandibular_plane_angle",
    key: "jaw_mandibular_plane_angle",
    label: "Ângulo do plano mandibular",
    unit: "deg",
    step: "jaw_structure",
    hint: "Inclinção do plano mandibular.",
  },
  {
    id: "jaw.ramus_length",
    key: "jaw_ramus_length",
    label: "Comprimento do ramo mandibular",
    unit: "px",
    step: "jaw_structure",
    hint: "Extensão vertical do ramo.",
  },
  {
    id: "chin.height",
    key: "chin_height",
    label: "Altura do mento",
    unit: "px",
    step: "jaw_structure",
    hint: "Altura do segmento mentoniano.",
  },
  {
    id: "philtrum.height",
    key: "philtrum_height",
    label: "Altura do filtro",
    unit: "px",
    step: "jaw_structure",
    hint: "Distância subnasal até labio superior.",
  },
  {
    id: "neck.width",
    key: "neck_width",
    label: "Largura do pescoco",
    unit: "px",
    step: "jaw_structure",
    hint: "Largura transversal do pescoco.",
  },
  {
    id: "profile.cervicomental_angle",
    key: "profile_cervicomental_angle",
    label: "Ângulo cervicomental",
    unit: "deg",
    step: "jaw_structure",
    hint: "Ângulo entre mento e linha cervical.",
  },
]

const rawShape = Object.fromEntries(
  RAW_FIELDS.map((field) => [
    field.key,
    z.coerce.number().positive("Informe um valor maior que zero."),
  ]),
) as Record<string, z.ZodTypeAny>

export type ModelVariant = {
  id: ModelId
  ethnicity: string
  sex: string
}

function parseModelVariant(modelId: ModelId): ModelVariant | null {
  const separator = modelId.lastIndexOf("_")

  if (separator <= 0 || separator === modelId.length - 1) {
    return null
  }

  return {
    id: modelId,
    ethnicity: modelId.slice(0, separator),
    sex: modelId.slice(separator + 1),
  }
}

export const MODEL_VARIANTS = (Object.keys(models) as ModelId[])
  .map(parseModelVariant)
  .filter((variant): variant is ModelVariant => variant !== null)

if (MODEL_VARIANTS.length === 0) {
  throw new Error("Modelo não encontrado.")
}

export const DEFAULT_MODEL = MODEL_VARIANTS[0]
export const AVAILABLE_MODEL_IDS = MODEL_VARIANTS.map((variant) => variant.id)
export const AVAILABLE_SEXES = Array.from(
  new Set(MODEL_VARIANTS.map((variant) => variant.sex)),
)

export function resolveModelId(ethnicity: string, sex: string): ModelId | null {
  const modelId = `${ethnicity}_${sex}` as ModelId

  return modelId in models ? modelId : null
}

export const schema = z.object({
  subjectName: z.string().min(2, "Use pelo menos 2 caracteres."),
  sex: z.string().min(1, "Selecione um sexo."),
  ethnicity: z.string().min(1, "Selecione um modelo/etnia."),
  sessionCode: z.string().max(6),
  showHints: z.boolean(),
  compactGrid: z.boolean(),
  highBrows: z.boolean(),
  orbitalVector: z.enum(["positive", "neutral", "negative"]),
  skinQuality: z.enum(["poor", "fair", "good", "excellent"]),
  overallSymmetry: z.enum(["low", "moderate", "high", "exceptional"]),
  fatLevel: z.enum(["high", "moderate", "lean", "very_lean"]),
  expressionTone: z.enum(["strong_lines", "mild_lines", "no_lines"]),
  raw: z.object(rawShape),
})

export type FormData = z.infer<typeof schema>
export type AnalysisResult = ReturnType<typeof analyzeFace>

export const pillarChartConfig = {
  score: { label: "Nota", color: "var(--chart-2)" },
  max: { label: "Meta", color: "var(--chart-5)" },
} satisfies ChartConfig

export const groupChartConfig = {
  score: { label: "Nota", color: "var(--chart-3)" },
} satisfies ChartConfig

export const radialChartConfig = {
  achieved: { label: "Nota atual", color: "var(--chart-2)" },
  remaining: { label: "Distância para 10", color: "var(--chart-5)" },
} satisfies ChartConfig

export function humanizeKey(value: string) {
  return value
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function formatMetricLabel(metricId: string) {
  const special: Partial<Record<MetricId, string>> = {
    "face.height_to_width_ratio": "Face height/width",
    "face.projection_to_height_ratio": "Projection/height",
    "eyes.interpupillary_distance": "Interpupillary distance",
    "eyes.spacing_ratio": "Eye spacing ratio",
    "eyes.width_to_height_ratio": "Eye width/height",
    "midface.zygoma_width_to_height_ratio": "Zygoma width/height",
    "jaw.width_to_zygoma_ratio": "Jaw/zygoma ratio",
    "jaw.width_to_neck_ratio": "Jaw/neck ratio",
    "profile.chin_to_philtrum_ratio": "Chin/philtrum ratio",
    "skin.quality": "Skin quality",
    "symmetry.overall": "Overall symmetry",
    "fat.level": "Body fat level",
    "expression.neutrality": "Expression quality",
  }

  return special[metricId as MetricId] ?? humanizeKey(metricId)
}
