import { jsPDF } from 'jspdf';
import { IofCalculations } from './iof';

interface ExportPdfParams {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  result: number;
  unitRate: number;
  // IOF Calculations
  purchaseAmount: number;
  effectiveCurrency: string;
  commercialRate: number;
  calculations: IofCalculations;
}

export function exportConverterPdf({
  amount,
  fromCurrency,
  toCurrency,
  result,
  unitRate,
  purchaseAmount,
  effectiveCurrency,
  commercialRate,
  calculations
}: ExportPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm
  let y = 16;

  // Header Background Banner (Deep Coffee with Gold Accent)
  doc.setFillColor(31, 26, 20); // #1F1A14
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  // Gold accent bar on the left of banner
  doc.setFillColor(184, 134, 11); // #B8860B
  doc.rect(margin, y, 4, 24, 'F');

  // Banner Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DÓLAR ONLLINE • RESUMO DE COTAÇÃO & IOF', margin + 8, y + 10);

  // Banner Subtitle
  doc.setTextColor(220, 200, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Relatório Analítico de Câmbio e Simulação de Compras Internacionais', margin + 8, y + 17);

  y += 30;

  // Timestamp and Source info
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  doc.setTextColor(110, 97, 78); // #6E614E
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emissão: ${dateFormatted} às ${timeFormatted} (Horário de Brasília)`, margin, y);
  doc.text('Fonte: Cotações oficiais em tempo real (AwesomeAPI / Bacen)', pageWidth - margin, y, { align: 'right' });

  y += 6;

  // --- SEÇÃO 1: Conversão Primária ---
  doc.setFillColor(244, 239, 230); // #F4EFE6
  doc.roundedRect(margin, y, contentWidth, 32, 2.5, 2.5, 'F');
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 32, 2.5, 2.5, 'S');

  // Title of Section 1
  doc.setTextColor(31, 26, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. CONVERSÃO DE CÂMBIO', margin + 6, y + 8);

  // Amount box details
  doc.setFontSize(9);
  doc.setTextColor(110, 97, 78);
  doc.text('Valor Original Digitado:', margin + 6, y + 16);
  doc.setTextColor(31, 26, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${fromCurrency}`, margin + 6, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 97, 78);
  doc.text('Valor Convertido Estimado:', margin + 65, y + 16);
  doc.setTextColor(184, 134, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const formattedResult = `${result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency}`;
  doc.text(formattedResult, margin + 65, y + 24);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 97, 78);
  doc.text('Taxa Comercial Base:', margin + 125, y + 16);
  doc.setTextColor(31, 26, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`1 ${fromCurrency} = ${unitRate < 0.01 ? unitRate.toFixed(6) : unitRate.toFixed(4)} ${toCurrency}`, margin + 125, y + 23);

  y += 38;

  // --- SEÇÃO 2: Simulação de IOF e Custo no Exterior ---
  doc.setTextColor(31, 26, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`2. SIMULAÇÃO DE COMPRAS NO EXTERIOR (${purchaseAmount.toLocaleString('pt-BR')} ${effectiveCurrency})`, margin, y);

  y += 5;

  // Tabela Comparativa de Métodos de Pagamento
  const colWidth = contentWidth / 3;

  // Header dos 3 Métodos
  const methods = [
    {
      title: 'Dinheiro em Espécie',
      subtitle: 'Papel-moeda físico',
      data: calculations.cash,
      badge: 'IOF 1,10%',
      isBest: false,
      headerFill: [235, 245, 235],
      textColor: [20, 110, 50]
    },
    {
      title: 'Cartão de Crédito',
      subtitle: 'Bancos tradicionais',
      data: calculations.card,
      badge: `IOF ${calculations.card.iofPercent.toFixed(2)}%`,
      isBest: false,
      headerFill: [255, 235, 235],
      textColor: [180, 40, 40]
    },
    {
      title: 'Conta Global (Débito)',
      subtitle: 'Wise / Nomad / Inter',
      data: calculations.global,
      badge: 'IOF 1,10% • Melhor Opção',
      isBest: true,
      headerFill: [248, 238, 210],
      textColor: [184, 134, 11]
    }
  ];

  const tableStartY = y;
  const cardHeight = 65;

  methods.forEach((m, idx) => {
    const colX = margin + idx * colWidth;

    // Background do Card
    if (m.isBest) {
      doc.setFillColor(250, 246, 238);
      doc.setDrawColor(184, 134, 11);
      doc.setLineWidth(0.4);
    } else {
      doc.setFillColor(248, 246, 242);
      doc.setDrawColor(210, 200, 180);
      doc.setLineWidth(0.2);
    }
    doc.roundedRect(colX, tableStartY, colWidth - 2, cardHeight, 2, 2, 'F');
    doc.roundedRect(colX, tableStartY, colWidth - 2, cardHeight, 2, 2, 'S');

    // Header Strip inside card
    doc.setFillColor(m.headerFill[0], m.headerFill[1], m.headerFill[2]);
    doc.rect(colX, tableStartY, colWidth - 2, 12, 'F');

    doc.setTextColor(m.textColor[0], m.textColor[1], m.textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(m.title, colX + 3, tableStartY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(m.badge, colX + 3, tableStartY + 10);

    // Linhas de Detalhes
    let rowY = tableStartY + 18;
    const printRow = (label: string, val: string, isHighlight = false) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 90, 80);
      doc.text(label, colX + 3, rowY);

      doc.setFont('helvetica', isHighlight ? 'bold' : 'normal');
      doc.setTextColor(isHighlight ? m.textColor[0] : 31, isHighlight ? m.textColor[1] : 26, isHighlight ? m.textColor[2] : 20);
      doc.text(val, colX + colWidth - 5, rowY, { align: 'right' });
      rowY += 6.5;
    };

    printRow('Spread Emissor:', `${m.data.spreadPercent.toFixed(1)}%`);
    printRow('Cotação Efetiva:', `R$ ${m.data.rate.toFixed(4)}`);
    printRow('Subtotal Moeda:', `R$ ${m.data.subtotal.toFixed(2)}`);
    printRow(`IOF (${m.data.iofPercent.toFixed(2)}%):`, `+ R$ ${m.data.iofAmount.toFixed(2)}`, true);
    printRow('VET por unidade:', `R$ ${m.data.vet.toFixed(4)}`);

    // Linha divisória de Total
    doc.setDrawColor(200, 190, 175);
    doc.line(colX + 3, rowY - 1, colX + colWidth - 5, rowY - 1);

    // Total Final a Pagar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 26, 20);
    doc.text('TOTAL FINAL:', colX + 3, rowY + 3.5);

    doc.setFontSize(10);
    doc.setTextColor(m.textColor[0], m.textColor[1], m.textColor[2]);
    doc.text(`R$ ${m.data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colX + colWidth - 5, rowY + 3.5, { align: 'right' });
  });

  y += cardHeight + 8;

  // --- SEÇÃO 3: Veredito de Economia ---
  doc.setFillColor(244, 239, 230);
  doc.roundedRect(margin, y, contentWidth, 20, 2.5, 2.5, 'F');
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 20, 2.5, 2.5, 'S');

  doc.setTextColor(184, 134, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('VEREDITO DE ECONOMIA FINANCEIRA:', margin + 6, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 26, 20);
  const economiaGlobal = `• Optar pela Conta Global economiza R$ ${calculations.diffGlobalVsCard.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em relação ao Cartão de Crédito tradicional.`;
  const economiaCash = `• Optar por Dinheiro em Espécie economiza R$ ${calculations.diffCashVsCard.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em relação ao Cartão de Crédito.`;
  doc.text(economiaGlobal, margin + 6, y + 12);
  doc.text(economiaCash, margin + 6, y + 16.5);

  y += 26;

  // --- SEÇÃO 4: Explicação Legal & Regulação Bacen ---
  doc.setTextColor(100, 90, 80);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  const notaLegal = [
    'Nota Explicativa sobre o IOF Cambial (Decreto Federal nº 10.997/2022):',
    'A compra de papel-moeda físico e a remessa para contas internacionais próprias (contas globais) possuem alíquota de 1,10% de IOF.',
    'Compras internacionais em cartão de crédito seguem o cronograma de redução gradual do governo federal até a extinção do imposto.',
    'Os valores de spread e cotação são aproximações médias de mercado e podem variar conforme a instituição financeira emissora.'
  ];
  notaLegal.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  y += 4;

  // --- Rodapé Final ---
  doc.setDrawColor(210, 200, 185);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(184, 134, 11);
  doc.text('DÓLAR ONLLINE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 110, 100);
  doc.text('• dolaronlline.com.br • Monitoramento Cambial & Educação Financeira', margin + 25, y);
  doc.text('Documento informativo sem caráter de consultoria.', pageWidth - margin, y, { align: 'right' });

  // Nome do arquivo gerado
  const dateStr = now.toISOString().split('T')[0];
  const filename = `resumo-cotacao-iof-${fromCurrency}-${toCurrency}-${dateStr}.pdf`;

  // Download do PDF
  doc.save(filename);
}
