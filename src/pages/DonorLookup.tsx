import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTip } from '@/components/InfoTip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  Droplet, 
  Calendar,
  Building2,
  Route,
  CheckCircle2,
  Mail,
  Clock,
  Heart
} from 'lucide-react';

interface DonorDetails {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  blood_type: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  age?: number;
  is_available?: boolean;
  last_donation_date?: string;
  area?: string;
}

interface CallTransaction {
  id: string;
  campaign_id: string;
  donor_id: string;
  call_id?: string;
  availability?: string;
  donor_selected?: string;
  hospital_location: string;
  urgency: string;
  reason?: string;
  current_location?: string;
  pincode?: string;
  created_at: string;
}

interface DistanceInfo {
  distance: string;
  duration: string;
}

const DonorLookup: React.FC = () => {
  const [campaignId, setCampaignId] = useState('');
  const [loading, setLoading] = useState(false);
  const [donor, setDonor] = useState<DonorDetails | null>(null);
  const [transaction, setTransaction] = useState<CallTransaction | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const { toast } = useToast();

  const calculateDistance = async (origin: string, destination: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-distance', {
        body: { origin, destination },
      });
      
      if (error) throw error;
      
      if (data?.distance && data?.duration) {
        setDistanceInfo({
          distance: data.distance,
          duration: data.duration,
        });
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Don't show error toast, just skip distance calculation
    }
  };

  const searchDonor = async () => {
    if (!campaignId.trim()) {
      toast({ title: 'Error', description: 'Please enter a campaign ID', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setDonor(null);
    setTransaction(null);
    setDistanceInfo(null);

    try {
      // Find the shortlisted donor from call_transactions
      const { data: transactions, error: txError } = await supabase
        .from('call_transactions')
        .select('*')
        .eq('campaign_id', campaignId.trim())
        .or('donor_selected.ilike.yes,donor_selected.ilike.selected,availability.ilike.yes')
        .limit(1);

      if (txError) throw txError;

      if (!transactions || transactions.length === 0) {
        toast({ 
          title: 'No shortlisted donor found', 
          description: 'No donor has been selected for this campaign yet',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const tx = transactions[0];
      setTransaction(tx);

      // Fetch full donor details
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .eq('id', tx.donor_id)
        .maybeSingle();

      if (donorError) throw donorError;

      if (donorData) {
        setDonor(donorData);
        
        // Calculate distance from donor to hospital
        const donorAddress = tx.current_location || `${donorData.address}, ${donorData.city}, ${donorData.zipcode}`;
        await calculateDistance(donorAddress, tx.hospital_location);
      }

      toast({ title: 'Donor found!', description: `Found shortlisted donor for campaign` });
    } catch (error) {
      console.error('Error searching donor:', error);
      toast({ title: 'Error', description: 'Failed to search for donor', variant: 'destructive' });
    }

    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-destructive text-destructive-foreground';
      case 'within_3_hours': return 'bg-orange-500 text-white';
      case 'within_6_hours': return 'bg-yellow-500 text-black';
      case 'within_24_hours': return 'bg-blue-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const formatUrgency = (urgency: string) => {
    return urgency.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-primary" />
            Donor Lookup
            <InfoTip content="Search for shortlisted donors by entering the campaign ID from your blood request" />
          </h1>
          <p className="text-muted-foreground">Find the shortlisted donor for a campaign</p>
        </div>

        {/* Search Card */}
        <Card className="blood-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Search by Campaign ID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="flex items-center gap-2">
                  Campaign ID
                  <InfoTip content="This is the unique identifier generated when you submit a blood request" />
                </Label>
                <Input
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  placeholder="Enter campaign ID (e.g., abc12345-..."
                  className="font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && searchDonor()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={searchDonor} disabled={loading} className="medical-gradient">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donor Card */}
        {donor && transaction && (
          <div className="animate-scale-in">
            <Card className="blood-card-hover overflow-hidden">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-primary via-primary/80 to-success p-6 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{donor.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-white/20 text-white border-white/30">
                          <Droplet className="w-3 h-3 mr-1" />
                          {donor.blood_type}
                        </Badge>
                        <Badge className="bg-success/80 text-white border-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Selected Donor
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getUrgencyColor(transaction.urgency)} text-sm px-3 py-1`}>
                    {formatUrgency(transaction.urgency)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Contact & Personal Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{donor.phone_number}</p>
                        </div>
                      </div>
                      {donor.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{donor.email}</p>
                          </div>
                        </div>
                      )}
                      {donor.age && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="font-medium">{donor.age} years</p>
                          </div>
                        </div>
                      )}
                      {donor.last_donation_date && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Droplet className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Last Donation</p>
                            <p className="font-medium">{new Date(donor.last_donation_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Current Address</p>
                          <p className="font-medium">{transaction.current_location || donor.address}</p>
                          <p className="text-sm text-muted-foreground">{donor.city}, {donor.state} - {transaction.pincode || donor.zipcode}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hospital Destination</p>
                          <p className="font-medium">{transaction.hospital_location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distance Info */}
                {distanceInfo && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Route className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Travel Distance</p>
                          <p className="text-2xl font-bold text-primary">{distanceInfo.distance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Estimated Time</span>
                        </div>
                        <p className="text-xl font-semibold">{distanceInfo.duration}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  {transaction.availability && transaction.availability !== 'NA' && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                      <p className="text-xs text-muted-foreground mb-1">Availability Status</p>
                      <p className="font-semibold text-success">{transaction.availability}</p>
                    </div>
                  )}
                  {transaction.reason && transaction.reason !== 'NA' && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Reason for Request</p>
                      <p className="font-medium">{transaction.reason}</p>
                    </div>
                  )}
                </div>

                {/* Transaction Meta */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Campaign ID: <span className="font-mono">{transaction.campaign_id}</span>
                    {transaction.call_id && <> • Call ID: <span className="font-mono">{transaction.call_id}</span></>}
                    <> • Selected on: {new Date(transaction.created_at).toLocaleDateString()}</>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DonorLookup;
