import type { AnalysisResult } from "./analysis-form-config"
import {
  AnalysisResultDashboard,
  type RankedMetric,
} from "./analysis-result-dashboard"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type ResultsStepProps = {
  isSubmitting: boolean
  analysisError: string | null
  analysisResult: AnalysisResult | null
  scoredMetricsCount: number
  totalModelMetrics: number
  sessionCode: string
  pillarScoreData: Array<{ pillar: string; score: number; max: number }>
  radialData: Array<{ label: string; achieved: number; remaining: number }>
  groupScoreData: Array<{ group: string; score: number }>
  strengths: RankedMetric[]
  weaknesses: RankedMetric[]
}

export function ResultsStep({
  isSubmitting,
  analysisError,
  analysisResult,
  scoredMetricsCount,
  totalModelMetrics,
  sessionCode,
  pillarScoreData,
  radialData,
  groupScoreData,
  strengths,
  weaknesses,
}: ResultsStepProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-base font-semibold text-foreground">
            Dashboard da análise
          </Label>
          <p className="text-sm text-muted-foreground">
            Nota final, distribuição por pilar/grupo e diagnóstico das métricas.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting ? "Gerando..." : "Gerar / Atualizar resultado"}
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
        <AnalysisResultDashboard
          data={{
            analysisResult,
            scoredMetricsCount,
            totalModelMetrics,
            sessionCode,
            pillarScoreData,
            radialData,
            groupScoreData,
            strengths,
            weaknesses,
          }}
        />
      )}
    </div>
  )
}
