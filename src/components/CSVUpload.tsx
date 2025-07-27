import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ForceMetrics, Athlete } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  selectedAthlete: Athlete | null;
  onDataUploaded: (data: ForceMetrics) => void;
}

interface CSVRow {
  [key: string]: string;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ selectedAthlete, onDataUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<CSVRow[] | null>(null);
  const [sessionType, setSessionType] = useState<'Jump' | 'Isometric' | 'Landing'>('Jump');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV parsing error",
            description: "There was an error reading your CSV file. Please check the format.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        setUploadedData(results.data as CSVRow[]);
        setIsProcessing(false);
        toast({
          title: "CSV uploaded successfully",
          description: `Loaded ${results.data.length} data points.`,
        });
      },
      error: (error) => {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      },
    });
  };

  const processCSVData = (data: CSVRow[]): ForceMetrics => {
    // Generate force-time curve from CSV data
    const forceTimeData = data.map((row, index) => ({
      time: parseFloat(row.time || row.Time || (index * 5).toString()), // Default 5ms intervals
      force: parseFloat(row.force || row.Force || row.vertical_force || '0')
    }));

    // Calculate metrics from the data
    const forces = forceTimeData.map(d => d.force);
    const peakForce = Math.max(...forces);
    const baselineForce = 800; // Approximate bodyweight
    
    // Calculate RFD (Rate of Force Development)
    const forceIncreaseStart = forceTimeData.findIndex(d => d.force > baselineForce * 1.1);
    const peakIndex = forces.indexOf(peakForce);
    const timeToPeak = forceTimeData[peakIndex].time - forceTimeData[forceIncreaseStart].time;
    const rfd = (peakForce - baselineForce) / (timeToPeak / 1000); // N/s

    // Calculate impulse (area under curve)
    let impulse = 0;
    for (let i = 1; i < forceTimeData.length; i++) {
      const dt = (forceTimeData[i].time - forceTimeData[i-1].time) / 1000;
      const avgForce = (forceTimeData[i].force + forceTimeData[i-1].force) / 2;
      impulse += avgForce * dt;
    }

    // Estimate jump height from impulse and bodyweight
    const bodyWeight = selectedAthlete?.weight || 75; // kg
    const netImpulse = impulse - (baselineForce * (forceTimeData[forceTimeData.length - 1].time / 1000));
    const velocity = netImpulse / bodyWeight;
    const jumpHeight = (velocity * velocity) / (2 * 9.81) * 100; // cm

    // Find flight time and contact time
    const takeOffIndex = forceTimeData.findIndex((d, i) => 
      i > peakIndex && d.force < 50
    );
    const contactTime = takeOffIndex > 0 ? forceTimeData[takeOffIndex].time : 500;
    const flightTime = jumpHeight > 0 ? Math.sqrt(8 * jumpHeight / 981) * 1000 : 0; // ms

    // Calculate asymmetry (mock data for now)
    const leftLegForce = peakForce * (0.48 + Math.random() * 0.08); // 45-53% of total
    const rightLegForce = peakForce - leftLegForce;
    const asymmetryIndex = Math.abs(leftLegForce - rightLegForce) / peakForce * 100;

    return {
      id: `uploaded-${Date.now()}`,
      athleteId: selectedAthlete?.id || 'unknown',
      sessionDate: new Date().toISOString().split('T')[0],
      jumpHeight: Math.max(0, jumpHeight),
      peakForce,
      rfd,
      impulse: impulse / 1000, // Convert to N⋅s
      asymmetryIndex,
      flightTime,
      contactTime,
      rsiModified: flightTime > 0 ? contactTime / flightTime : 0,
      forceTimeData,
      leftLegForce,
      rightLegForce,
    };
  };

  const handleProcessData = () => {
    if (!uploadedData || !selectedAthlete) {
      toast({
        title: "Missing data",
        description: "Please select an athlete and upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const processedData = processCSVData(uploadedData);
      onDataUploaded(processedData);
      
      toast({
        title: "Data processed successfully",
        description: `Added new ${sessionType.toLowerCase()} session for ${selectedAthlete.name}.`,
      });
      
      setIsOpen(false);
      setUploadedData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Unable to process the CSV data. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Upload className="w-4 h-4 mr-2" />
          Upload Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Force Plate Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Athlete Selection */}
          <div className="space-y-2">
            <Label htmlFor="athlete">Selected Athlete</Label>
            <div className="text-sm text-muted-foreground">
              {selectedAthlete ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {selectedAthlete.name} - {selectedAthlete.sport}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  No athlete selected
                </div>
              )}
            </div>
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jump">Jump Test</SelectItem>
                <SelectItem value="Isometric">Isometric Pull</SelectItem>
                <SelectItem value="Landing">Landing Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-upload">CSV File</Label>
            <div className="space-y-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="cursor-pointer"
              />
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  Processing CSV file...
                </div>
              )}

              {uploadedData && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  CSV loaded: {uploadedData.length} data points
                </div>
              )}
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="p-4 bg-muted/20 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Expected CSV Format:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <strong>time</strong> (or Time): Time in milliseconds</p>
              <p>• <strong>force</strong> (or Force, vertical_force): Force in Newtons</p>
              <p>• Headers in first row, data starting from row 2</p>
              <p>• Example: Hawkins Dynamics export format</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessData}
              disabled={!uploadedData || !selectedAthlete}
              className="flex-1 btn-primary"
            >
              <FileText className="w-4 h-4 mr-2" />
              Process Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};