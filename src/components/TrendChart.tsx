import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  date: string;
  jumpHeight: number;
  peakForce: number;
  rfd: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = {
    labels: data.map(d => formatDate(d.date)),
    datasets: [
      {
        label: 'Jump Height (cm)',
        data: data.map(d => d.jumpHeight),
        borderColor: 'hsl(200 100% 50%)',
        backgroundColor: 'hsl(200 100% 50%)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'hsl(200 100% 50%)',
        pointBorderColor: 'hsl(220 30% 8%)',
        pointBorderWidth: 2,
        tension: 0.2,
        yAxisID: 'y',
      },
      {
        label: 'Peak Force (kN)',
        data: data.map(d => d.peakForce / 1000), // Convert to kN for better scale
        borderColor: 'hsl(280 60% 55%)',
        backgroundColor: 'hsl(280 60% 55%)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'hsl(280 60% 55%)',
        pointBorderColor: 'hsl(220 30% 8%)',
        pointBorderWidth: 2,
        tension: 0.2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'hsl(210 15% 95%)',
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'hsl(220 25% 12% / 0.95)',
        titleColor: 'hsl(210 15% 95%)',
        bodyColor: 'hsl(210 15% 95%)',
        borderColor: 'hsl(200 100% 50%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => `Session: ${context[0].label}`,
          label: (context: any) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel.includes('Force')) {
              return `${datasetLabel}: ${value.toFixed(1)} kN`;
            }
            return `${datasetLabel}: ${value.toFixed(1)} cm`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(220 20% 25% / 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(210 10% 65%)',
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: 'Session Date',
          color: 'hsl(210 15% 95%)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'hsl(220 20% 25% / 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(200 100% 50%)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + ' cm';
          },
        },
        title: {
          display: true,
          text: 'Jump Height (cm)',
          color: 'hsl(200 100% 50%)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'hsl(280 60% 55%)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + ' kN';
          },
        },
        title: {
          display: true,
          text: 'Peak Force (kN)',
          color: 'hsl(280 60% 55%)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 10,
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No trend data available</p>
          <p className="text-sm">Complete more sessions to see performance trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[280px] w-full">
      <Line data={chartData} options={options} />
      
      {/* Trend indicators */}
      <div className="absolute top-2 right-2 text-xs">
        {data.length > 1 && (
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Trend:</span>
              {data[data.length - 1].jumpHeight > data[0].jumpHeight ? (
                <span className="indicator-good">↗ Improving</span>
              ) : (
                <span className="indicator-warning">↘ Declining</span>
              )}
            </div>
            <div className="text-muted-foreground">
              Sessions: {data.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};