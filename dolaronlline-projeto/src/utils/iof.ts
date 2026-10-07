export interface IofMethodData {
  rate: number;
  subtotal: number;
  iofAmount: number;
  total: number;
  vet: number;
  iofPercent: number;
  spreadPercent: number;
}

export interface IofCalculations {
  cash: IofMethodData;
  card: IofMethodData;
  global: IofMethodData;
  diffCashVsCard: number;
  diffGlobalVsCard: number;
}

export function calculateIof({
  purchaseAmount,
  commercialRate,
  cardIofRate = 3.38,
  cardSpread = 4.0,
  cashSpread = 2.5,
  globalSpread = 1.5,
}: {
  purchaseAmount: number;
  commercialRate: number;
  cardIofRate?: number;
  cardSpread?: number;
  cashSpread?: number;
  globalSpread?: number;
}): IofCalculations {
  // 1. Dinheiro em Espécie (Papel-moeda - IOF fixo 1,10%)
  const cashRate = commercialRate * (1 + cashSpread / 100);
  const cashSubtotal = purchaseAmount * cashRate;
  const cashIof = cashSubtotal * 0.011;
  const cashTotal = cashSubtotal + cashIof;
  const cashVet = purchaseAmount > 0 ? cashTotal / purchaseAmount : 0;

  // 2. Cartão de Crédito Internacional (Bancos Tradicionais)
  const cardRate = commercialRate * (1 + cardSpread / 100);
  const cardSubtotal = purchaseAmount * cardRate;
  const cardIof = cardSubtotal * (cardIofRate / 100);
  const cardTotal = cardSubtotal + cardIof;
  const cardVet = purchaseAmount > 0 ? cardTotal / purchaseAmount : 0;

  // 3. Cartão de Débito Conta Global (Wise / Nomad / Inter - IOF 1,10%)
  const globalRate = commercialRate * (1 + globalSpread / 100);
  const globalSubtotal = purchaseAmount * globalRate;
  const globalIof = globalSubtotal * 0.011;
  const globalTotal = globalSubtotal + globalIof;
  const globalVet = purchaseAmount > 0 ? globalTotal / purchaseAmount : 0;

  return {
    cash: {
      rate: cashRate,
      subtotal: cashSubtotal,
      iofAmount: cashIof,
      total: cashTotal,
      vet: cashVet,
      iofPercent: 1.10,
      spreadPercent: cashSpread,
    },
    card: {
      rate: cardRate,
      subtotal: cardSubtotal,
      iofAmount: cardIof,
      total: cardTotal,
      vet: cardVet,
      iofPercent: cardIofRate,
      spreadPercent: cardSpread,
    },
    global: {
      rate: globalRate,
      subtotal: globalSubtotal,
      iofAmount: globalIof,
      total: globalTotal,
      vet: globalVet,
      iofPercent: 1.10,
      spreadPercent: globalSpread,
    },
    diffCashVsCard: cardTotal - cashTotal,
    diffGlobalVsCard: cardTotal - globalTotal,
  };
}
