// Dummy data for NextGen Performance analytics

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  position?: string;
  dateOfBirth: string;
  height: number; // cm
  weight: number; // kg
}

export interface ForceMetrics {
  id: string;
  athleteId: string;
  sessionDate: string;
  jumpHeight: number; // cm
  peakForce: number; // N
  rfd: number; // N/s (Rate of Force Development)
  impulse: number; // N⋅s
  asymmetryIndex: number; // %
  flightTime: number; // ms
  contactTime: number; // ms
  rsiModified: number; // Reactive Strength Index
  forceTimeData: Array<{ time: number; force: number }>; // Force-time curve
  leftLegForce?: number; // N
  rightLegForce?: number; // N
}

export interface Session {
  id: string;
  athleteId: string;
  date: string;
  type: 'Jump' | 'Isometric' | 'Landing';
  metrics: ForceMetrics[];
  notes?: string;
  fatigue?: number; // 1-10 scale
}

// Sample athletes
export const athletes: Athlete[] = [
  {
    id: 'athlete-1',
    name: 'Marcus Thompson',
    sport: 'Basketball',
    position: 'Point Guard',
    dateOfBirth: '1998-03-15',
    height: 188,
    weight: 82
  },
  {
    id: 'athlete-2',
    name: 'Sarah Chen',
    sport: 'Volleyball',
    position: 'Outside Hitter',
    dateOfBirth: '2000-07-22',
    height: 180,
    weight: 68
  },
  {
    id: 'athlete-3',
    name: 'Jake Rodriguez',
    sport: 'Football',
    position: 'Wide Receiver',
    dateOfBirth: '1999-11-08',
    height: 185,
    weight: 88
  }
];

// Generate realistic force-time curve data
const generateForceTimeData = (peakForce: number, jumpType: 'countermovement' | 'squat' = 'countermovement') => {
  const data: Array<{ time: number; force: number }> = [];
  const totalTime = jumpType === 'countermovement' ? 2000 : 1500; // ms
  const timeStep = 5; // ms
  
  for (let t = 0; t <= totalTime; t += timeStep) {
    let force = 0;
    
    if (jumpType === 'countermovement') {
      // Countermovement jump pattern
      if (t < 200) {
        force = 800 + Math.random() * 50; // Baseline bodyweight
      } else if (t < 600) {
        // Unloading phase
        force = 800 - ((t - 200) / 400) * 300 + Math.random() * 30;
      } else if (t < 1000) {
        // Loading phase
        force = 500 + ((t - 600) / 400) * (peakForce - 500) + Math.random() * 40;
      } else if (t < 1200) {
        // Take-off
        force = peakForce - ((t - 1000) / 200) * peakForce + Math.random() * 20;
      } else {
        // Flight
        force = 0;
      }
    } else {
      // Squat jump pattern
      if (t < 300) {
        force = 800 + Math.random() * 40;
      } else if (t < 800) {
        force = 800 + ((t - 300) / 500) * (peakForce - 800) + Math.random() * 30;
      } else if (t < 1000) {
        force = peakForce - ((t - 800) / 200) * peakForce + Math.random() * 15;
      } else {
        force = 0;
      }
    }
    
    data.push({ time: t, force: Math.max(0, force) });
  }
  
  return data;
};

// Sample performance data
export const performanceData: ForceMetrics[] = [
  {
    id: 'session-1-jump-1',
    athleteId: 'athlete-1',
    sessionDate: '2024-01-15',
    jumpHeight: 65.2,
    peakForce: 2450,
    rfd: 8200,
    impulse: 385,
    asymmetryIndex: 4.2,
    flightTime: 650,
    contactTime: 420,
    rsiModified: 1.55,
    leftLegForce: 1220,
    rightLegForce: 1230,
    forceTimeData: generateForceTimeData(2450)
  },
  {
    id: 'session-1-jump-2',
    athleteId: 'athlete-1',
    sessionDate: '2024-01-15',
    jumpHeight: 67.8,
    peakForce: 2580,
    rfd: 8750,
    impulse: 398,
    asymmetryIndex: 3.8,
    flightTime: 665,
    contactTime: 410,
    rsiModified: 1.62,
    leftLegForce: 1285,
    rightLegForce: 1295,
    forceTimeData: generateForceTimeData(2580)
  },
  {
    id: 'session-2-jump-1',
    athleteId: 'athlete-2',
    sessionDate: '2024-01-16',
    jumpHeight: 58.4,
    peakForce: 1980,
    rfd: 7200,
    impulse: 320,
    asymmetryIndex: 6.1,
    flightTime: 615,
    contactTime: 380,
    rsiModified: 1.62,
    leftLegForce: 930,
    rightLegForce: 1050,
    forceTimeData: generateForceTimeData(1980)
  }
];

// Historical trend data
export const historicalData = {
  'athlete-1': [
    { date: '2024-01-01', jumpHeight: 62.1, peakForce: 2320, rfd: 7800 },
    { date: '2024-01-05', jumpHeight: 64.3, peakForce: 2380, rfd: 8100 },
    { date: '2024-01-10', jumpHeight: 65.8, peakForce: 2420, rfd: 8300 },
    { date: '2024-01-15', jumpHeight: 67.8, peakForce: 2580, rfd: 8750 },
    { date: '2024-01-20', jumpHeight: 66.2, peakForce: 2510, rfd: 8400 }
  ],
  'athlete-2': [
    { date: '2024-01-02', jumpHeight: 55.2, peakForce: 1850, rfd: 6800 },
    { date: '2024-01-08', jumpHeight: 56.8, peakForce: 1920, rfd: 7000 },
    { date: '2024-01-16', jumpHeight: 58.4, peakForce: 1980, rfd: 7200 }
  ]
};