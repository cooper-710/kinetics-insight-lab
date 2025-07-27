import React, { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { athletes, type Athlete } from '@/data/dummyData';

const Index = () => {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  return (
    <Dashboard 
      selectedAthlete={selectedAthlete} 
      onAthleteChange={setSelectedAthlete} 
    />
  );
};

export default Index;
