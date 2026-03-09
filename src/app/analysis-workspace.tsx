"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
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
import { ProfileStep } from "./profile-step"
import { QualitativeStep } from "./qualitative-step"
import { RawStepSection } from "./raw-step"
import { ResultsStep } from "./results-step"

export function AnalysisWorkspace() {
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
      score: Number((analysisResult.result.pillarScores[pillar.id] ?? 0).toFixed(2)),
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
      score: Number((analysisResult.result.groupScores[groupId] ?? 0).toFixed(2)),
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
      setAnalysisError(`Modelo ${values.ethnicity}_${values.sex} não encontrado.`)
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
                scoredMetricsCount={scoredMetricsCount}
                totalModelMetrics={totalModelMetrics}
                sessionCode={sessionCode}
                pillarScoreData={pillarScoreData}
                radialData={radialData}
                groupScoreData={groupScoreData}
                strengths={strengths}
                weaknesses={weaknesses}
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
      </div>
    </main>
  )
}
