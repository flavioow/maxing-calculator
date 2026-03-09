import { useState } from "react"
import {
  IconChevronDown,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react"
import { formatModelOptionLabel } from "./analysis-form-config"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type SavedAnalysisRecord = {
  sessionCode: string
  subjectName: string
  sex: string
  ethnicity: string
  finalScore: number
  scoredMetricsCount: number
  totalModelMetrics: number
  createdAt: string
  updatedAt: string
}

type SavedAnalysesPanelProps = {
  records: SavedAnalysisRecord[]
  currentSessionCode: string
  selectedSessionCodes: string[]
  canCompareSelected: boolean
  onToggleCompareSelection: (sessionCode: string) => void
  onClearCompareSelection: () => void
  onCompareSelected: () => void
  onLoadRecord: (sessionCode: string) => void
  onDeleteRecord: (sessionCode: string) => void
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
})

function formatDateTime(value: string) {
  const timestamp = new Date(value)

  if (Number.isNaN(timestamp.getTime())) {
    return "Data inválida"
  }

  return dateTimeFormatter.format(timestamp)
}

export function SavedAnalysesPanel({
  records,
  currentSessionCode,
  selectedSessionCodes,
  canCompareSelected,
  onToggleCompareSelection,
  onClearCompareSelection,
  onCompareSelected,
  onLoadRecord,
  onDeleteRecord,
}: SavedAnalysesPanelProps) {
  const [isOpen, setIsOpen] = useState(records.length > 0)
  const selectedCount = selectedSessionCodes.length

  return (
    <section className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">
              Pessoas salvas localmente
            </p>
            <p className="text-sm text-muted-foreground">
              {records.length} análise(s) no navegador. IDs iguais sobrescrevem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              disabled={!canCompareSelected}
              onClick={onCompareSelected}>
              Comparar selecionados ({selectedCount}/2)
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={selectedCount === 0}
              onClick={onClearCompareSelection}>
              Limpar seleção
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="gap-2">
                {isOpen ? "Ocultar tabela" : "Mostrar tabela"}
                <IconChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isOpen ? "rotate-180" : "rotate-0",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="mt-4">
          {records.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nenhuma pessoa salva ainda. Gere uma análise com ID para registrar
              aqui.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="w-12 px-3 py-2">Sel.</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Sexo</th>
                    <th className="px-3 py-2">Modelo</th>
                    <th className="px-3 py-2">Nota</th>
                    <th className="px-3 py-2">Cobertura</th>
                    <th className="px-3 py-2">Atualizado em</th>
                    <th className="px-3 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const isCurrent = record.sessionCode === currentSessionCode
                    const isSelectedForCompare = selectedSessionCodes.includes(
                      record.sessionCode,
                    )

                    return (
                      <tr
                        key={record.sessionCode}
                        className={cn(
                          "border-t border-border",
                          isCurrent ? "bg-primary/5" : "bg-background",
                          isSelectedForCompare && "ring-1 ring-primary/30",
                        )}>
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={isSelectedForCompare}
                            onCheckedChange={() =>
                              onToggleCompareSelection(record.sessionCode)
                            }
                            aria-label={`Selecionar ${record.subjectName} para comparação`}
                          />
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold">
                          {record.sessionCode}
                        </td>
                        <td className="px-3 py-2">{record.subjectName}</td>
                        <td className="px-3 py-2">
                          {formatModelOptionLabel(record.sex)}
                        </td>
                        <td className="px-3 py-2">
                          {formatModelOptionLabel(record.ethnicity)}
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {record.finalScore.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          {record.scoredMetricsCount}/{record.totalModelMetrics}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDateTime(record.updatedAt)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => onLoadRecord(record.sessionCode)}>
                              <IconEdit />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => onDeleteRecord(record.sessionCode)}>
                              <IconTrash />
                              Remover
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
