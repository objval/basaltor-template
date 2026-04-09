import { getEnabledPaymentProviders } from "@/modules/payments/core/registry";

export function getEnabledPaymentProviderNames() {
  return getEnabledPaymentProviders().map((provider) => provider.presentation.displayName);
}

export function formatProviderSummary(names: Array<string>) {
  if (names.length === 0) {
    return "Configured at checkout";
  }

  return names.join(" / ");
}