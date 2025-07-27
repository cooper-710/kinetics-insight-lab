import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricCard } from './MetricCard';
import { ForceTimeChart } from './ForceTimeChart';
import { TrendChart } from './TrendChart';
import { AsymmetryHeatmap } from './AsymmetryHeatmap';
import { athletes, performanceData, historicalData, type Athlete, type ForceMetrics } from '@/data/dummyData';
import { Upload, FileText, Download, TrendingUp } from 'lucide-react';

interface DashboardProps {
  selectedAthlete: Athlete | null;
  onAthleteChange: (athlete: Athlete) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedAthlete, onAthleteChange }) => {
  const [currentSession, setCurrentSession] = useState<ForceMetrics | null>(null);

  // Get athlete's latest performance data
  const athleteData = selectedAthlete 
    ? performanceData.filter(data => data.athleteId === selectedAthlete.id)
    : [];

  const latestPerformance = athleteData.length > 0 ? athleteData[athleteData.length - 1] : null;
  const bestPerformance = athleteData.reduce((best, current) => 
    current.jumpHeight > (best?.jumpHeight || 0) ? current : best, latestPerformance);

  const athleteHistory = selectedAthlete ? historicalData[selectedAthlete.id as keyof typeof historicalData] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent mb-2">
              Sequence Bio Lab Performance
            </h1>
            <p className="text-muted-foreground text-lg">Elite Force Plate Analytics Platform</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedAthlete?.id || ''} onValueChange={(value) => {
              const athlete = athletes.find(a => a.id === value);
              if (athlete) onAthleteChange(athlete);
            }}>
              <SelectTrigger className="w-64 glass-card border-primary/20">
                <SelectValue placeholder="Select Athlete" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map(athlete => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.name} - {athlete.sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
            
            <Button variant="outline" className="glass-card border-primary/20">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {selectedAthlete && latestPerformance ? (
          <div className="space-y-8">
            {/* Athlete Info */}
            <Card className="glass-card p-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedAthlete.name}</h2>
                  <p className="text-muted-foreground">{selectedAthlete.sport} • {selectedAthlete.position}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAthlete.height}cm • {selectedAthlete.weight}kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Latest Session</p>
                  <p className="text-lg font-semibold text-primary">{latestPerformance.sessionDate}</p>
                </div>
              </div>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
              <MetricCard
                title="Jump Height"
                value={latestPerformance.jumpHeight}
                unit="cm"
                trend={athleteHistory.length > 1 ? latestPerformance.jumpHeight - athleteHistory[athleteHistory.length - 2].jumpHeight : 0}
                benchmark={bestPerformance?.jumpHeight || 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="Peak Force"
                value={latestPerformance.peakForce}
                unit="N"
                trend={athleteHistory.length > 1 ? latestPerformance.peakForce - athleteHistory[athleteHistory.length - 2].peakForce : 0}
                benchmark={bestPerformance?.peakForce || 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="RFD"
                value={latestPerformance.rfd}
                unit="N/s"
                trend={athleteHistory.length > 1 ? latestPerformance.rfd - athleteHistory[athleteHistory.length - 2].rfd : 0}
                benchmark={bestPerformance?.rfd || 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="Asymmetry"
                value={latestPerformance.asymmetryIndex}
                unit="%"
                trend={0}
                benchmark={5} // Lower is better for asymmetry
                isLowerBetter={true}
                icon={TrendingUp}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-scale-in">
              {/* Force-Time Curve */}
              <Card className="chart-container">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Force-Time Curve</h3>
                <ForceTimeChart data={latestPerformance.forceTimeData} />
              </Card>

              {/* Performance Trends */}
              <Card className="chart-container">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Performance Trends</h3>
                <TrendChart data={athleteHistory} />
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Session Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumps Analyzed</span>
                    <span className="font-semibold">{athleteData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Jump Height</span>
                    <span className="font-semibold text-success">{bestPerformance?.jumpHeight}cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Contact Time</span>
                    <span className="font-semibold">{latestPerformance.contactTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RSI Modified</span>
                    <span className="font-semibold">{latestPerformance.rsiModified}</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Force Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Left Leg</span>
                      <span className="font-semibold">{latestPerformance.leftLegForce}N</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((latestPerformance.leftLegForce || 0) / latestPerformance.peakForce) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Right Leg</span>
                      <span className="font-semibold">{latestPerformance.rightLegForce}N</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((latestPerformance.rightLegForce || 0) / latestPerformance.peakForce) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Performance Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="indicator-good font-semibold">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fatigue Level</span>
                    <span className="indicator-warning font-semibold">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Asymmetry</span>
                    <span className="indicator-good font-semibold">Normal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trend</span>
                    <span className="indicator-good font-semibold">Improving</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
            <div className="glass-card p-12 max-w-md">
              <FileText className="w-16 h-16 mx-auto mb-4 text-primary animate-glow-pulse" />
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Select an Athlete</h3>
              <p className="text-muted-foreground mb-6">
                Choose an athlete from the dropdown above to view their force plate analytics and performance metrics.
              </p>
              <Button 
                className="btn-primary"
                onClick={() => onAthleteChange(athletes[0])}
              >
                Load Sample Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};