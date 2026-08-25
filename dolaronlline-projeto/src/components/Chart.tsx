import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
    const loadHistory = async () => {
      setLoading(true);
      try {
        const history = await fetchHistory(pair, selectedTimeframe.days);
        setData(history.reverse());
      } catch (err) {
        console.error("Error loading primary history", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
    setHoveredPoint(null); // Clear tooltips when switching pairs or ranges
  }, [pair, selectedTimeframe]);

  // Load Comparison Data
  useEffect(() => {
    const loadCompareHistory = async () => {
      if (!comparePair) {
        setCompareData([]);
        return;
      }
      setLoadingCompare(true);
      try {
        const history = await fetchHistory(comparePair, selectedTimeframe.days);
        setCompareData(history.reverse());
      } catch (err) {
        console.error("Error loading comparison history", err);
      } finally {
        setLoadingCompare(false);
      }
    };
    loadCompareHistory();
    setHoveredPoint(null); // Clear tooltips when switching comparison
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
    
    // Carry over state calculations to interpolate weekends/fiat trading schedule differences
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
      
      alignedData.push({
        dateKey: key,
        dateLabel: label,
        originalPrimary: entry.primary,
        originalCompare: entry.compare,
        primaryBid,
        compareBid,
      });
    });
  }

  // Range and math calculations
  const primaryPoints = alignedData.map(d => d.primaryBid);
  const min = primaryPoints.length > 0 ? Math.min(...primaryPoints) : 0;
  const max = primaryPoints.length > 0 ? Math.max(...primaryPoints) : 0;
  const range = max - min || 1;

  const comparePoints = comparePair && compareData.length > 0 
    ? alignedData.filter(d => d.compareBid !== undefined).map(d => d.compareBid as number)
    : [];
  const compareMin = comparePoints.length > 0 ? Math.min(...comparePoints) : 0;
  const compareMax = comparePoints.length > 0 ? Math.max(...comparePoints) : 0;
  const compareRange = compareMax - compareMin || 1;

  // Trend determination: last imported item is latest date, first imported is earliest
  const trendUp = alignedData.length > 1 ? alignedData[alignedData.length - 1].primaryBid >= alignedData[0].primaryBid : true;
  const compareTrendUp = alignedData.length > 1 && alignedData[alignedData.length - 1].compareBid !== undefined ? alignedData[alignedData.length - 1].compareBid! >= alignedData[0].compareBid! : true;

  const width = 800;
  const height = 360;
  const paddingX = 100;
  const paddingYTop = 35;
  const paddingYBottom = 55;

  const getX = (index: number) => {
    if (alignedData.length <= 1) return paddingX;
    return (index / (alignedData.length - 1)) * (width - paddingX * 2) + paddingX;
  };

  const getY = (val: number) => height - paddingYBottom - ((val - min) / range) * (height - paddingYBottom - paddingYTop);
  const getCompareY = (val: number) => height - paddingYBottom - ((val - compareMin) / compareRange) * (height - paddingYBottom - paddingYTop);

  const pathData = alignedData.length > 0 
    ? alignedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.primaryBid)}`).join(' ')
    : '';

  const areaData = alignedData.length > 0
    ? `${pathData} L ${getX(alignedData.length - 1)} ${height - paddingYBottom} L ${getX(0)} ${height - paddingYBottom} Z`
    : '';

  const comparePathData = comparePair && compareData.length > 0 && alignedData.length > 0
    ? alignedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getCompareY(d.compareBid!)}`).join(' ')
    : '';

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

    // Relative mouse X position inside client width of the SVG
    const relativeX = clientX - rect.left;
    const percentX = relativeX / rect.width;
    
    // Convert to native SVG coordinates space (width = 800)
    const svgX = percentX * width;
    
    // Calculate relative index inside the plotting width
    const chartWidth = width - paddingX * 2;
    const adjustedX = svgX - paddingX;
    
    let index = Math.round((adjustedX / chartWidth) * (alignedData.length - 1));
    if (index < 0) index = 0;
    if (index >= alignedData.length) index = alignedData.length - 1;
    
    const d = alignedData[index];
    if (d) {
      const primaryVal = d.primaryBid;
      const x = getX(index);
      const primaryY = getY(primaryVal);
      
      let compareY: number | undefined = undefined;
      let compareVal: number | undefined = undefined;
      
      if (comparePair && d.compareBid !== undefined) {
        compareVal = d.compareBid;
        compareY = getCompareY(compareVal);
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
    <section className="py-12">
      <div className="p-8 rounded-[2rem] bg-card border border-border relative overflow-hidden">
        {/* Header and tools */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              Histórico {selectedTimeframe.label}
            </h2>
            <p className="text-sm text-text-muted">
              Variação da cotação no {selectedTimeframe.description}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 animate-fade-in">
            {/* Currency Comparison Selector */}
            <div className="flex items-center gap-2 bg-text/5 px-3 py-1.5 rounded-xl border border-border">
              <span className="text-[10px] font-black uppercase text-text-muted tracking-wider">Comparar:</span>
              <select
                value={comparePair}
                onChange={(e) => setComparePair(e.target.value)}
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

            {/* Custom select/pill-group */}
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

            {/* Dynamic Trend Indicators */}
            <div className="flex flex-wrap items-center gap-2">
              {!loading && data.length > 0 && (
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                  trendUp 
                    ? 'text-green-500 bg-green-500/10 border-green-500/10' 
                    : 'text-red-500 bg-red-500/10 border-red-500/10'
                }`}>
                  {getCurrencyName(pair).split(' ')[0]}: {trendUp ? '↑' : '↓'}
                </span>
              )}

              {comparePair && !loadingCompare && compareData.length > 0 && (
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                  compareTrendUp 
                    ? 'text-green-500 bg-green-500/10 border-green-500/10' 
                    : 'text-red-500 bg-red-500/10 border-red-500/10'
                }`}>
                  {getCurrencyName(comparePair).split(' ')[0]}: {compareTrendUp ? '↑' : '↓'}
                </span>
              )}

              {comparePair && loadingCompare && (
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg border bg-text/5 text-text-muted border-border animate-pulse">
                  Carregando...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart View with loading state overlay */}
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
              
              {/* Dynamic Grid lines & Price labels (Left for main, Right for comparison) */}
              {Array.from({ length: 6 }).map((_, k) => {
                const val = max - k * ((max - min) / 5);
                const y = paddingYTop + k * (height - paddingYBottom - paddingYTop) / 5;
                const isBoundary = k === 0 || k === 5;
                const strokeOpacity = isBoundary ? "0.15" : "0.05";
                
                return (
                  <g key={`grid-line-${k}`}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={width - paddingX} 
                      y2={y} 
                      stroke="currentColor" 
                      strokeOpacity={strokeOpacity} 
                      strokeDasharray={isBoundary ? undefined : "4 4"}
                    />
                    
                    {/* Primary axis value labels on left */}
                    <text 
                      x={10} 
                      y={y + 6} 
                      fontSize={18}
                      fontWeight="bold"
                      className="fill-primary font-mono"
                    >
                      {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </text>

                    {/* Comparison axis value labels on right (Cyan) */}
                    {comparePair && compareData.length > 0 && !loadingCompare && (
                      <text 
                        x={width - 10} 
                        y={y + 6} 
                        fontSize={18}
                        fontWeight="bold"
                        textAnchor="end"
                        className="fill-[#06B6D4] font-mono"
                      >
                        {(compareMax - k * ((compareMax - compareMin) / 5)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </text>
                    )}
                  </g>
                );
              })}

              <motion.path
                key={`area-${selectedTimeframe.days}-${pair}`}
                d={areaData}
                fill="url(#gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              <motion.path
                key={`path-${selectedTimeframe.days}-${pair}`}
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

              {/* Secondary currency curve line (Cyan) */}
              {comparePair && compareData.length > 0 && !loadingCompare && (
                <motion.path
                  key={`compare-path-${selectedTimeframe.days}-${comparePair}`}
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

              {/* Dynamic Axis Dates rendering */}
              {!loading && alignedData.length > 0 && dateIndices.map((dataIndex, idx) => {
                const d = alignedData[dataIndex];
                if (!d) return null;
                const x = getX(dataIndex);
                return (
                  <text
                    key={`chart-date-${idx}`}
                    x={x}
                    y={height - 18}
                    textAnchor="middle"
                    fontSize={18}
                    fontWeight="bold"
                    className="fill-text-muted font-mono"
                  >
                    {d.dateLabel}
                  </text>
                );
              })}

              {/* Tooltip guidelines inside SVG */}
              {hoveredPoint && (
                <g>
                  <line 
                    x1={hoveredPoint.x} 
                    y1={paddingYTop} 
                    x2={hoveredPoint.x} 
                    y2={height - paddingYBottom} 
                    stroke="#D4AF37" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    opacity="0.6"
                  />
                  
                  {/* Primary marker */}
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.primaryY} 
                    r="8" 
                    fill="#D4AF37" 
                    opacity="0.3"
                  />
                  <circle 
                    cx={hoveredPoint.x} 
                    cy={hoveredPoint.primaryY} 
                    r="4" 
                    fill="#D4AF37"
                    stroke="white"
                    strokeWidth="1.5"
                  />

                  {/* Comparison marker */}
                  {hoveredPoint.compareY !== undefined && (
                    <>
                      <circle 
                        cx={hoveredPoint.x} 
                        cy={hoveredPoint.compareY} 
                        r="8" 
                        fill="#06B6D4" 
                        opacity="0.3"
                      />
                      <circle 
                        cx={hoveredPoint.x} 
                        cy={hoveredPoint.compareY} 
                        r="4" 
                        fill="#06B6D4"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </g>
              )}
            </svg>
          )}

          {/* Interactive HTML Tooltip Absolute overlay */}
          <AnimatePresence>
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute pointer-events-none z-20 bg-background/95 backdrop-blur-md border border-primary/40 px-4 py-2.5 rounded-2xl shadow-xl min-w-[185px] max-w-[280px] text-left animate-fade-in"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${((hoveredPoint.compareY !== undefined ? Math.min(hoveredPoint.primaryY, hoveredPoint.compareY) : hoveredPoint.primaryY) / height) * 100}%`,
                  transform: 'translate(-50%, calc(-100% - 15px))'
                }}
              >
                <div className="text-[10px] uppercase font-black text-text-muted tracking-wider border-b border-border pb-1.5 mb-1.5 font-mono">
                  {hoveredPoint.fullDate}
                </div>
                
                {/* Primary currency output */}
                <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                  <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {hoveredPoint.primaryLabel.split(' ')[0]}
                  </span>
                  <span className="font-mono text-primary font-black">
                    {hoveredPoint.primaryVal.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL', 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 4 
                    })}
                  </span>
                </div>

                {/* Compare currency output */}
                {hoveredPoint.compareVal !== undefined && hoveredPoint.compareLabel && (
                  <div className="flex items-center justify-between gap-4 text-xs font-semibold mt-1 border-t border-border/50 pt-1">
                    <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                      {hoveredPoint.compareLabel.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[#06B6D4] font-black">
                      {hoveredPoint.compareVal.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL', 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 4 
                      })}
                    </span>
                  </div>
                )}
                
                {/* Visual tooltip pop arrow indicator */}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-r border-b border-primary/40 rotate-45 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
