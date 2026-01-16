import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { formatDuration } from '../utils';
import './StatsChart.css';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface StatsChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar';
  height?: number;
  onPointClick?: (point: ChartDataPoint, index: number) => void;
  selectedIndex?: number;
  compact?: boolean;
}

export default function StatsChart({ 
  data, 
  type, 
  height = 160,
  onPointClick,
  selectedIndex,
  compact = false
}: StatsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [mouseInChart, setMouseInChart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Measure container width for proper scaling
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const chartHeight = height - (compact ? 24 : 32); // Leave room for labels
  const padding = { left: 10, right: 10, top: 15, bottom: 5 };
  const plotWidth = containerWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const { maxValue, points, pathD, areaD } = useMemo(() => {
    const max = Math.max(...data.map(d => d.value), 1);
    
    const pts = data.map((d, i) => {
      const x = data.length > 1 
        ? padding.left + (i / (data.length - 1)) * plotWidth
        : containerWidth / 2;
      const y = padding.top + plotHeight - (d.value / max) * plotHeight;
      return { x, y, ...d };
    });
    
    // Create smooth SVG path for line chart
    let pathD = '';
    let areaD = '';
    
    if (type === 'line' && pts.length > 1) {
      // Simple line path
      pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      // Area path for gradient fill
      areaD = `${pathD} L ${pts[pts.length - 1].x} ${padding.top + plotHeight} L ${pts[0].x} ${padding.top + plotHeight} Z`;
    }
    
    return { maxValue: max, points: pts, pathD, areaD };
  }, [data, type, containerWidth, plotWidth, plotHeight, padding.left, padding.top]);

  // Find closest point to mouse x position
  const findClosestPoint = useCallback((mouseX: number): number | null => {
    if (points.length === 0) return null;
    
    let closestIndex = 0;
    let closestDistance = Math.abs(points[0].x - mouseX);
    
    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i].x - mouseX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  }, [points]);

  // Handle mouse move over chart
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const closestIndex = findClosestPoint(mouseX);
    setHoveredIndex(closestIndex);
  }, [findClosestPoint]);

  const handleMouseEnter = useCallback(() => {
    setMouseInChart(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseInChart(false);
    setHoveredIndex(null);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredIndex !== null && onPointClick) {
      onPointClick(data[hoveredIndex], hoveredIndex);
    }
  }, [hoveredIndex, onPointClick, data]);

  if (data.length === 0) {
    return (
      <div className="stats-chart-empty" style={{ height }}>
        <span>No data available</span>
      </div>
    );
  }

  const activeIndex = hoveredIndex !== null ? hoveredIndex : (selectedIndex ?? null);

  return (
    <div 
      ref={containerRef}
      className={`stats-chart ${compact ? 'compact' : ''}`} 
      style={{ height }}
    >
      <svg 
        ref={svgRef}
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${containerWidth} ${chartHeight}`}
        className="stats-chart-svg"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: onPointClick ? 'pointer' : 'crosshair' }}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="chartLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-tertiary)" />
          </linearGradient>
        </defs>

        {type === 'line' && data.length > 1 ? (
          <>
            {/* Area fill */}
            <path
              d={areaD}
              fill="url(#chartAreaGradient)"
              className="chart-area"
            />
            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartLineGradient)"
              strokeWidth={compact ? 2 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line"
            />
            
            {/* Vertical hover line */}
            {mouseInChart && activeIndex !== null && points[activeIndex] && (
              <line
                x1={points[activeIndex].x}
                y1={padding.top}
                x2={points[activeIndex].x}
                y2={padding.top + plotHeight}
                stroke="var(--text-muted)"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="chart-hover-line"
              />
            )}
            
            {/* Points - only show active point prominently */}
            {points.map((point, i) => {
              const isActive = activeIndex === i;
              const baseRadius = compact ? 3 : 4;
              const activeRadius = compact ? 6 : 7;
              
              return (
                <g key={i}>
                  {isActive && (
                    <>
                      {/* Outer glow */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={activeRadius + 4}
                        fill="var(--accent-primary)"
                        opacity="0.15"
                      />
                      {/* Active point */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={activeRadius}
                        fill="var(--accent-primary)"
                        stroke="var(--bg-secondary)"
                        strokeWidth={2}
                        className="chart-point active"
                      />
                    </>
                  )}
                  {/* Small dots for non-active points */}
                  {!isActive && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={baseRadius}
                      fill="var(--accent-primary)"
                      stroke="var(--bg-secondary)"
                      strokeWidth={1.5}
                      className="chart-point"
                      opacity={0.6}
                    />
                  )}
                </g>
              );
            })}
          </>
        ) : (
          /* Bar chart */
          <g className="chart-bars">
            {/* Vertical hover line for bar chart */}
            {mouseInChart && activeIndex !== null && points[activeIndex] && (
              <line
                x1={points[activeIndex].x}
                y1={padding.top}
                x2={points[activeIndex].x}
                y2={padding.top + plotHeight}
                stroke="var(--text-muted)"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="chart-hover-line"
              />
            )}
            
            {points.map((point, i) => {
              const barWidth = Math.max(8, Math.min(40, (plotWidth / data.length) * 0.6));
              const barHeight = (point.value / maxValue) * plotHeight;
              const isActive = activeIndex === i;
              
              return (
                <g key={i}>
                  <rect
                    x={point.x - barWidth / 2}
                    y={padding.top + plotHeight - barHeight}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={3}
                    fill={isActive ? 'var(--accent-primary)' : 'url(#chartLineGradient)'}
                    opacity={isActive ? 1 : 0.65}
                    className="chart-bar"
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Labels - positioned to match data points exactly */}
      <div className="chart-labels" style={{ position: 'relative', height: compact ? 18 : 24 }}>
        {points.map((point, i) => {
          // For month view with many days, only show some labels
          const showLabel = data.length <= 12 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
          
          if (!showLabel) return null;
          
          return (
            <div 
              key={i} 
              className={`chart-label ${activeIndex === i ? 'selected' : ''}`}
              style={{ 
                position: 'absolute',
                left: `${point.x}px`,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {data[i].label}
            </div>
          );
        })}
      </div>

      {/* Tooltip bubble - Garmin style */}
      {mouseInChart && activeIndex !== null && points[activeIndex] && (
        <div 
          className="chart-tooltip-bubble"
          style={{
            left: `${points[activeIndex].x}px`,
            top: `${Math.min(points[activeIndex].y - 10, chartHeight - 60)}px`
          }}
        >
          <div className="tooltip-bubble-header">{data[activeIndex].label}</div>
          <div className="tooltip-bubble-row">
            <span className="tooltip-bubble-dot"></span>
            <span className="tooltip-bubble-value">{formatDuration(data[activeIndex].value)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
