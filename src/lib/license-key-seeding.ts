export function createTopUpLicenseKeys({
  prefix,
  existingValues,
  currentAvailableCount,
  minimumAvailableCount,
}: {
  prefix: string;
  existingValues: Set<string>;
  currentAvailableCount: number;
  minimumAvailableCount: number;
}) {
  const missingCount = Math.max(minimumAvailableCount - currentAvailableCount, 0);

  if (missingCount === 0) {
    return [] as Array<string>;
  }

  const generated: Array<string> = [];
  let serial = existingValues.size + 1;

  while (generated.length < missingCount) {
    const key = `${prefix}-${String(serial).padStart(3, "0")}`;
    serial += 1;

    if (existingValues.has(key)) {
      continue;
    }

    existingValues.add(key);
    generated.push(key);
  }

  return generated;
}