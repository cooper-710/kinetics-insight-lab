import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: number;
  benchmark?: number;
  isLowerBetter?: boolean;
  icon: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend = 0,
  benchmark = 0,
  isLowerBetter = false,
  icon: Icon
}) => {
  const formatValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'k';
    }
    return val.toFixed(1);
  };

  const getTrendColor = () => {
    if (trend === 0) return 'text-muted-foreground';
    const isPositive = trend > 0;
    if (isLowerBetter) {
      return isPositive ? 'indicator-poor' : 'indicator-good';
    }
    return isPositive ? 'indicator-good' : 'indicator-warning';
  };

  const getPerformanceStatus = () => {
    if (benchmark === 0) return 'text-muted-foreground';
    const ratio = value / benchmark;
    
    if (isLowerBetter) {
      if (ratio <= 0.5) return 'indicator-good';
      if (ratio <= 0.8) return 'indicator-warning';
      return 'indicator-poor';
    } else {
      if (ratio >= 0.95) return 'indicator-good';
      if (ratio >= 0.85) return 'indicator-warning';
      return 'indicator-poor';
    }
  };

  return (
    <Card className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend !== 0 && (
          <div className={`flex items-center text-sm ${getTrendColor()}`}>
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {isLowerBetter ? Math.abs(trend) : trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatValue(value)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        {benchmark > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              vs Personal Best: {formatValue(benchmark)}{unit}
            </span>
            <span className={getPerformanceStatus()}>
              {((value / benchmark) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Progress bar for visual comparison */}
      {benchmark > 0 && (
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-700 ${
                value >= benchmark ? 'bg-gradient-to-r from-primary to-primary-glow' : 'bg-warning'
              }`}
              style={{ 
                width: `${Math.min((value / benchmark) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};