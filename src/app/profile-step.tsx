import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form"
import {
  AVAILABLE_MODEL_IDS,
  AVAILABLE_SEXES,
  formatModelOptionLabel,
  type FormData,
  normalizeSessionCode,
} from "./analysis-form-config"
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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

type ProfileStepProps = {
  register: UseFormRegister<FormData>
  setValue: UseFormSetValue<FormData>
  errors: FieldErrors<FormData>
  ethnicity: string
  sex: string
  showHints: boolean
  compactGrid: boolean
  sessionCode: string
  availableEthnicitiesForSex: string[]
  modelAvailable: boolean
  selectedModelId: string | null
}

export function ProfileStep({
  register,
  setValue,
  errors,
  ethnicity,
  sex,
  showHints,
  compactGrid,
  sessionCode,
  availableEthnicitiesForSex,
  modelAvailable,
  selectedModelId,
}: ProfileStepProps) {
  return (
    <>
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
        <FieldSet>
          <FieldLegend variant="legend">Dados básicos da avaliação</FieldLegend>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="subjectName">Nome ou referência</FieldLabel>
              <Input
                id="subjectName"
                placeholder="Ex.: paciente_01"
                {...register("subjectName")}
              />
              <FieldDescription>
                Identificador interno para localizar esta análise depois.
              </FieldDescription>
              <FieldError>{errors.subjectName?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="ethnicity">Etnia / modelo alvo</FieldLabel>
              <Select
                value={ethnicity}
                onValueChange={(value) =>
                  setValue("ethnicity", value as FormData["ethnicity"], {
                    shouldDirty: true,
                  })
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
                      {formatModelOptionLabel(ethnicityOption)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Modelos registrados: <code>{AVAILABLE_MODEL_IDS.join(", ")}</code>.
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
                      <span>{formatModelOptionLabel(sexOption)}</span>
                    </Field>
                  </FieldLabel>
                )
              })}
            </RadioGroup>
          </Field>

          <FieldSeparator>Configurações de UI</FieldSeparator>

          <FieldGroup className="grid gap-4 md:grid-cols-3">
            <Field
              orientation="horizontal"
              className="items-center justify-between rounded-lg border border-border p-3">
              <FieldContent>
                <FieldLabel htmlFor="showHints">Mostrar dicas</FieldLabel>
                <FieldDescription>
                  Exibe orientações curtas em cada campo.
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
                <FieldDescription>Mostra mais inputs por linha.</FieldDescription>
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
              <FieldLabel>Código da sessão (OTP)</FieldLabel>
              <InputOTP
                maxLength={6}
                value={sessionCode}
                onChange={(value) =>
                  setValue("sessionCode", normalizeSessionCode(value), {
                    shouldDirty: true,
                  })
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
                ID local da análise. Mesmo ID sobrescreve, ID novo cria outra
                pessoa.
              </FieldDescription>
              <FieldError>{errors.sessionCode?.message}</FieldError>
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
          ? `Modelo ${selectedModelId} disponível para gerar resultado completo.`
          : "A combinação selecionada ainda não possui modelo de avaliação implementado."}
      </div>
    </>
  )
}
