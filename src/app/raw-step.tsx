import type { UseFormRegister } from "react-hook-form"
import {
  type FormData,
  type RawField,
  type RawStep,
  STEP_META,
} from "./analysis-form-config"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type RawStepProps = {
  step: RawStep
  fields: RawField[]
  filled: number
  compactGrid: boolean
  showHints: boolean
  register: UseFormRegister<FormData>
  rawErrors: Record<string, { message?: string } | undefined>
}

export function RawStepSection({
  step,
  fields,
  filled,
  compactGrid,
  showHints,
  register,
  rawErrors,
}: RawStepProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-base font-semibold text-foreground">
            {STEP_META[step].label}
          </Label>
          <p className="text-sm text-muted-foreground">{STEP_META[step].description}</p>
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
