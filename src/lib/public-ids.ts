function randomBlock(length = 4) {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
}

export function generatePublicOrderId() {
  return `BST-${randomBlock()}-${randomBlock()}`;
}

export function generatePublicPaymentAttemptId(provider: string) {
  return `${provider.toUpperCase()}-${randomBlock()}-${randomBlock()}`;
}

export function maskLicenseKey(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}
