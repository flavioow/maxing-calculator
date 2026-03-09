"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { RawMeasurementId } from "@/analysis/features/raw-measurements"
import { models } from "@/analysis/models"
import { analyzeFace } from "@/analysis/pipeline/analyze-face"
import type { MeasurementInput } from "@/analysis/types/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  DEFAULT_MODEL,
  formatMetricLabel,
  type FormData,
  humanizeKey,
  MODEL_VARIANTS,
  normalizeSessionCode,
  RAW_FIELDS,
  RAW_STEPS,
  type RawField,
  type RawStep,
  resolveModelId,
  schema,
  type StepId,
  STEP_META,
  STEP_ORDER,
} from "./analysis-form-config"
import { AnalysisComparisonDialog } from "./analysis-comparison-dialog"
import {
  type AnalysisDashboardData,
  type RankedMetric,
} from "./analysis-result-dashboard"
import { ProfileStep } from "./profile-step"
import { QualitativeStep } from "./qualitative-step"
import { RawStepSection } from "./raw-step"
import { ResultsStep } from "./results-step"
import {
  SavedAnalysesPanel,
  type SavedAnalysisRecord,
} from "./saved-analyses-panel"

const LOCAL_ANALYSES_STORAGE_KEY = "maxing-calculator:analyses:v1"

const storedAnalysisRecordSchema = z.object({
  sessionCode: z.string(),
  subjectName: z.string(),
  sex: z.string(),
  ethnicity: z.string(),
  finalScore: z.number(),
  scoredMetricsCount: z.number().int().nonnegative(),
  totalModelMetrics: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  formData: schema,
})

type StoredAnalysisRecord = z.infer<typeof storedAnalysisRecordSchema>
type AnalysisData = ReturnType<typeof analyzeFace>
type ComparisonParticipant = {
  record: SavedAnalysisRecord
  dashboard: AnalysisDashboardData
}

function buildRawMeasurements(values: FormData) {
  const raw: Partial<Record<RawMeasurementId, number>> = {}

  for (const field of RAW_FIELDS) {
    raw[field.id] = values.raw[field.key]
  }

  return raw
}

function buildExtraMetrics(values: FormData): MeasurementInput {
  return {
    "brows.height": values.highBrows,
    "eyes.orbital_vector": values.orbitalVector,
    "skin.quality": values.skinQuality,
    "symmetry.overall": values.overallSymmetry,
    "fat.level": values.fatLevel,
    "expression.neutrality": values.expressionTone,
  }
}

function computeCoverageStats(analysis: AnalysisData) {
  const totalModelMetrics = analysis.model.pillars.reduce((pillarAcc, pillar) => {
    const totalInPillar = pillar.groups.reduce(
      (groupAcc, group) => groupAcc + group.metrics.length,
      0,
    )
    return pillarAcc + totalInPillar
  }, 0)

  const scoredMetricsCount = analysis.model.pillars.reduce((pillarAcc, pillar) => {
    const coveredInPillar = pillar.groups.reduce((groupAcc, group) => {
      const coveredInGroup = group.metrics.filter(
        (metric) => analysis.metrics[metric.id] !== undefined,
      ).length
      return groupAcc + coveredInGroup
    }, 0)

    return pillarAcc + coveredInPillar
  }, 0)

  return {
    scoredMetricsCount,
    totalModelMetrics,
  }
}

function buildDashboardData(
  analysis: AnalysisData,
  sessionCode: string,
): AnalysisDashboardData {
  const coverage = computeCoverageStats(analysis)

  const pillarScoreData = analysis.model.pillars.map((pillar) => ({
    pillar: humanizeKey(pillar.id),
    score: Number((analysis.result.pillarScores[pillar.id] ?? 0).toFixed(2)),
    max: 10,
  }))

  const orderedGroups = analysis.model.pillars.flatMap((pillar) =>
    pillar.groups.map((group) => group.id),
  )

  const groupScoreData = orderedGroups.map((groupId) => ({
    group: humanizeKey(groupId),
    score: Number((analysis.result.groupScores[groupId] ?? 0).toFixed(2)),
  }))

  const achieved = Number(analysis.result.finalScore.toFixed(2))
  const remaining = Number(Math.max(0, 10 - achieved).toFixed(2))

  const radialData = [
    {
      label: "final",
      achieved,
      remaining,
    },
  ]

  const metricRanking: RankedMetric[] = Object.entries(analysis.result.metricScores)
    .map(([metricId, score]) => ({
      metricId,
      label: formatMetricLabel(metricId),
      score: Number(score.toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score)

  return {
    analysisResult: analysis,
    scoredMetricsCount: coverage.scoredMetricsCount,
    totalModelMetrics: coverage.totalModelMetrics,
    sessionCode,
    pillarScoreData,
    radialData,
    groupScoreData,
    strengths: metricRanking.slice(0, 5),
    weaknesses: [...metricRanking].reverse().slice(0, 5),
  }
}

function getTimestamp(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  return date.getTime()
}

function readStoredAnalyses() {
  if (typeof window === "undefined") return [] as StoredAnalysisRecord[]

  try {
    const raw = window.localStorage.getItem(LOCAL_ANALYSES_STORAGE_KEY)

    if (!raw) return []

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed
      .map((record) => storedAnalysisRecordSchema.safeParse(record))
      .filter((result) => result.success)
      .map((result) => result.data)
      .sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt))
  } catch {
    return []
  }
}

function writeStoredAnalyses(records: StoredAnalysisRecord[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(LOCAL_ANALYSES_STORAGE_KEY, JSON.stringify(records))
}

export function AnalysisWorkspace() {
  const [activeStep, setActiveStep] = useState<StepId>("profile")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<StoredAnalysisRecord[]>([])
  const [compareSelection, setCompareSelection] = useState<string[]>([])
  const [compareDialogOpen, setCompareDialogOpen] = useState(false)

  const {
    register,
    setValue,
    watch,
    reset,
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
      expressionTone: "mild_lines",
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

  useEffect(() => {
    setSavedAnalyses(readStoredAnalyses())
  }, [])

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

  const currentDashboardData = useMemo(() => {
    if (!analysisResult) return null

    return buildDashboardData(analysisResult, normalizeSessionCode(sessionCode))
  }, [analysisResult, sessionCode])

  const savedAnalysisRows = useMemo<SavedAnalysisRecord[]>(
    () => savedAnalyses.map(({ formData, ...record }) => record),
    [savedAnalyses],
  )

  const comparisonParticipants = useMemo(() => {
    if (compareSelection.length !== 2) {
      return null
    }

    const participants: ComparisonParticipant[] = []

    for (const sessionId of compareSelection) {
      const savedRecord = savedAnalyses.find(
        (record) => record.sessionCode === sessionId,
      )

      if (!savedRecord) {
        return null
      }

      const modelId = resolveModelId(savedRecord.formData.ethnicity, savedRecord.formData.sex)

      if (!modelId) {
        return null
      }

      const analysis = analyzeFace(
        buildRawMeasurements(savedRecord.formData),
        buildExtraMetrics(savedRecord.formData),
        modelId,
      )

      const { formData, ...row } = savedRecord

      participants.push({
        record: row,
        dashboard: buildDashboardData(analysis, savedRecord.sessionCode),
      })
    }

    return {
      left: participants[0],
      right: participants[1],
    }
  }, [compareSelection, savedAnalyses])

  useEffect(() => {
    if (!compareDialogOpen) return

    if (compareSelection.length !== 2 || !comparisonParticipants) {
      setCompareDialogOpen(false)
    }
  }, [compareDialogOpen, compareSelection, comparisonParticipants])

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

  function persistAnalysisLocally(values: FormData, analysis: AnalysisData) {
    const now = new Date().toISOString()
    const coverage = computeCoverageStats(analysis)

    setSavedAnalyses((previous) => {
      const existing = previous.find(
        (record) => record.sessionCode === values.sessionCode,
      )

      const nextRecord: StoredAnalysisRecord = {
        sessionCode: values.sessionCode,
        subjectName: values.subjectName,
        sex: values.sex,
        ethnicity: values.ethnicity,
        finalScore: Number(analysis.result.finalScore.toFixed(2)),
        scoredMetricsCount: coverage.scoredMetricsCount,
        totalModelMetrics: coverage.totalModelMetrics,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        formData: values,
      }

      const nextRecords = [
        nextRecord,
        ...previous.filter((record) => record.sessionCode !== values.sessionCode),
      ]

      writeStoredAnalyses(nextRecords)
      return nextRecords
    })
  }

  function onSubmit(values: FormData) {
    const normalizedSessionCode = normalizeSessionCode(values.sessionCode)
    const normalizedSubjectName = values.subjectName.trim()

    const normalizedValues: FormData = {
      ...values,
      subjectName: normalizedSubjectName,
      sessionCode: normalizedSessionCode,
    }

    if (values.sessionCode !== normalizedSessionCode) {
      setValue("sessionCode", normalizedSessionCode, {
        shouldDirty: true,
      })
    }

    if (values.subjectName !== normalizedSubjectName) {
      setValue("subjectName", normalizedSubjectName, {
        shouldDirty: true,
      })
    }

    const selectedModelId = resolveModelId(normalizedValues.ethnicity, normalizedValues.sex)

    if (!selectedModelId) {
      setAnalysisResult(null)
      setAnalysisError(
        `Modelo ${normalizedValues.ethnicity}_${normalizedValues.sex} não encontrado.`,
      )
      setActiveStep("results")
      return
    }

    const raw = buildRawMeasurements(normalizedValues)
    const extraMetrics = buildExtraMetrics(normalizedValues)
    const analysis = analyzeFace(raw, extraMetrics, selectedModelId)

    setAnalysisError(null)
    setAnalysisResult(analysis)
    setActiveStep("results")
    persistAnalysisLocally(normalizedValues, analysis)
  }

  function handleLoadRecord(sessionCode: string) {
    const savedRecord = savedAnalyses.find(
      (record) => record.sessionCode === sessionCode,
    )

    if (!savedRecord) return

    reset(savedRecord.formData)
    setActiveStep("profile")

    const selectedModelId = resolveModelId(
      savedRecord.formData.ethnicity,
      savedRecord.formData.sex,
    )

    if (!selectedModelId) {
      setAnalysisResult(null)
      setAnalysisError(
        `Modelo ${savedRecord.formData.ethnicity}_${savedRecord.formData.sex} não encontrado para o registro ${savedRecord.sessionCode}.`,
      )
      return
    }

    const analysis = analyzeFace(
      buildRawMeasurements(savedRecord.formData),
      buildExtraMetrics(savedRecord.formData),
      selectedModelId,
    )

    setAnalysisError(null)
    setAnalysisResult(analysis)
  }

  function handleDeleteRecord(sessionCode: string) {
    setSavedAnalyses((previous) => {
      const nextRecords = previous.filter(
        (record) => record.sessionCode !== sessionCode,
      )

      writeStoredAnalyses(nextRecords)
      return nextRecords
    })

    setCompareSelection((previous) =>
      previous.filter((recordId) => recordId !== sessionCode),
    )
  }

  function handleToggleCompareSelection(sessionCode: string) {
    setCompareSelection((previous) => {
      if (previous.includes(sessionCode)) {
        return previous.filter((recordId) => recordId !== sessionCode)
      }

      if (previous.length >= 2) {
        return [previous[1], sessionCode]
      }

      return [...previous, sessionCode]
    })
  }

  function handleClearCompareSelection() {
    setCompareSelection([])
  }

  function handleOpenComparison() {
    if (compareSelection.length !== 2) {
      return
    }

    if (!comparisonParticipants) {
      setAnalysisError("Não foi possível montar a comparação com os registros selecionados.")
      return
    }

    setCompareDialogOpen(true)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Label className="mb-2 text-xs tracking-[0.16em] uppercase text-muted-foreground">
          Facial Analysis Workspace
        </Label>
        <h1 className="text-balance text-2xl font-semibold text-foreground md:text-3xl">
          Formulário completo por etapas para gerar análise facial
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5">
          <Tabs
            value={activeStep}
            onValueChange={(value) => setActiveStep(value as StepId)}
            className="gap-4">
            <div className="grid gap-2 rounded-xl sm:grid-cols-2 xl:grid-cols-4">
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
              <ProfileStep
                register={register}
                setValue={setValue}
                errors={errors}
                ethnicity={ethnicity}
                sex={sex}
                showHints={showHints}
                compactGrid={compactGrid}
                sessionCode={sessionCode}
                availableEthnicitiesForSex={availableEthnicitiesForSex}
                modelAvailable={modelAvailable}
                selectedModelId={selectedModelId}
              />
            </TabsContent>

            {RAW_STEPS.map((step) => (
              <TabsContent
                key={step}
                value={step}>
                <RawStepSection
                  step={step}
                  fields={rawByStep[step]}
                  filled={countFilledFields(step)}
                  compactGrid={compactGrid}
                  showHints={showHints}
                  register={register}
                  rawErrors={rawErrors}
                />
              </TabsContent>
            ))}

            <TabsContent
              value="qualitative"
              className="space-y-4">
              <QualitativeStep
                setValue={setValue}
                orbitalVector={orbitalVector}
                highBrows={highBrows}
                skinQuality={skinQuality}
                overallSymmetry={overallSymmetry}
                fatLevel={fatLevel}
                expressionTone={expressionTone}
              />
            </TabsContent>

            <TabsContent
              value="results"
              className="space-y-4">
              <ResultsStep
                isSubmitting={isSubmitting}
                analysisError={analysisError}
                analysisResult={analysisResult}
                scoredMetricsCount={currentDashboardData?.scoredMetricsCount ?? 0}
                totalModelMetrics={currentDashboardData?.totalModelMetrics ?? 0}
                sessionCode={currentDashboardData?.sessionCode ?? sessionCode}
                pillarScoreData={currentDashboardData?.pillarScoreData ?? []}
                radialData={currentDashboardData?.radialData ?? []}
                groupScoreData={currentDashboardData?.groupScoreData ?? []}
                strengths={currentDashboardData?.strengths ?? []}
                weaknesses={currentDashboardData?.weaknesses ?? []}
              />
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl">
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
                Voltar ao início
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
                Próxima etapa
              </Button>
            )}
          </div>
        </form>

        <SavedAnalysesPanel
          records={savedAnalysisRows}
          currentSessionCode={normalizeSessionCode(sessionCode)}
          selectedSessionCodes={compareSelection}
          canCompareSelected={compareSelection.length === 2}
          onToggleCompareSelection={handleToggleCompareSelection}
          onClearCompareSelection={handleClearCompareSelection}
          onCompareSelected={handleOpenComparison}
          onLoadRecord={handleLoadRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>

      <AnalysisComparisonDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        left={comparisonParticipants?.left ?? null}
        right={comparisonParticipants?.right ?? null}
      />
    </main>
  )
}
