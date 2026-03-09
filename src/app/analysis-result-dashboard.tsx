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
import {
  type AnalysisResult,
  groupChartConfig,
  pillarChartConfig,
  radialChartConfig,
} from "./analysis-form-config"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"

export type RankedMetric = {
  metricId: string
  label: string
  score: number
}

export type AnalysisDashboardData = {
  analysisResult: AnalysisResult
  scoredMetricsCount: number
  totalModelMetrics: number
  sessionCode: string
  pillarScoreData: Array<{ pillar: string; score: number; max: number }>
  radialData: Array<{ label: string; achieved: number; remaining: number }>
  groupScoreData: Array<{ group: string; score: number }>
  strengths: RankedMetric[]
  weaknesses: RankedMetric[]
}

type AnalysisResultDashboardProps = {
  data: AnalysisDashboardData
}

export function AnalysisResultDashboard({ data }: AnalysisResultDashboardProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs tracking-wide uppercase text-muted-foreground">
            Nota final
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {data.analysisResult.result.finalScore.toFixed(2)}
            <span className="ml-1 text-base text-muted-foreground">/ 10</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs tracking-wide uppercase text-muted-foreground">
            Cobertura de métricas
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {data.scoredMetricsCount}
            <span className="ml-1 text-base text-muted-foreground">
              / {data.totalModelMetrics}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs tracking-wide uppercase text-muted-foreground">
            Sessão
          </p>
          <p className="mt-2 text-lg font-semibold">
            {data.sessionCode ? data.sessionCode : "Sem código"}
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-sm font-medium">Gráfico de Radar: pilares</p>
          <ChartContainer
            config={pillarChartConfig}
            className="h-[280px] w-full">
            <RadarChart data={data.pillarScoreData}>
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
            Gráfico Radial Empilhado: nota final
          </p>
          <ChartContainer
            config={radialChartConfig}
            className="mx-auto aspect-square w-full max-w-[320px]">
            <RadialBarChart
              data={data.radialData}
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
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const value = data.radialData[0]?.achieved ?? 0

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
                            Nota final / 10
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
          Gráfico de Área: grupos em ordem do modelo
        </p>
        <ChartContainer
          config={groupChartConfig}
          className="h-[300px] w-full">
          <AreaChart
            data={data.groupScoreData}
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
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
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
            {data.strengths.map((item) => (
              <li
                key={item.metricId}
                className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono font-semibold">{item.score.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
            Pontos fracos
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {data.weaknesses.map((item) => (
              <li
                key={item.metricId}
                className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono font-semibold">{item.score.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
