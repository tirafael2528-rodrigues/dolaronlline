import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Percent, DollarSign, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { fetchHistory } from '../services/api';

interface ChartProps {
  pair: string;
}

interface TimeframeOption {
  days: number;
  label: string;
  description: string;
}

const TIMEFRAMES: TimeframeOption[] = [
  { days: 7, label: '7D', description: 'última semana' },
  { days: 30, label: '30D', description: 'último mês' },
  { days: 60, label: '60D', description: 'últimos 2 meses' },
  { days: 90, label: '90D', description: 'último trimestre' },
  { days: 365, label: '1A', description: 'último ano' },
];

const COMPARE_OPTIONS = [
  { value: '', label: 'Comparar com...' },
  { value: 'USD-BRL', label: 'Dólar (USD)' },
  { value: 'EUR-BRL', label: 'Euro (EUR)' },
  { value: 'BTC-BRL', label: 'Bitcoin (BTC)' },
  { value: 'GBP-BRL', label: 'Libra (GBP)' },
];

interface AlignedDataPoint {
  dateKey: string;
  dateLabel: string;
  originalPrimary?: any;
  originalCompare?: any;
  primaryBid: number;
  compareBid?: number;
  primaryPct: number;
  comparePct?: number;
}

const getCurrencyName = (p: string) => {
  if (p.startsWith('USD')) return 'Dólar (USD)';
  if (p.startsWith('EUR')) return 'Euro (EUR)';
  if (p.startsWith('BTC')) return 'Bitcoin (BTC)';
  if (p.startsWith('GBP')) return 'Libra (GBP)';
  return p;
};

function getDateKey(d: any): string {
  if (!d) return '';
  if (d.create_date) {
    return d.create_date.split(' ')[0];
  }
  if (d.timestamp) {
    try {
      const date = new Date(parseInt(d.timestamp) * 1000);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
  return '';
}

export default function Chart({ pair }: ChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAMES[1]); // Default 30D
  const [viewMode, setViewMode] = useState<'price' | 'percent'>('price');

  // Comparison State
  const [comparePair, setComparePair] = useState<string>('');
  const [compareData, setCompareData] = useState<any[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    primaryY: number;
    compareY?: number;
    primaryVal: number;
    compareVal?: number;
    primaryPct: number;
    comparePct?: number;
    dateLabel: string;
    fullDate: string;
    primaryLabel: string;
    compareLabel?: string;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Clear comparison if it matches primary to prevent comparing with itself
  useEffect(() => {
    if (comparePair === pair) {
      setComparePair('');
    }
  }, [pair, comparePair]);

  // Load Primary Data
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const history = await fetchHistory(pair, selectedTimeframe.days);
        if (isMounted) {
          setData(Array.isArray(history) ? [...history].reverse() : []);
        }
      } catch (err) {
        console.error("Error loading primary history", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadHistory();
    setHoveredPoint(null);
    return () => {
      isMounted = false;
    };
  }, [pair, selectedTimeframe]);

  // Load Comparison Data
  useEffect(() => {
    let isMounted = true;
    const loadCompareHistory = async () => {
      if (!comparePair) {
        setCompareData([]);
        return;
      }
      setLoadingCompare(true);
      try {
        const history = await fetchHistory(comparePair, selectedTimeframe.days);
        if (isMounted) {
          setCompareData(Array.isArray(history) ? [...history].reverse() : []);
        }
      } catch (err) {
        console.error("Error loading comparison history", err);
      } finally {
        if (isMounted) setLoadingCompare(false);
      }
    };
    loadCompareHistory();
    setHoveredPoint(null);
    return () => {
      isMounted = false;
    };
  }, [comparePair, selectedTimeframe]);

  // Unified aligned date timeline construction
  const alignedData: AlignedDataPoint[] = [];
  
  if (data.length > 0) {
    const dateMap = new Map<string, { primary?: any; compare?: any }>();
    
    // Add primary entries
    data.forEach(d => {
      const key = getDateKey(d);
      if (key) {
        dateMap.set(key, { primary: d });
      }
    });
    
    // Add compare entries
    if (comparePair && compareData.length > 0) {
      compareData.forEach(d => {
        const key = getDateKey(d);
        if (key) {
          const existing = dateMap.get(key) || {};
          existing.compare = d;
          dateMap.set(key, existing);
        }
      });
    }
    
    // Sort keys chronologically
    const sortedKeys = Array.from(dateMap.keys()).sort();
    
    let lastPrimaryBid = 0;
    for (const d of data) {
      if (d.bid) {
        lastPrimaryBid = parseFloat(d.bid);
        break;
      }
    }
    
    let lastCompareBid = 0;
    if (comparePair && compareData.length > 0) {
      for (const d of compareData) {
        if (d.bid) {
          lastCompareBid = parseFloat(d.bid);
          break;
        }
      }
    }
    
    // First pass to collect raw bids
    const rawPoints: {
      key: string;
      label: string;
      primaryBid: number;
      compareBid?: number;
      originalPrimary?: any;
      originalCompare?: any;
    }[] = [];

    sortedKeys.forEach(key => {
      const entry = dateMap.get(key)!;
      let primaryBid = lastPrimaryBid;
      if (entry.primary && entry.primary.bid) {
        primaryBid = parseFloat(entry.primary.bid);
        lastPrimaryBid = primaryBid;
      }
      
      let compareBid: number | undefined = undefined;
      if (comparePair) {
        compareBid = lastCompareBid;
        if (entry.compare && entry.compare.bid) {
          compareBid = parseFloat(entry.compare.bid);
          lastCompareBid = compareBid;
        }
      }
      
      let label = '';
      const parts = key.split('-');
      if (parts.length === 3) {
        label = `${parts[2]}/${parts[1]}`;
      }
      
      rawPoints.push({
        key,
        label,
        primaryBid,
        compareBid,
        originalPrimary: entry.primary,
        originalCompare: entry.compare,
      });
    });

    // Base values at day 0 (start of period) for percentage calculation
    const basePrimaryBid = rawPoints.length > 0 && rawPoints[0].primaryBid > 0 ? rawPoints[0].primaryBid : 1;
    const baseCompareBid = comparePair && rawPoints.length > 0 && rawPoints[0].compareBid !== undefined && rawPoints[0].compareBid > 0 
      ? rawPoints[0].compareBid 
      : 1;

    // Second pass to calculate normalized percentages
    rawPoints.forEach(pt => {
      const primaryPct = ((pt.primaryBid - basePrimaryBid) / basePrimaryBid) * 100;
      const comparePct = pt.compareBid !== undefined ? ((pt.compareBid - baseCompareBid) / baseCompareBid) * 100 : undefined;

      alignedData.push({
        dateKey: pt.key,
        dateLabel: pt.label,
        originalPrimary: pt.originalPrimary,
        originalCompare: pt.originalCompare,
        primaryBid: pt.primaryBid,
        compareBid: pt.compareBid,
        primaryPct,
        comparePct,
      });
    });
  }

  // --- Dimension constants ---
  const width = 800;
  const height = 360;
  const paddingX = 100;
  const paddingYTop = 35;
  const paddingYBottom = 55;

  const getX = (index: number) => {
    if (alignedData.length <= 1) return paddingX;
    return (index / (alignedData.length - 1)) * (width - paddingX * 2) + paddingX;
  };

  // --- Price Mode Calculations ---
  const primaryPoints = alignedData.map(d => d.primaryBid);
  const minPrice = primaryPoints.length > 0 ? Math.min(...primaryPoints) : 0;
  const maxPrice = primaryPoints.length > 0 ? Math.max(...primaryPoints) : 0;
  const priceRange = maxPrice - minPrice || 1;

  const comparePoints = comparePair && compareData.length > 0 
    ? alignedData.filter(d => d.compareBid !== undefined).map(d => d.compareBid as number)
    : [];
  const compareMinPrice = comparePoints.length > 0 ? Math.min(...comparePoints) : 0;
  const compareMaxPrice = comparePoints.length > 0 ? Math.max(...comparePoints) : 0;
  const comparePriceRange = compareMaxPrice - compareMinPrice || 1;

  const getPriceY = (val: number) => height - paddingYBottom - ((val - minPrice) / priceRange) * (height - paddingYBottom - paddingYTop);
  const getComparePriceY = (val: number) => height - paddingYBottom - ((val - compareMinPrice) / comparePriceRange) * (height - paddingYBottom - paddingYTop);

  // --- Percent Mode Calculations (Unified Axis) ---
  const allPctValues = alignedData.map(d => d.primaryPct);
  if (comparePair && compareData.length > 0) {
    alignedData.forEach(d => {
      if (d.comparePct !== undefined) allPctValues.push(d.comparePct);
    });
  }
  const rawMinPct = allPctValues.length > 0 ? Math.min(0, ...allPctValues) : 0;
  const rawMaxPct = allPctValues.length > 0 ? Math.max(0, ...allPctValues) : 0;
  const pctSpan = rawMaxPct - rawMinPct;
  const padPct = Math.max(0.4, pctSpan * 0.12);
  const minPct = rawMinPct - padPct;
  const maxPct = rawMaxPct + padPct;
  const pctRange = maxPct - minPct || 1;

  const getPctY = (val: number) => height - paddingYBottom - ((val - minPct) / pctRange) * (height - paddingYBottom - paddingYTop);

  // Selector functions depending on viewMode
  const getY = (d: AlignedDataPoint) => {
    return viewMode === 'percent' ? getPctY(d.primaryPct) : getPriceY(d.primaryBid);
  };

  const getCompareY = (d: AlignedDataPoint) => {
    if (d.compareBid === undefined) return 0;
    return viewMode === 'percent' ? getPctY(d.comparePct || 0) : getComparePriceY(d.compareBid);
  };

  // SVG Paths
  const pathData = alignedData.length > 0 
    ? alignedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d)}`).join(' ')
    : '';

  const areaData = alignedData.length > 0
    ? `${pathData} L ${getX(alignedData.length - 1)} ${height - paddingYBottom} L ${getX(0)} ${height - paddingYBottom} Z`
    : '';

  const comparePathData = comparePair && compareData.length > 0 && alignedData.length > 0
    ? alignedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getCompareY(d)}`).join(' ')
    : '';

  // Trend determination (last vs first)
  const lastPoint = alignedData.length > 0 ? alignedData[alignedData.length - 1] : null;
  const firstPoint = alignedData.length > 0 ? alignedData[0] : null;
  const trendUp = lastPoint && firstPoint ? lastPoint.primaryBid >= firstPoint.primaryBid : true;
  const compareTrendUp = lastPoint && firstPoint && lastPoint.compareBid !== undefined && firstPoint.compareBid !== undefined
    ? lastPoint.compareBid >= firstPoint.compareBid
    : true;

  const totalPrimaryChangePct = lastPoint ? lastPoint.primaryPct : 0;
  const totalCompareChangePct = lastPoint && lastPoint.comparePct !== undefined ? lastPoint.comparePct : 0;

  const numDates = 5;
  const dateIndices = Array.from({ length: numDates }).map((_, i) => {
    if (alignedData.length === 0) return 0;
    return Math.floor((i / (numDates - 1)) * (alignedData.length - 1));
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || alignedData.length === 0) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e 
      ? (e.touches && e.touches[0] ? e.touches[0].clientX : 0) 
      : e.clientX;
      
    if (!clientX) return;

    const relativeX = clientX - rect.left;
    const percentX = relativeX / rect.width;
    const svgX = percentX * width;
    
    const chartWidth = width - paddingX * 2;
    const adjustedX = svgX - paddingX;
    
    let index = Math.round((adjustedX / chartWidth) * (alignedData.length - 1));
    if (index < 0) index = 0;
    if (index >= alignedData.length) index = alignedData.length - 1;
    
    const d = alignedData[index];
    if (d) {
      const primaryVal = d.primaryBid;
      const x = getX(index);
      const primaryY = getY(d);
      
      let compareY: number | undefined = undefined;
      let compareVal: number | undefined = undefined;
      
      if (comparePair && d.compareBid !== undefined) {
        compareVal = d.compareBid;
        compareY = getCompareY(d);
      }
      
      let fullDateStr = '';
      const originalObj = d.originalPrimary || d.originalCompare;
      if (originalObj) {
        if (originalObj.timestamp) {
          const date = new Date(parseInt(originalObj.timestamp) * 1000);
          fullDateStr = date.toLocaleString('pt-BR');
        } else if (originalObj.create_date) {
          const parts = originalObj.create_date.split(' ');
          if (parts[0]) {
            const dParts = parts[0].split('-');
            if (dParts.length === 3) {
              const formattedD = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
              fullDateStr = parts[1] ? `${formattedD} às ${parts[1].substring(0, 5)}` : formattedD;
            } else {
              fullDateStr = originalObj.create_date;
            }
          } else {
            fullDateStr = originalObj.create_date;
          }
        }
      } else {
        const parts = d.dateKey.split('-');
        if (parts.length === 3) {
          fullDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          fullDateStr = d.dateKey;
        }
      }
      
      setHoveredPoint({
        x,
        primaryY,
        compareY,
        primaryVal,
        compareVal,
        primaryPct: d.primaryPct,
        comparePct: d.comparePct,
        dateLabel: d.dateLabel,
        fullDate: fullDateStr,
        primaryLabel: getCurrencyName(pair),
        compareLabel: comparePair ? getCurrencyName(comparePair) : undefined
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <section className="py-8">
      <div className="p-6 md:p-8 rounded-[2rem] bg-card border border-border relative overflow-hidden">
        {/* Header e Ferramentas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                Histórico {selectedTimeframe.label}
              </h2>
              {viewMode === 'percent' && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  Modo Comparação %
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted mt-0.5">
              {viewMode === 'percent' 
                ? `Variação percentual acumulada no ${selectedTimeframe.description} (base 0% no 1º dia)`
                : `Variação da cotação no ${selectedTimeframe.description}`}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 animate-fade-in">
            {/* Seletor de Modo: Preço R$ ou Variação % */}
            <div className="flex bg-text/5 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('price')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'price'
                    ? 'bg-primary text-black shadow-lg shadow-primary/20 font-black'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Exibir cotações nominais em R$"
              >
                <DollarSign size={13} />
                <span>Preço (R$)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('percent')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'percent'
                    ? 'bg-primary text-black shadow-lg shadow-primary/20 font-black'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Exibir variação percentual acumulada (%) no mesmo eixo comparativo"
              >
                <Percent size={13} />
                <span>Variação (%)</span>
              </button>
            </div>

            {/* Seletor de Comparação */}
            <div className="flex items-center gap-2 bg-text/5 px-3 py-1.5 rounded-xl border border-border">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wider">Comparar:</span>
              <select
                value={comparePair}
                onChange={(e) => {
                  setComparePair(e.target.value);
                  // Auto-switch or suggest percent mode when comparing
                  if (e.target.value && viewMode === 'price') {
                    setViewMode('percent');
                  }
                }}
                className="bg-transparent border-none text-xs font-bold text-text cursor-pointer focus:outline-none focus:ring-0 select-auto py-0 pr-6 pl-0"
              >
                {COMPARE_OPTIONS.map((opt) => {
                  if (opt.value === pair) return null;
                  return (
                    <option key={opt.value} value={opt.value} className="bg-card text-text font-bold">
                      {opt.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Intervalo de Tempo */}
            <div className="flex bg-text/5 p-1 rounded-xl border border-border">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.days}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTimeframe.days === tf.days
                      ? 'bg-primary text-black shadow-lg shadow-primary/20'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Indicadores de Desempenho e Tendência */}
            <div className="flex flex-wrap items-center gap-2">
              {!loading && data.length > 0 && (
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1 ${
                  trendUp 
                    ? 'text-green-500 bg-green-500/10 border-green-500/10' 
                    : 'text-red-500 bg-red-500/10 border-red-500/10'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {getCurrencyName(pair).split(' ')[0]}: {trendUp ? '↑' : '↓'} {totalPrimaryChangePct >= 0 ? `+${totalPrimaryChangePct.toFixed(2)}%` : `${totalPrimaryChangePct.toFixed(2)}%`}
                </span>
              )}

              {comparePair && !loadingCompare && compareData.length > 0 && (
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1 ${
                  compareTrendUp 
                    ? 'text-green-500 bg-green-500/10 border-green-500/10' 
                    : 'text-red-500 bg-red-500/10 border-red-500/10'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                  {getCurrencyName(comparePair).split(' ')[0]}: {compareTrendUp ? '↑' : '↓'} {totalCompareChangePct >= 0 ? `+${totalCompareChangePct.toFixed(2)}%` : `${totalCompareChangePct.toFixed(2)}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visualização do Gráfico */}
        <div className="relative h-72 sm:h-80 md:h-[360px] w-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-xs z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-text-muted font-mono text-[10px] tracking-widest uppercase">
                  Atualizando dados...
                </span>
              </div>
            </div>
          ) : null}

          {data.length === 0 && !loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-medium">
              Nenhum dado histórico disponível para este período.
            </div>
          ) : (
            <svg 
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible touch-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseMove}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseLeave}
            >
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Linhas de Grade e Valores dos Eixos */}
              {Array.from({ length: 6 }).map((_, k) => {
                const y = paddingYTop + k * (height - paddingYBottom - paddingYTop) / 5;
                const isBoundary = k === 0 || k === 5;
                const strokeOpacity = isBoundary ? "0.15" : "0.05";
                
                // Em modo percentual, ambos os lados usam a mesma escala percentual unificada!
                if (viewMode === 'percent') {
                  const pctVal = maxPct - k * ((maxPct - minPct) / 5);
                  return (
                    <g key={`grid-line-pct-${k}`}>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={width - paddingX} 
                        y2={y} 
                        stroke="currentColor" 
                        strokeOpacity={strokeOpacity} 
                        strokeDasharray={isBoundary ? undefined : "4 4"}
                      />
                      <text 
                        x={10} 
                        y={y + 6} 
                        fontSize={16}
                        fontWeight="bold"
                        className="fill-primary font-mono"
                      >
                        {pctVal >= 0 ? `+${pctVal.toFixed(1)}%` : `${pctVal.toFixed(1)}%`}
                      </text>

                      {comparePair && compareData.length > 0 && !loadingCompare && (
                        <text 
                          x={width - 10} 
                          y={y + 6} 
                          fontSize={16}
                          fontWeight="bold"
                          textAnchor="end"
                          className="fill-[#06B6D4] font-mono"
                        >
                          {pctVal >= 0 ? `+${pctVal.toFixed(1)}%` : `${pctVal.toFixed(1)}%`}
                        </text>
                      )}
                    </g>
                  );
                }

                // Em modo Preço nominal (R$)
                const val = maxPrice - k * ((maxPrice - minPrice) / 5);
                return (
                  <g key={`grid-line-price-${k}`}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={width - paddingX} 
                      y2={y} 
                      stroke="currentColor" 
                      strokeOpacity={strokeOpacity} 
                      strokeDasharray={isBoundary ? undefined : "4 4"}
                    />
                    <text 
                      x={10} 
                      y={y + 6} 
                      fontSize={16}
                      fontWeight="bold"
                      className="fill-primary font-mono"
                    >
                      {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </text>

                    {comparePair && compareData.length > 0 && !loadingCompare && (
                      <text 
                        x={width - 10} 
                        y={y + 6} 
                        fontSize={16}
                        fontWeight="bold"
                        textAnchor="end"
                        className="fill-[#06B6D4] font-mono"
                      >
                        {(compareMaxPrice - k * ((compareMaxPrice - compareMinPrice) / 5)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Linha Zero de Referência (Base 0%) no modo percentual */}
              {viewMode === 'percent' && minPct <= 0 && maxPct >= 0 && (
                <g>
                  <line 
                    x1={paddingX} 
                    y1={getPctY(0)} 
                    x2={width - paddingX} 
                    y2={getPctY(0)} 
                    stroke="currentColor" 
                    strokeOpacity="0.4" 
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <text
                    x={paddingX + 8}
                    y={getPctY(0) - 6}
                    fontSize={11}
                    fontWeight="bold"
                    className="fill-text-muted font-mono"
                  >
                    0.00% (Base Início)
                  </text>
                </g>
              )}

              {/* Área sombreada (ativa no modo Preço) */}
              {viewMode === 'price' && (
                <motion.path
                  key={`area-${selectedTimeframe.days}-${pair}`}
                  d={areaData}
                  fill="url(#gradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              
              {/* Linha da Moeda Principal (Dourado) */}
              <motion.path
                key={`path-${viewMode}-${selectedTimeframe.days}-${pair}`}
                d={pathData}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Linha da Moeda de Comparação (Ciano) */}
              {comparePair && compareData.length > 0 && !loadingCompare && (
                <motion.path
                  key={`compare-path-${viewMode}-${selectedTimeframe.days}-${comparePair}`}
                  d={comparePathData}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              )}

              {/* Rótulos de Data no Eixo X */}
              {dateIndices.map((idx, k) => {
                const item = alignedData[idx];
                if (!item) return null;
                const x = getX(idx);
                return (
                  <text 
                    key={`date-label-${k}`}
                    x={x} 
                    y={height - 15} 
                    fontSize={14}
                    textAnchor="middle"
                    className="fill-text-muted font-mono font-medium"
                  >
                    {item.dateLabel}
                  </text>
                );
              })}

              {/* Linhas e Marcadores ao passar o mouse */}
              {hoveredPoint && (
                <g>
                  <line 
                    x1={hoveredPoint.x} 
                    y1={paddingYTop} 
                    x2={hoveredPoint.x} 
                    y2={height - paddingYBottom} 
                    stroke="currentColor" 
                    strokeOpacity="0.4" 
                    strokeDasharray="4 4" 
                  />
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.primaryY} 
                    r={6} 
                    className="fill-primary"
                  />
                  {hoveredPoint.compareY !== undefined && (
                    <circle 
                      cx={hoveredPoint.x} 
                      cy={hoveredPoint.compareY} 
                      r={6} 
                      className="fill-[#06B6D4]"
                    />
                  )}
                </g>
              )}
            </svg>
          )}

          {/* Tooltip Interativo */}
          {hoveredPoint && (
            <div 
              className="absolute z-20 pointer-events-none bg-card/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-2xl text-xs flex flex-col gap-1.5 min-w-[200px]"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${((hoveredPoint.compareY !== undefined ? Math.min(hoveredPoint.primaryY, hoveredPoint.compareY) : hoveredPoint.primaryY) / height) * 100}%`,
                transform: 'translate(-50%, -125%)'
              }}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-1">
                <span className="text-[10px] text-text-muted font-mono font-bold">
                  {hoveredPoint.fullDate}
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-text/5 text-text-muted">
                  {viewMode === 'percent' ? 'Modo %' : 'Modo R$'}
                </span>
              </div>

              {/* Moeda Principal */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-primary font-bold">{hoveredPoint.primaryLabel.split(' ')[0]}:</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-text font-bold">
                    R$ {hoveredPoint.primaryVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className={`text-[10px] font-bold ${hoveredPoint.primaryPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({hoveredPoint.primaryPct >= 0 ? `+${hoveredPoint.primaryPct.toFixed(2)}%` : `${hoveredPoint.primaryPct.toFixed(2)}%`})
                  </span>
                </div>
              </div>

              {/* Moeda de Comparação */}
              {hoveredPoint.compareVal !== undefined && hoveredPoint.compareLabel && (
                <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                    <span className="text-[#06B6D4] font-bold">{hoveredPoint.compareLabel.split(' ')[0]}:</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-text font-bold">
                      R$ {hoveredPoint.compareVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </span>
                    {hoveredPoint.comparePct !== undefined && (
                      <span className={`text-[10px] font-bold ${hoveredPoint.comparePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({hoveredPoint.comparePct >= 0 ? `+${hoveredPoint.comparePct.toFixed(2)}%` : `${hoveredPoint.comparePct.toFixed(2)}%`})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Diferença / Spread Comparativo */}
              {hoveredPoint.comparePct !== undefined && (
                <div className="mt-1 pt-1 border-t border-border/50 text-[10px] text-text-muted flex items-center justify-between">
                  <span>Diferença / Spread:</span>
                  <span className="font-mono font-bold text-text">
                    {(hoveredPoint.primaryPct - hoveredPoint.comparePct) >= 0 ? '+' : ''}
                    {(hoveredPoint.primaryPct - hoveredPoint.comparePct).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
