export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

/**
 * `zipRanges` guarda pares [início, fim] de CEPs, ex.: ["47800-000","47899-999"].
 * Compara apenas os 8 dígitos, ignorando hífen.
 */
export function cepMatches(cep: string | number, ranges: string[]) {
  const target = typeof cep === 'number' ? cep : Number(onlyDigits(cep));

  if (!Number.isFinite(target)) return false;

  for (let index = 0; index + 1 < ranges.length; index += 2) {
    const start = Number(onlyDigits(ranges[index]));
    const end = Number(onlyDigits(ranges[index + 1]));

    if (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      target >= start &&
      target <= end
    ) {
      return true;
    }
  }

  return false;
}
