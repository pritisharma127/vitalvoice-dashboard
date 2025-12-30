import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Search, Phone, MapPin, Droplet, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
type BloodTypeFilter = typeof bloodTypes[number];

interface Donor {
  id: string;
  name: string;
  phone_number: string;
  blood_type: string;
  zipcode: string;
  area: string | null;
  city: string;
  is_available: boolean;
  distance_km?: number | null;
  distance_text?: string | null;
}

const Donors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchZip, setSearchZip] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<BloodTypeFilter>('All');
  const [proximitySearch, setProximitySearch] = useState(false);
  const { toast } = useToast();

  const fetchDonors = async () => {
    setLoading(true);
    
    // Use proximity search if enabled and zipcode is provided
    if (proximitySearch && searchZip) {
      try {
        const { data, error } = await supabase.functions.invoke('search-donors-nearby', {
          body: { 
            searchZipcode: searchZip,
            bloodType: bloodTypeFilter,
            limit: 50
          }
        });

        if (error) {
          console.error('Proximity search error:', error);
          toast({
            title: 'Search Error',
            description: 'Failed to search by proximity. Falling back to regular search.',
            variant: 'destructive'
          });
          // Fall back to regular search
          await regularSearch();
          return;
        }

        if (data?.donors) {
          setDonors(data.donors);
        } else {
          setDonors([]);
        }
      } catch (err) {
        console.error('Proximity search error:', err);
        await regularSearch();
      }
    } else {
      await regularSearch();
    }
    
    setLoading(false);
  };

  const regularSearch = async () => {
    let query = supabase
      .from('donors')
      .select('id, name, phone_number, blood_type, zipcode, area, city, is_available')
      .eq('is_available', true);

    if (searchZip) {
      query = query.ilike('zipcode', `%${searchZip}%`);
    }
    if (searchArea) {
      query = query.ilike('area', `%${searchArea}%`);
    }
    if (bloodTypeFilter !== 'All') {
      query = query.eq('blood_type', bloodTypeFilter as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-');
    }

    const { data, error } = await query.order('name').limit(50);
    if (!error && data) {
      setDonors(data);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSearch = () => fetchDonors();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-primary" />
            Search Donors
          </h1>
          <p className="text-muted-foreground">Find available blood donors by location or blood type</p>
        </div>

        {/* Search Filters */}
        <div className="blood-card p-4 mb-6">
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <Input 
              placeholder="Zipcode" 
              value={searchZip} 
              onChange={(e) => setSearchZip(e.target.value)} 
            />
            <Input 
              placeholder="Area name" 
              value={searchArea} 
              onChange={(e) => setSearchArea(e.target.value)}
              disabled={proximitySearch}
            />
            <Select value={bloodTypeFilter} onValueChange={(v) => setBloodTypeFilter(v as BloodTypeFilter)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border border-border">
                {bloodTypes.map(bt => (
                  <SelectItem key={bt} value={bt}>
                    {bt === 'All' ? 'All Blood Types' : bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="medical-gradient">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
          
          {/* Proximity Search Toggle */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <Switch 
              id="proximity-search" 
              checked={proximitySearch}
              onCheckedChange={setProximitySearch}
            />
            <Label htmlFor="proximity-search" className="flex items-center gap-2 cursor-pointer">
              <Navigation className="w-4 h-4 text-primary" />
              Sort by proximity to zipcode
            </Label>
            {proximitySearch && !searchZip && (
              <span className="text-xs text-muted-foreground">(Enter zipcode to use)</span>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No donors found matching your criteria.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donors.map(donor => (
              <div key={donor.id} className="blood-card-hover p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{donor.name}</h3>
                  <Badge variant="secondary" className="bg-blood-light text-blood font-bold">
                    <Droplet className="w-3 h-3 mr-1" />
                    {donor.blood_type}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {donor.phone_number}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {donor.area || donor.zipcode}, {donor.city}
                  </div>
                  {donor.distance_text && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Navigation className="w-4 h-4" />
                      {donor.distance_text} away
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Donors;
