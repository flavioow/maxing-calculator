export function gaussian(
  value: number,
  ideal: number,
  sigma: number
): number {
  const error = value - ideal
  const expoent = - (error ** 2) / (2 * sigma ** 2)
  return Math.exp(expoent)
}

export function gaussianRange(
  value: number,
  min: number,
  max: number
): number {

  const ideal = (min + max) / 2
  const sigma = (max - min) / 2

  const error = value - ideal

  const exponent = - (error ** 2) / (2 * sigma ** 2)

  return Math.exp(exponent)
}
