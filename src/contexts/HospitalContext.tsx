import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Hospital {
  id: string;
  name: string;
  city: string;
  zipcode: string;
  address: string | null;
  phone: string | null;
}

interface HospitalContextType {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;
  loading: boolean;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching hospitals:', error);
      } else {
        setHospitals(data || []);
        // Set first hospital as default if none selected
        if (data && data.length > 0 && !selectedHospital) {
          const saved = localStorage.getItem('selectedHospitalId');
          const found = data.find(h => h.id === saved);
          setSelectedHospital(found || data[0]);
        }
      }
      setLoading(false);
    };

    fetchHospitals();
  }, []);

  const handleSetSelectedHospital = (hospital: Hospital | null) => {
    setSelectedHospital(hospital);
    if (hospital) {
      localStorage.setItem('selectedHospitalId', hospital.id);
    }
  };

  return (
    <HospitalContext.Provider value={{ 
      hospitals, 
      selectedHospital, 
      setSelectedHospital: handleSetSelectedHospital, 
      loading 
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
