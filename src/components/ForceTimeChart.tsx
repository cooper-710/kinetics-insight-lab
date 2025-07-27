import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForceTimeData {
  time: number;
  force: number;
}

interface ForceTimeChartProps {
  data: ForceTimeData[];
}

export const ForceTimeChart: React.FC<ForceTimeChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: data.map(point => (point.time / 1000).toFixed(2)), // Convert to seconds
    datasets: [
      {
        label: 'Force (N)',
        data: data.map(point => point.force),
        borderColor: 'hsl(200 100% 50%)',
        backgroundColor: 'hsl(200 100% 50% / 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'hsl(200 100% 60%)',
        pointHoverBorderColor: 'hsl(220 30% 8%)',
        pointHoverBorderWidth: 2,
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
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(220 25% 12% / 0.95)',
        titleColor: 'hsl(210 15% 95%)',
        bodyColor: 'hsl(210 15% 95%)',
        borderColor: 'hsl(200 100% 50%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => `Time: ${context[0].label}s`,
          label: (context: any) => `Force: ${Math.round(context.parsed.y)}N`,
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
          maxTicksLimit: 8,
        },
        title: {
          display: true,
          text: 'Time (seconds)',
          color: 'hsl(210 15% 95%)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        grid: {
          color: 'hsl(220 20% 25% / 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(210 10% 65%)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return Math.round(value) + 'N';
          },
        },
        title: {
          display: true,
          text: 'Force (N)',
          color: 'hsl(210 15% 95%)',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
        },
        min: 0,
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="relative h-[280px] w-full">
      <Line ref={chartRef} data={chartData} options={options} />
      
      {/* Phase annotations */}
      <div className="absolute top-2 right-2 text-xs space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/20 to-primary/60" />
          <span>Force Production</span>
        </div>
      </div>
      
      {/* Key metrics overlay */}
      <div className="absolute bottom-2 left-2 text-xs space-y-1 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
        <div className="text-muted-foreground">Peak: <span className="text-primary font-semibold">{Math.max(...data.map(d => d.force)).toFixed(0)}N</span></div>
        <div className="text-muted-foreground">Duration: <span className="text-primary font-semibold">{(Math.max(...data.map(d => d.time)) / 1000).toFixed(2)}s</span></div>
      </div>
    </div>
  );
};