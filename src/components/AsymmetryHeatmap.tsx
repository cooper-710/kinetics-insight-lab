import React from 'react';

interface AsymmetryData {
  leftForce: number;
  rightForce: number;
  timestamp: number;
}

interface AsymmetryHeatmapProps {
  data: AsymmetryData[];
}

export const AsymmetryHeatmap: React.FC<AsymmetryHeatmapProps> = ({ data }) => {
  const calculateAsymmetry = (left: number, right: number) => {
    const total = left + right;
    if (total === 0) return 0;
    return Math.abs((left - right) / total) * 100;
  };

  const getAsymmetryColor = (asymmetry: number) => {
    if (asymmetry <= 5) return 'bg-success/20 border-success/40';
    if (asymmetry <= 10) return 'bg-warning/20 border-warning/40';
    return 'bg-destructive/20 border-destructive/40';
  };

  const getAsymmetryLevel = (asymmetry: number) => {
    if (asymmetry <= 5) return 'Normal';
    if (asymmetry <= 10) return 'Moderate';
    return 'High';
  };

  // Sample grid data for visualization
  const gridData = Array.from({ length: 8 }, (_, i) => 
    Array.from({ length: 10 }, (_, j) => {
      const asymmetry = Math.random() * 15; // 0-15% asymmetry
      return {
        x: j,
        y: i,
        asymmetry,
        color: getAsymmetryColor(asymmetry)
      };
    })
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p>No asymmetry data available</p>
          <p className="text-sm">Force plate data needed for asymmetry analysis</p>
        </div>
      </div>
    );
  }

  const avgAsymmetry = data.reduce((sum, d) => 
    sum + calculateAsymmetry(d.leftForce, d.rightForce), 0) / data.length;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Average Asymmetry</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{avgAsymmetry.toFixed(1)}%</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getAsymmetryColor(avgAsymmetry)}`}>
              {getAsymmetryLevel(avgAsymmetry)}
            </span>
          </div>
        </div>
        
        <div className="text-right text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success/40" />
            <span className="text-muted-foreground">Normal (&lt;5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning/40" />
            <span className="text-muted-foreground">Moderate (5-10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/40" />
            <span className="text-muted-foreground">High (&gt;10%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap visualization */}
      <div className="relative">
        <div className="grid grid-cols-10 gap-1 p-4 bg-background-secondary/50 rounded-lg">
          {gridData.flat().map((cell, index) => (
            <div
              key={index}
              className={`aspect-square rounded-sm border ${cell.color} hover:scale-110 transition-all duration-200 cursor-pointer`}
              title={`Asymmetry: ${cell.asymmetry.toFixed(1)}%`}
            />
          ))}
        </div>
        
        {/* Force distribution bars */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Left Leg</span>
              <span className="font-semibold">{data[data.length - 1]?.leftForce || 0}N</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-700"
                style={{ 
                  width: `${((data[data.length - 1]?.leftForce || 0) / 
                    ((data[data.length - 1]?.leftForce || 0) + (data[data.length - 1]?.rightForce || 0))) * 100}%` 
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Right Leg</span>
              <span className="font-semibold">{data[data.length - 1]?.rightForce || 0}N</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-accent h-3 rounded-full transition-all duration-700"
                style={{ 
                  width: `${((data[data.length - 1]?.rightForce || 0) / 
                    ((data[data.length - 1]?.leftForce || 0) + (data[data.length - 1]?.rightForce || 0))) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};