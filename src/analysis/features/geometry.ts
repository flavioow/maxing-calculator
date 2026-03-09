// Funções matemáticas usadas para calcular métricas

export function ratio(a: number, b: number): number {
  if (b === 0) return 0
  return a / b
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0
  return part / total
}

export function angle(
  a: [number, number],
  b: [number, number],
  c: [number, number]
): number {

  const ab: [number, number] = [
    a[0] - b[0],
    a[1] - b[1]
  ]

  const cb: [number, number] = [
    c[0] - b[0],
    c[1] - b[1]
  ]

  const dot =
    ab[0] * cb[0] +
    ab[1] * cb[1]

  const magAB =
    Math.sqrt(ab[0] ** 2 + ab[1] ** 2)

  const magCB =
    Math.sqrt(cb[0] ** 2 + cb[1] ** 2)

  if (magAB === 0 || magCB === 0) return 0

  const cos = dot / (magAB * magCB)

  return Math.acos(cos) * (180 / Math.PI)
}
