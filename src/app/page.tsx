"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Label as RechartsLabel,
  XAxis,
} from "recharts"
import { z } from "zod"
import type { RawMeasurementId } from "@/analysis/features/raw-measurements"
import { type ModelId, models } from "@/analysis/models"
import { analyzeFace } from "@/analysis/pipeline/analyze-face"
import type { MeasurementInput } from "@/analysis/types/input"
import type { MetricId } from "@/analysis/types/metric"
import { Button } from "@/components/ui/button"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type StepId =
  | "profile"
  | "global_proportions"
  | "eye_area"
  | "midface"
  | "nasal_region"
  | "jaw_structure"
  | "qualitative"
  | "results"

type RawStep = Exclude<StepId, "profile" | "qualitative" | "results">

type RawField = {
  id: RawMeasurementId
  key: string
  label: string
  unit: "px" | "deg"
  step: RawStep
  hint: string
}

const STEP_ORDER: StepId[] = [
  "profile",
  "global_proportions",
  "eye_area",
  "midface",
  "nasal_region",
  "jaw_structure",
  "qualitative",
  "results",
]

const STEP_META: Record<StepId, { label: string; description: string }> = {
  profile: {
    label: "Perfil",
    description: "Informacoes da pessoa e configuracoes da sessao",
  },
  global_proportions: {
    label: "Harmonia / Proporcoes Globais",
    description: "Medidas centrais da face e tercios faciais",
  },
  eye_area: {
    label: "Harmonia / Eye Area",
    description: "Olhos e sobrancelhas para estrutura orbital",
  },
  midface: {
    label: "Harmonia / Midface",
    description: "Largura zigomatica e equilibrio de terco medio",
  },
  nasal_region: {
    label: "Harmonia / Nasal Region",
    description: "Angulos nasais e relacao com boca",
  },
  jaw_structure: {
    label: "Angularity / Jaw",
    description: "Mandibula, pescoco e proporcoes do perfil",
  },
  qualitative: {
    label: "Qualidades Gerais",
    description: "Inputs nao numericos de estrutura ocular e qualidades",
  },
  results: {
    label: "Resultados",
    description: "Painel completo, pontos fortes, fracos e cobertura",
  },
}

const RAW_FIELDS: RawField[] = [
  {
    id: "face.height",
    key: "face_height",
    label: "Altura total da face",
    unit: "px",
    step: "global_proportions",
    hint: "Distancia vertical do topo da testa ao mento.",
  },
  {
    id: "face.width",
    key: "face_width",
    label: "Largura total da face",
    unit: "px",
    step: "global_proportions",
    hint: "Largura bizigomatica geral.",
  },
  {
    id: "face.upper_third_height",
    key: "face_upper_third_height",
    label: "Altura do terco superior",
    unit: "px",
    step: "global_proportions",
    hint: "Linha capilar ate glabela.",
  },
  {
    id: "face.mid_third_height",
    key: "face_mid_third_height",
    label: "Altura do terco medio",
    unit: "px",
    step: "global_proportions",
    hint: "Glabela ate base nasal.",
  },
  {
    id: "face.lower_third_height",
    key: "face_lower_third_height",
    label: "Altura do terco inferior",
    unit: "px",
    step: "global_proportions",
    hint: "Base nasal ate mento.",
  },
  {
    id: "face.projection",
    key: "face_projection",
    label: "Projecao facial",
    unit: "px",
    step: "global_proportions",
    hint: "Distancia antero-posterior da projecao facial.",
  },
  {
    id: "face.convexity_angle",
    key: "face_convexity_angle",
    label: "Angulo de convexidade",
    unit: "deg",
    step: "global_proportions",
    hint: "Angulo de convexidade do perfil lateral.",
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
    label: "Tilt dos olhos",
    unit: "deg",
    step: "eye_area",
    hint: "Inclinacao da linha entre os cantos palpebrais.",
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
    label: "Tilt das sobrancelhas",
    unit: "deg",
    step: "eye_area",
    hint: "Inclinacao media das sobrancelhas.",
  },
  {
    id: "midface.height",
    key: "midface_height",
    label: "Altura da midface",
    unit: "px",
    step: "midface",
    hint: "Altura total do terco medio.",
  },
  {
    id: "midface.width",
    key: "midface_width",
    label: "Largura da midface",
    unit: "px",
    step: "midface",
    hint: "Largura no nivel zigomatico medio.",
  },
  {
    id: "zygoma.width",
    key: "zygoma_width",
    label: "Largura zigomatica",
    unit: "px",
    step: "midface",
    hint: "Distancia entre os arcos zigomaticos.",
  },
  {
    id: "cheekbone.height",
    key: "cheekbone_height",
    label: "Altura do cheekbone",
    unit: "px",
    step: "midface",
    hint: "Altura do ponto malar em relacao a face.",
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
    label: "Angulo nasofrontal",
    unit: "deg",
    step: "nasal_region",
    hint: "Transicao testa-nariz no perfil.",
  },
  {
    id: "nose.nasolabial_angle",
    key: "nose_nasolabial_angle",
    label: "Angulo nasolabial",
    unit: "deg",
    step: "nasal_region",
    hint: "Relacao entre columela e labio superior.",
  },
  {
    id: "mouth.width",
    key: "mouth_width",
    label: "Largura da boca",
    unit: "px",
    step: "nasal_region",
    hint: "Comissura labial esquerda ate direita.",
  },
  {
    id: "jaw.width",
    key: "jaw_width",
    label: "Largura da mandibula",
    unit: "px",
    step: "jaw_structure",
    hint: "Largura bicondilar ou bi-gonial usada no metodo.",
  },
  {
    id: "jaw.left_third_width",
    key: "jaw_left_third_width",
    label: "Largura do terco esquerdo da mandibula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisao esquerda da base mandibular.",
  },
  {
    id: "jaw.center_third_width",
    key: "jaw_center_third_width",
    label: "Largura do terco central da mandibula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisao central da base mandibular.",
  },
  {
    id: "jaw.right_third_width",
    key: "jaw_right_third_width",
    label: "Largura do terco direito da mandibula",
    unit: "px",
    step: "jaw_structure",
    hint: "Subdivisao direita da base mandibular.",
  },
  {
    id: "jaw.angle",
    key: "jaw_angle",
    label: "Angulo mandibular",
    unit: "deg",
    step: "jaw_structure",
    hint: "Angulo geral da linha mandibular.",
  },
  {
    id: "jaw.gonial_angle",
    key: "jaw_gonial_angle",
    label: "Angulo gonial",
    unit: "deg",
    step: "jaw_structure",
    hint: "Angulo gonial classico.",
  },
  {
    id: "jaw.mandibular_plane_angle",
    key: "jaw_mandibular_plane_angle",
    label: "Angulo do plano mandibular",
    unit: "deg",
    step: "jaw_structure",
    hint: "Inclincao do plano mandibular.",
  },
  {
    id: "jaw.ramus_length",
    key: "jaw_ramus_length",
    label: "Comprimento do ramo mandibular",
    unit: "px",
    step: "jaw_structure",
    hint: "Extensao vertical do ramo.",
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
    hint: "Distancia subnasal ate labio superior.",
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
    label: "Angulo cervicomental",
    unit: "deg",
    step: "jaw_structure",
    hint: "Angulo entre mento e linha cervical.",
  },
]

const rawShape = Object.fromEntries(
  RAW_FIELDS.map((field) => [
    field.key,
    z.coerce.number().positive("Informe um valor maior que zero."),
  ]),
) as Record<string, z.ZodTypeAny>

type ModelVariant = {
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

const MODEL_VARIANTS = (Object.keys(models) as ModelId[])
  .map(parseModelVariant)
  .filter((variant): variant is ModelVariant => variant !== null)

if (MODEL_VARIANTS.length === 0) {
  throw new Error("Nenhum modelo encontrado em analysis/models/index.ts.")
}

const DEFAULT_MODEL = MODEL_VARIANTS[0]
const AVAILABLE_MODEL_IDS = MODEL_VARIANTS.map((variant) => variant.id)
const AVAILABLE_SEXES = Array.from(
  new Set(MODEL_VARIANTS.map((variant) => variant.sex)),
)

function resolveModelId(ethnicity: string, sex: string): ModelId | null {
  const modelId = `${ethnicity}_${sex}` as ModelId

  return modelId in models ? modelId : null
}

const schema = z.object({
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
  expressionTone: z.enum(["tense", "neutral", "positive"]),
  raw: z.object(rawShape),
})

type FormData = z.infer<typeof schema>

const pillarChartConfig = {
  score: { label: "Score", color: "var(--chart-2)" },
  max: { label: "Meta", color: "var(--chart-5)" },
} satisfies ChartConfig

const groupChartConfig = {
  score: { label: "Score", color: "var(--chart-3)" },
} satisfies ChartConfig

const radialChartConfig = {
  achieved: { label: "Score atual", color: "var(--chart-2)" },
  remaining: { label: "Distancia para 10", color: "var(--chart-5)" },
} satisfies ChartConfig

function humanizeKey(value: string) {
  return value
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function formatMetricLabel(metricId: string) {
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

export default function Page() {
  const [activeStep, setActiveStep] = useState<StepId>("profile")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ReturnType<
    typeof analyzeFace
  > | null>(null)

  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectName: "",
      sex: DEFAULT_MODEL.sex,
      ethnicity: DEFAULT_MODEL.ethnicity,
      sessionCode: "",
      showHints: true,
      compactGrid: false,
      highBrows: true,
      orbitalVector: "positive",
      skinQuality: "good",
      overallSymmetry: "high",
      fatLevel: "lean",
      expressionTone: "positive",
    },
  })

  const currentStepIndex = STEP_ORDER.indexOf(activeStep)
  const lastInputStep = STEP_ORDER[STEP_ORDER.length - 2]
  const sex = watch("sex")
  const ethnicity = watch("ethnicity")
  const showHints = watch("showHints")
  const compactGrid = watch("compactGrid")
  const sessionCode = watch("sessionCode")
  const orbitalVector = watch("orbitalVector")
  const highBrows = watch("highBrows")
  const skinQuality = watch("skinQuality")
  const overallSymmetry = watch("overallSymmetry")
  const fatLevel = watch("fatLevel")
  const expressionTone = watch("expressionTone")
  const rawValues = watch("raw")

  const availableEthnicitiesForSex = useMemo(() => {
    const options = MODEL_VARIANTS.filter((variant) => variant.sex === sex).map(
      (variant) => variant.ethnicity,
    )
    return Array.from(new Set(options))
  }, [sex])

  useEffect(() => {
    if (availableEthnicitiesForSex.length === 0) return

    if (!availableEthnicitiesForSex.includes(ethnicity)) {
      setValue("ethnicity", availableEthnicitiesForSex[0], {
        shouldDirty: true,
      })
    }
  }, [availableEthnicitiesForSex, ethnicity, setValue])

  const selectedModelId = resolveModelId(ethnicity, sex)
  const selectedModel = selectedModelId ? models[selectedModelId] : null
  const modelAvailable = selectedModel !== null
  const analysisModel = analysisResult?.model ?? selectedModel

  const rawErrors =
    (errors.raw as Record<string, { message?: string } | undefined>) ?? {}

  const rawByStep = useMemo(() => {
    const grouped: Record<RawStep, RawField[]> = {
      global_proportions: [],
      eye_area: [],
      midface: [],
      nasal_region: [],
      jaw_structure: [],
    }

    for (const field of RAW_FIELDS) {
      grouped[field.step].push(field)
    }

    return grouped
  }, [])

  const totalModelMetrics = useMemo(() => {
    if (!analysisModel) return 0

    return analysisModel.pillars.reduce((acc, pillar) => {
      const groupMetrics = pillar.groups.reduce(
        (groupAcc, group) => groupAcc + group.metrics.length,
        0,
      )
      return acc + groupMetrics
    }, 0)
  }, [analysisModel])

  const pillarScoreData = useMemo(() => {
    if (!analysisResult) return []

    return analysisResult.model.pillars.map((pillar) => ({
      pillar: humanizeKey(pillar.id),
      score: Number(
        (analysisResult.result.pillarScores[pillar.id] ?? 0).toFixed(2),
      ),
      max: 10,
    }))
  }, [analysisResult])

  const groupScoreData = useMemo(() => {
    if (!analysisResult) return []

    const orderedGroups = analysisResult.model.pillars.flatMap((pillar) =>
      pillar.groups.map((group) => group.id),
    )

    return orderedGroups.map((groupId) => ({
      group: humanizeKey(groupId),
      score: Number(
        (analysisResult.result.groupScores[groupId] ?? 0).toFixed(2),
      ),
    }))
  }, [analysisResult])

  const radialData = useMemo(() => {
    if (!analysisResult) return []

    const achieved = Number(analysisResult.result.finalScore.toFixed(2))
    const remaining = Number(Math.max(0, 10 - achieved).toFixed(2))

    return [
      {
        label: "final",
        achieved,
        remaining,
      },
    ]
  }, [analysisResult])

  const metricRanking = useMemo(() => {
    if (!analysisResult) return []

    return Object.entries(analysisResult.result.metricScores)
      .map(([metricId, score]) => ({
        metricId,
        label: formatMetricLabel(metricId),
        score: Number(score.toFixed(2)),
      }))
      .sort((a, b) => b.score - a.score)
  }, [analysisResult])

  const strengths = metricRanking.slice(0, 5)
  const weaknesses = [...metricRanking].reverse().slice(0, 5)

  const scoredMetricsCount = useMemo(() => {
    if (!analysisResult) return 0

    return analysisResult.model.pillars.reduce((pillarAcc, pillar) => {
      const coveredInPillar = pillar.groups.reduce((groupAcc, group) => {
        const coveredInGroup = group.metrics.filter(
          (metric) => analysisResult.metrics[metric.id] !== undefined,
        ).length
        return groupAcc + coveredInGroup
      }, 0)

      return pillarAcc + coveredInPillar
    }, 0)
  }, [analysisResult])

  function goNextStep() {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setActiveStep(STEP_ORDER[currentStepIndex + 1])
    }
  }

  function goPreviousStep() {
    if (currentStepIndex > 0) {
      setActiveStep(STEP_ORDER[currentStepIndex - 1])
    }
  }

  function countFilledFields(step: RawStep) {
    const fields = rawByStep[step]
    return fields.filter((field) => {
      const currentValue = rawValues?.[field.key]
      return (
        currentValue !== undefined &&
        currentValue !== null &&
        currentValue !== ""
      )
    }).length
  }

  function onSubmit(values: FormData) {
    const selectedModelId = resolveModelId(values.ethnicity, values.sex)

    if (!selectedModelId) {
      setAnalysisResult(null)
      setAnalysisError(
        `Modelo ${values.ethnicity}_${values.sex} nao encontrado. Registre o modelo em analysis/models/index.ts.`,
      )
      setActiveStep("results")
      return
    }

    const raw: Partial<Record<RawMeasurementId, number>> = {}

    for (const field of RAW_FIELDS) {
      raw[field.id] = values.raw[field.key]
    }

    const extraMetrics: MeasurementInput = {
      "brows.height": values.highBrows,
      "eyes.orbital_vector": values.orbitalVector,
      "skin.quality": values.skinQuality,
      "symmetry.overall": values.overallSymmetry,
      "fat.level": values.fatLevel,
      "expression.neutrality": values.expressionTone,
    }

    const analysis = analyzeFace(raw, extraMetrics, selectedModelId)

    setAnalysisError(null)
    setAnalysisResult(analysis)
    setActiveStep("results")
  }

  function renderRawStep(step: RawStep) {
    const fields = rawByStep[step]
    const filled = countFilledFields(step)

    return (
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Label className="text-base font-semibold text-foreground">
              {STEP_META[step].label}
            </Label>
            <p className="text-sm text-muted-foreground">
              {STEP_META[step].description}
            </p>
          </div>
          <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {filled}/{fields.length} campos preenchidos
          </div>
        </div>

        <Separator className="mb-4" />

        <FieldGroup
          className={cn(
            "grid gap-4",
            compactGrid ? "md:grid-cols-3" : "md:grid-cols-2",
          )}>
          {fields.map((field) => {
            const fieldPath = `raw.${field.key}` as const
            const fieldError = rawErrors[field.key]
            const stepAttr = field.unit === "deg" ? "0.1" : "0.01"

            return (
              <Field key={field.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-5 items-center justify-center rounded-full border border-border text-[11px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Ajuda para ${field.label}`}>
                        ?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{field.hint}</TooltipContent>
                  </Tooltip>
                </div>

                <InputGroup>
                  <InputGroupInput
                    id={field.key}
                    type="number"
                    step={stepAttr}
                    placeholder="0.00"
                    {...register(fieldPath)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{field.unit}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                {showHints && (
                  <FieldDescription>
                    ID bruto: <code>{field.id}</code>
                  </FieldDescription>
                )}

                <FieldError>{fieldError?.message}</FieldError>
              </Field>
            )
          })}
        </FieldGroup>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur">
          <Label className="mb-2 text-xs tracking-[0.16em] uppercase text-muted-foreground">
            Facial Analysis Workspace
          </Label>
          <h1 className="text-balance text-2xl font-semibold text-foreground md:text-3xl">
            Formulario completo por etapas para gerar analise facial
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Fluxo: perfil da pessoa, coleta bruta por grupos, ajustes
            qualitativos e painel final com score, cobertura e grafico.
          </p>
        </section>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5">
          <Tabs
            value={activeStep}
            onValueChange={(value) => setActiveStep(value as StepId)}
            className="gap-4">
            <div className="grid gap-2 rounded-xl border border-border bg-muted/40 p-2 sm:grid-cols-2 xl:grid-cols-4">
              {STEP_ORDER.map((step, index) => (
                <Button
                  key={step}
                  type="button"
                  variant={activeStep === step ? "default" : "outline"}
                  onClick={() => setActiveStep(step)}
                  className="h-auto justify-start px-3 py-2 text-left text-xs whitespace-normal md:text-sm">
                  {index + 1}. {STEP_META[step].label}
                </Button>
              ))}
            </div>

            <TabsContent
              value="profile"
              className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
                <FieldSet>
                  <FieldLegend variant="legend">
                    Dados basicos da avaliacao
                  </FieldLegend>

                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="subjectName">
                        Nome ou referencia
                      </FieldLabel>
                      <Input
                        id="subjectName"
                        placeholder="Ex.: paciente_01"
                        {...register("subjectName")}
                      />
                      <FieldDescription>
                        Identificador interno para localizar esta analise
                        depois.
                      </FieldDescription>
                      <FieldError>{errors.subjectName?.message}</FieldError>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="ethnicity">
                        Etnia / modelo alvo
                      </FieldLabel>
                      <Select
                        value={ethnicity}
                        onValueChange={(value) =>
                          setValue(
                            "ethnicity",
                            value as FormData["ethnicity"],
                            {
                              shouldDirty: true,
                            },
                          )
                        }>
                        <SelectTrigger
                          id="ethnicity"
                          className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEthnicitiesForSex.map((ethnicityOption) => (
                            <SelectItem
                              key={ethnicityOption}
                              value={ethnicityOption}>
                              {humanizeKey(ethnicityOption)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Modelos registrados:{" "}
                        <code>{AVAILABLE_MODEL_IDS.join(", ")}</code>.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>

                  <Field orientation="vertical">
                    <FieldLabel>Sexo</FieldLabel>
                    <RadioGroup
                      value={sex}
                      onValueChange={(value) =>
                        setValue("sex", value, {
                          shouldDirty: true,
                        })
                      }
                      className="grid gap-2 md:grid-cols-2">
                      {AVAILABLE_SEXES.map((sexOption) => {
                        const optionId = `sex_${sexOption}`

                        return (
                          <FieldLabel
                            key={sexOption}
                            htmlFor={optionId}
                            className="rounded-lg border border-border p-3">
                            <Field
                              data-slot="field"
                              orientation="horizontal"
                              className="items-center gap-3">
                              <RadioGroupItem
                                id={optionId}
                                value={sexOption}
                              />
                              <span>{humanizeKey(sexOption)}</span>
                            </Field>
                          </FieldLabel>
                        )
                      })}
                    </RadioGroup>
                  </Field>

                  <FieldSeparator>Configuracoes de UI</FieldSeparator>

                  <FieldGroup className="grid gap-4 md:grid-cols-3">
                    <Field
                      orientation="horizontal"
                      className="items-center justify-between rounded-lg border border-border p-3">
                      <FieldContent>
                        <FieldLabel htmlFor="showHints">
                          Mostrar dicas
                        </FieldLabel>
                        <FieldDescription>
                          Exibe orientacoes curtas em cada campo.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="showHints"
                        checked={showHints}
                        onCheckedChange={(checked) =>
                          setValue("showHints", checked, { shouldDirty: true })
                        }
                      />
                    </Field>

                    <Field
                      orientation="horizontal"
                      className="items-center justify-between rounded-lg border border-border p-3">
                      <FieldContent>
                        <FieldLabel>Grid compacto</FieldLabel>
                        <FieldDescription>
                          Mostra mais inputs por linha.
                        </FieldDescription>
                      </FieldContent>
                      <Toggle
                        pressed={compactGrid}
                        onPressedChange={(pressed) =>
                          setValue("compactGrid", pressed, {
                            shouldDirty: true,
                          })
                        }
                        variant="outline"
                        size="sm">
                        Compacto
                      </Toggle>
                    </Field>

                    <Field className="rounded-lg border border-border p-3">
                      <FieldLabel>Codigo da sessao (OTP)</FieldLabel>
                      <InputOTP
                        maxLength={6}
                        value={sessionCode}
                        onChange={(value) =>
                          setValue("sessionCode", value, { shouldDirty: true })
                        }>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <FieldDescription>
                        Opcional. Bom para vincular analise a lote/foto.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  modelAvailable
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                )}>
                {modelAvailable
                  ? `Modelo ${selectedModelId} disponivel para gerar resultado completo.`
                  : "Combinacao selecionada ainda nao possui modelo de scoring implementado no backend."}
              </div>
            </TabsContent>

            <TabsContent value="global_proportions">
              {renderRawStep("global_proportions")}
            </TabsContent>
            <TabsContent value="eye_area">
              {renderRawStep("eye_area")}
            </TabsContent>
            <TabsContent value="midface">
              {renderRawStep("midface")}
            </TabsContent>
            <TabsContent value="nasal_region">
              {renderRawStep("nasal_region")}
            </TabsContent>
            <TabsContent value="jaw_structure">
              {renderRawStep("jaw_structure")}
            </TabsContent>

            <TabsContent
              value="qualitative"
              className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
                <FieldSet>
                  <FieldLegend variant="legend">
                    Inputs qualitativos do modelo
                  </FieldLegend>

                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel>Orbital vector</FieldLabel>
                      <ToggleGroup
                        type="single"
                        value={orbitalVector}
                        onValueChange={(value) => {
                          if (!value) return
                          setValue(
                            "orbitalVector",
                            value as FormData["orbitalVector"],
                            {
                              shouldDirty: true,
                            },
                          )
                        }}
                        className="w-full">
                        <ToggleGroupItem
                          value="positive"
                          className="flex-1">
                          Positive
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="neutral"
                          className="flex-1">
                          Neutral
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="negative"
                          className="flex-1">
                          Negative
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <FieldDescription>
                        Alimenta a metrica categorial{" "}
                        <code>eyes.orbital_vector</code>.
                      </FieldDescription>
                    </Field>

                    <Field
                      orientation="horizontal"
                      className="items-center justify-between rounded-lg border border-border p-3">
                      <FieldContent>
                        <FieldLabel htmlFor="highBrows">
                          Sobrancelhas altas
                        </FieldLabel>
                        <FieldDescription>
                          Alimenta a metrica booleana <code>brows.height</code>.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="highBrows"
                        checked={highBrows}
                        onCheckedChange={(checked) =>
                          setValue("highBrows", checked, { shouldDirty: true })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="skinQuality">
                        Qualidade geral da pele
                      </FieldLabel>
                      <Select
                        value={skinQuality}
                        onValueChange={(value) =>
                          setValue(
                            "skinQuality",
                            value as FormData["skinQuality"],
                            {
                              shouldDirty: true,
                            },
                          )
                        }>
                        <SelectTrigger
                          id="skinQuality"
                          className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Ruim</SelectItem>
                          <SelectItem value="fair">Regular</SelectItem>
                          <SelectItem value="good">Boa</SelectItem>
                          <SelectItem value="excellent">Excelente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Alimenta a metrica categorial <code>skin.quality</code>.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="overallSymmetry">
                        Simetria geral
                      </FieldLabel>
                      <Select
                        value={overallSymmetry}
                        onValueChange={(value) =>
                          setValue(
                            "overallSymmetry",
                            value as FormData["overallSymmetry"],
                            {
                              shouldDirty: true,
                            },
                          )
                        }>
                        <SelectTrigger
                          id="overallSymmetry"
                          className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="moderate">Moderada</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="exceptional">Excelente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Alimenta a metrica categorial{" "}
                        <code>symmetry.overall</code>.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="fatLevel">
                        Nivel de gordura
                      </FieldLabel>
                      <Select
                        value={fatLevel}
                        onValueChange={(value) =>
                          setValue("fatLevel", value as FormData["fatLevel"], {
                            shouldDirty: true,
                          })
                        }>
                        <SelectTrigger
                          id="fatLevel"
                          className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="moderate">Moderada</SelectItem>
                          <SelectItem value="lean">Baixa (lean)</SelectItem>
                          <SelectItem value="very_lean">Muito baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Alimenta a metrica categorial <code>fat.level</code>.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="expressionTone">
                        Expressao geral
                      </FieldLabel>
                      <Select
                        value={expressionTone}
                        onValueChange={(value) =>
                          setValue(
                            "expressionTone",
                            value as FormData["expressionTone"],
                            {
                              shouldDirty: true,
                            },
                          )
                        }>
                        <SelectTrigger
                          id="expressionTone"
                          className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tense">Tensa</SelectItem>
                          <SelectItem value="neutral">Neutra</SelectItem>
                          <SelectItem value="positive">Positiva</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Alimenta a metrica categorial{" "}
                        <code>expression.neutrality</code>.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                Esta etapa fecha os grupos qualitativos do modelo (ocular
                structure e qualities), combinando valores subjetivos com as
                medidas brutas anteriores.
              </div>
            </TabsContent>

            <TabsContent
              value="results"
              className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Label className="text-base font-semibold text-foreground">
                      Dashboard da analise
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Score final, distribuicao por pilar/grupo e diagnostico
                      das metricas.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}>
                    {isSubmitting
                      ? "Gerando..."
                      : "Gerar / Atualizar resultado"}
                  </Button>
                </div>

                {analysisError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {analysisError}
                  </div>
                )}

                {!analysisError && !analysisResult && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Preencha os passos anteriores e clique em gerar resultado.
                  </div>
                )}

                {!analysisError && analysisResult && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs tracking-wide uppercase text-muted-foreground">
                          Score final
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                          {analysisResult.result.finalScore.toFixed(2)}
                          <span className="ml-1 text-base text-muted-foreground">
                            / 10
                          </span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs tracking-wide uppercase text-muted-foreground">
                          Cobertura de metricas
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                          {scoredMetricsCount}
                          <span className="ml-1 text-base text-muted-foreground">
                            / {totalModelMetrics}
                          </span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs tracking-wide uppercase text-muted-foreground">
                          Sessao
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {sessionCode ? sessionCode : "Sem codigo"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="mb-3 text-sm font-medium">
                          Radar Chart: pilares
                        </p>
                        <ChartContainer
                          config={pillarChartConfig}
                          className="h-[280px] w-full">
                          <RadarChart data={pillarScoreData}>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="pillar" />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 10]}
                              tickCount={6}
                            />
                            <Radar
                              dataKey="max"
                              stroke="var(--color-max)"
                              fill="var(--color-max)"
                              fillOpacity={0.08}
                            />
                            <Radar
                              dataKey="score"
                              stroke="var(--color-score)"
                              fill="var(--color-score)"
                              fillOpacity={0.45}
                            />
                          </RadarChart>
                        </ChartContainer>
                      </div>

                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="mb-3 text-sm font-medium">
                          Radial Chart Stacked: score final
                        </p>
                        <ChartContainer
                          config={radialChartConfig}
                          className="mx-auto aspect-square w-full max-w-[320px]">
                          <RadialBarChart
                            data={radialData}
                            endAngle={180}
                            innerRadius={80}
                            outerRadius={130}>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <PolarRadiusAxis
                              tick={false}
                              tickLine={false}
                              axisLine={false}>
                              <RechartsLabel
                                content={({ viewBox }) => {
                                  if (
                                    viewBox &&
                                    "cx" in viewBox &&
                                    "cy" in viewBox
                                  ) {
                                    const value = radialData[0]?.achieved ?? 0

                                    return (
                                      <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle">
                                        <tspan
                                          x={viewBox.cx}
                                          y={(viewBox.cy || 0) - 14}
                                          className="fill-foreground text-2xl font-bold">
                                          {value.toFixed(2)}
                                        </tspan>
                                        <tspan
                                          x={viewBox.cx}
                                          y={(viewBox.cy || 0) + 8}
                                          className="fill-muted-foreground text-xs">
                                          Score final / 10
                                        </tspan>
                                      </text>
                                    )
                                  }
                                }}
                              />
                            </PolarRadiusAxis>
                            <RadialBar
                              dataKey="achieved"
                              stackId="score"
                              cornerRadius={5}
                              fill="var(--color-achieved)"
                              className="stroke-transparent stroke-2"
                            />
                            <RadialBar
                              dataKey="remaining"
                              stackId="score"
                              cornerRadius={5}
                              fill="var(--color-remaining)"
                              className="stroke-transparent stroke-2"
                            />
                          </RadialBarChart>
                        </ChartContainer>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="mb-3 text-sm font-medium">
                        Area Chart: grupos em ordem do modelo
                      </p>
                      <ChartContainer
                        config={groupChartConfig}
                        className="h-[300px] w-full">
                        <AreaChart
                          data={groupScoreData}
                          margin={{ left: 6, right: 12 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="group"
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-24}
                            height={70}
                            textAnchor="end"
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-score)"
                            fill="var(--color-score)"
                            fillOpacity={0.28}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                          Pontos fortes
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {strengths.map((item) => (
                            <li
                              key={item.metricId}
                              className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {item.label}
                              </span>
                              <span className="font-mono font-semibold">
                                {item.score.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                          Pontos fracos
                        </p>
                        <ul className="mt-2 space-y-2 text-sm">
                          {weaknesses.map((item) => (
                            <li
                              key={item.metricId}
                              className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {item.label}
                              </span>
                              <span className="font-mono font-semibold">
                                {item.score.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card/85 p-3">
            <Button
              type="button"
              variant="outline"
              onClick={goPreviousStep}
              disabled={currentStepIndex === 0}>
              Anterior
            </Button>

            <div className="text-xs text-muted-foreground">
              Etapa {currentStepIndex + 1} de {STEP_ORDER.length}
            </div>

            {activeStep === "results" ? (
              <Button
                type="button"
                onClick={() => setActiveStep("profile")}>
                Voltar ao inicio
              </Button>
            ) : activeStep === lastInputStep ? (
              <Button
                type="submit"
                disabled={isSubmitting}>
                {isSubmitting ? "Processando..." : "Gerar resultado"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNextStep}>
                Proxima etapa
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
