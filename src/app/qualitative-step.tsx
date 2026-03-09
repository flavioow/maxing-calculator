import type { UseFormSetValue } from "react-hook-form"
import type { FormData } from "./analysis-form-config"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type QualitativeStepProps = {
  setValue: UseFormSetValue<FormData>
  orbitalVector: FormData["orbitalVector"]
  highBrows: FormData["highBrows"]
  skinQuality: FormData["skinQuality"]
  overallSymmetry: FormData["overallSymmetry"]
  fatLevel: FormData["fatLevel"]
  expressionTone: FormData["expressionTone"]
}

export function QualitativeStep({
  setValue,
  orbitalVector,
  highBrows,
  skinQuality,
  overallSymmetry,
  fatLevel,
  expressionTone,
}: QualitativeStepProps) {
  return (
    <>
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
        <FieldSet>
          <FieldLegend variant="legend">Inputs qualitativos do modelo</FieldLegend>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Vetor Orbital</FieldLabel>
              <ToggleGroup
                type="single"
                value={orbitalVector}
                onValueChange={(value) => {
                  if (!value) return
                  setValue("orbitalVector", value as FormData["orbitalVector"], {
                    shouldDirty: true,
                  })
                }}
                className="w-full">
                <ToggleGroupItem
                  value="positive"
                  className="flex-1">
                  Positivo
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="neutral"
                  className="flex-1">
                  Neutro
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="negative"
                  className="flex-1">
                  Negativo
                </ToggleGroupItem>
              </ToggleGroup>
              <FieldDescription>
                alimenta a métrica categorial <code>eyes.orbital_vector</code>.
              </FieldDescription>
            </Field>

            <Field
              orientation="horizontal"
              className="items-center justify-between rounded-lg border border-border p-3">
              <FieldContent>
                <FieldLabel htmlFor="highBrows">Sobrancelhas altas</FieldLabel>
                <FieldDescription>
                  alimenta a métrica booleana <code>brows.height</code>.
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
              <FieldLabel>Qualidade geral da pele</FieldLabel>
              <RadioGroup
                value={skinQuality}
                onValueChange={(value) =>
                  setValue("skinQuality", value as FormData["skinQuality"], {
                    shouldDirty: true,
                  })
                }
                className="mt-1">
                <FieldLabel htmlFor="skin_quality_poor">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Ruim</FieldTitle>
                      <FieldDescription>
                        Pele com acne ativa, oleosidade descontrolada, inflamações
                        frequentes e textura bem irregular.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="skin_quality_poor"
                      value="poor"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="skin_quality_fair">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Regular</FieldTitle>
                      <FieldDescription>
                        Algumas manchas, poros aparentes e pequenas marcas; pele
                        funcional, mas ainda sem aspecto uniforme.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="skin_quality_fair"
                      value="fair"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="skin_quality_good">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Boa</FieldTitle>
                      <FieldDescription>
                        Textura mais lisa, poucas manchas e tonalidade relativamente
                        uniforme na maior parte da face.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="skin_quality_good"
                      value="good"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="skin_quality_excellent">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Excelente</FieldTitle>
                      <FieldDescription>
                        Pele limpa e homogenea, quase sem manchas ou acne visivel,
                        com textura fina e bem cuidada.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="skin_quality_excellent"
                      value="excellent"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
              <FieldDescription>
                alimenta a métrica categorial <code>skin.quality</code>.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="overallSymmetry">Simetria geral</FieldLabel>
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
                alimenta a métrica categorial <code>symmetry.overall</code>.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Nível de gordura</FieldLabel>
              <RadioGroup
                value={fatLevel}
                onValueChange={(value) =>
                  setValue("fatLevel", value as FormData["fatLevel"], {
                    shouldDirty: true,
                  })
                }
                className="mt-1">
                <FieldLabel htmlFor="fat_level_high">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Alta ({">"}18%)</FieldTitle>
                      <FieldDescription>
                        Volume de gordura facial mais evidente, com menor definição de
                        jawline e contornos.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="fat_level_high"
                      value="high"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="fat_level_moderate">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Moderada (13% a 18%)</FieldTitle>
                      <FieldDescription>
                        Definição intermediária: estrutura visivel, mas ainda com
                        retenção e suavização de linhas.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="fat_level_moderate"
                      value="moderate"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="fat_level_lean">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Baixa / ideal (9% a 12%)</FieldTitle>
                      <FieldDescription>
                        Faixa ideal para maxing estético: boa definição facial com
                        aparência saudável e sustentável.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="fat_level_lean"
                      value="lean"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="fat_level_very_lean">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Muito baixa (6% a 8%)</FieldTitle>
                      <FieldDescription>
                        Definição extrema e aparêcia seca; pode ser mais difícil de
                        manter por longos períodos.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="fat_level_very_lean"
                      value="very_lean"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
              <FieldDescription>
                alimenta a métrica categorial <code>fat.level</code>.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Linhas de expressão</FieldLabel>
              <RadioGroup
                value={expressionTone}
                onValueChange={(value) =>
                  setValue(
                    "expressionTone",
                    value as FormData["expressionTone"],
                    {
                      shouldDirty: true,
                    },
                  )
                }
                className="mt-1">
                <FieldLabel htmlFor="expression_strong_lines">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Linhas fortes</FieldTitle>
                      <FieldDescription>
                        Marcas profundas e visíveis em testa, glabela ou orbicular,
                        mesmo com expressão leve.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="expression_strong_lines"
                      value="strong_lines"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="expression_mild_lines">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Linhas fracas</FieldTitle>
                      <FieldDescription>
                        Marcas discretas, perceptíveis de perto ou em movimentos
                        faciais mais intensos.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="expression_mild_lines"
                      value="mild_lines"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="expression_no_lines">
                  <Field
                    orientation="horizontal"
                    className="items-start justify-between gap-3 p-0">
                    <FieldContent>
                      <FieldTitle>Sem linhas</FieldTitle>
                      <FieldDescription>
                        Superfície de pele lisa na região de expressão, sem marcas
                        aparentes em repouso.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id="expression_no_lines"
                      value="no_lines"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
              <FieldDescription>
                alimenta a métrica categorial <code>expression.neutrality</code>.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Esta etapa fecha os grupos qualitativos do modelo (estrutura ocular e
        qualidades), combinando valores subjetivos com as medidas brutas
        anteriores.
      </div>
    </>
  )
}
