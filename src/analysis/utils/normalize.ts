// Normaliza um valor dentro de um intervalo e retorna valor entre 0 e 1

import { clamp } from "./clamp"

export function normalize(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 0

  const normalized = (value - min) / (max - min)

  return clamp(normalized, 0, 1)
}
