"use client"

import { useEffect, useRef } from "react"
import { formatModelOptionLabel } from "./analysis-form-config"
import {
  AnalysisResultDashboard,
  type AnalysisDashboardData,
} from "./analysis-result-dashboard"
import type { SavedAnalysisRecord } from "./saved-analyses-panel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ComparisonParticipant = {
  record: SavedAnalysisRecord
  dashboard: AnalysisDashboardData
}

type AnalysisComparisonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  left: ComparisonParticipant | null
  right: ComparisonParticipant | null
}

function ParticipantHeader({ participant }: { participant: ComparisonParticipant }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Nome</p>
          <p className="font-semibold text-foreground">{participant.record.subjectName}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Código</p>
          <p className="font-mono font-semibold text-foreground">{participant.record.sessionCode}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Sexo</p>
          <p className="font-medium text-foreground">
            {formatModelOptionLabel(participant.record.sex)}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Etnia</p>
          <p className="font-medium text-foreground">
            {formatModelOptionLabel(participant.record.ethnicity)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Nota geral</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          {participant.dashboard.analysisResult.result.finalScore.toFixed(2)}
          <span className="ml-1 text-sm text-muted-foreground">/ 10</span>
        </p>
      </div>
    </>
  )
}

export function AnalysisComparisonDialog({
  open,
  onOpenChange,
  left,
  right,
}: AnalysisComparisonDialogProps) {
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const syncSourceRef = useRef<"left" | "right" | null>(null)
  const syncFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return

    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = 0
    }

    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = 0
    }
  }, [open, left?.record.sessionCode, right?.record.sessionCode])

  useEffect(() => {
    return () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current)
      }
    }
  }, [])

  function syncScroll(source: "left" | "right") {
    const from = source === "left" ? leftScrollRef.current : rightScrollRef.current
    const to = source === "left" ? rightScrollRef.current : leftScrollRef.current

    if (!from || !to) return

    if (syncSourceRef.current && syncSourceRef.current !== source) {
      return
    }

    syncSourceRef.current = source

    const sourceMax = from.scrollHeight - from.clientHeight
    const targetMax = to.scrollHeight - to.clientHeight
    const progress = sourceMax > 0 ? from.scrollTop / sourceMax : 0

    to.scrollTop = progress * Math.max(targetMax, 0)

    if (syncFrameRef.current !== null) {
      cancelAnimationFrame(syncFrameRef.current)
    }

    syncFrameRef.current = requestAnimationFrame(() => {
      syncSourceRef.current = null
      syncFrameRef.current = null
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[95vh] w-[calc(100vw-1.5rem)]! max-w-375! grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Comparação de indivíduos</DialogTitle>
          <DialogDescription>
            Visualização lado a lado das análises salvas.
          </DialogDescription>
        </DialogHeader>

        {!left || !right ? (
          <div className="min-h-0 overflow-y-auto px-6 py-10 text-sm text-muted-foreground">
            Selecione dois indivíduos na tabela para abrir a comparação.
          </div>
        ) : (
          <div className="grid min-h-0 gap-4 overflow-hidden p-4 lg:grid-cols-2">
            <section className="flex min-h-0 flex-col gap-3 rounded-xl border border-border bg-card/70 p-3">
              <ParticipantHeader participant={left} />
              <div
                ref={leftScrollRef}
                onScroll={() => syncScroll("left")}
                className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-background p-3">
                <AnalysisResultDashboard data={left.dashboard} />
              </div>
            </section>

            <section className="flex min-h-0 flex-col gap-3 rounded-xl border border-border bg-card/70 p-3">
              <ParticipantHeader participant={right} />
              <div
                ref={rightScrollRef}
                onScroll={() => syncScroll("right")}
                className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-background p-3">
                <AnalysisResultDashboard data={right.dashboard} />
              </div>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
