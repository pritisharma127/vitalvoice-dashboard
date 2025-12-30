import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
interface Donor {
  id: string;
  name: string;
  phone_number: string;
  blood_type: string;
  address: string;
  zipcode: string;
  city: string;
  is_available: boolean;
  age: number | null;
}

interface ShortlistedDonor extends Donor {
  callStatus: 'pending' | 'calling' | 'completed' | 'selected' | 'declined';
  callId?: string;
  availability?: string;
  donorSelected?: string;
}

interface CampaignPanelProps {
  campaignId: string;
  bloodType: string;
  urgency: string;
  reason: string;
  onBack: () => void;
}

export const CampaignPanel: React.FC<CampaignPanelProps> = ({
  campaignId,
  bloodType,
  urgency,
  reason,
  onBack,
}) => {
  const [donorsToShortlist, setDonorsToShortlist] = useState<string>('');
  const [shortlistedDonors, setShortlistedDonors] = useState<ShortlistedDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignStarted, setCampaignStarted] = useState(false);
  const [campaignComplete, setCampaignComplete] = useState(false);
  const [currentDonorIndex, setCurrentDonorIndex] = useState(0);
  const [selectedDonor, setSelectedDonor] = useState<ShortlistedDonor | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const waitingForDonorRef = useRef<{ donorId: string; resolve: (result: { availability: string; donorSelected: string }) => void } | null>(null);

  const fetchAndShortlistDonors = async () => {
    if (!donorsToShortlist) {
      toast({ title: 'Error', description: 'Please select number of donors', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Cast bloodType to the correct enum type for the query
      const { data: donors, error } = await supabase
        .from('donors')
        .select('*')
        .eq('blood_type', bloodType as any)
        .eq('is_available', true)
        .limit(parseInt(donorsToShortlist));

      if (error) throw error;

      if (!donors || donors.length === 0) {
        toast({ title: 'No donors found', description: `No available donors with blood type ${bloodType}`, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const shortlisted: ShortlistedDonor[] = donors.map(donor => ({
        ...donor,
        callStatus: 'pending' as const,
      }));

      setShortlistedDonors(shortlisted);
      toast({ title: 'Donors shortlisted', description: `Found ${donors.length} matching donors` });
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast({ title: 'Error', description: 'Failed to fetch donors', variant: 'destructive' });
    }
    setLoading(false);
  };

  const makeOutboundCall = async (donor: ShortlistedDonor, index: number): Promise<string | null> => {
    try {
      // Update status to calling
      setShortlistedDonors(prev => prev.map((d, i) => 
        i === index ? { ...d, callStatus: 'calling' } : d
      ));

      const { data, error } = await supabase.functions.invoke('outbound-call', {
        body: {
          donor_phone: donor.phone_number,
          donor_name: donor.name,
          donor_gender: 'NA', // donors table doesn't have gender
          donor_blood_group: donor.blood_type,
          donor_address: `${donor.address}, ${donor.city}, ${donor.zipcode}`,
          urgency: urgency,
          reason: reason,
        },
      });

      if (error) throw error;

      const callId = data?.call_id || data?.callId || JSON.stringify(data);
      console.log('Call initiated, call_id:', callId);

      // Insert into call_transactions
      const { error: insertError } = await supabase.from('call_transactions').insert({
        campaign_id: campaignId,
        donor_id: donor.id,
        call_id: callId,
        name: donor.name,
        phone_number: donor.phone_number,
        blood_type: donor.blood_type,
        address: donor.address,
        zip: donor.zipcode,
        urgency: urgency,
        reason: reason,
        hospital_location: 'Hospital', // Will be updated with actual hospital info
        availability: 'NA',
        donor_selected: 'NA',
      });

      if (insertError) {
        console.error('Error inserting call transaction:', insertError);
      }

      // Update donor status
      setShortlistedDonors(prev => prev.map((d, i) => 
        i === index ? { ...d, callId: callId, callStatus: 'completed' } : d
      ));

      return callId;
    } catch (error) {
      console.error('Error making outbound call:', error);
      setShortlistedDonors(prev => prev.map((d, i) => 
        i === index ? { ...d, callStatus: 'completed' } : d
      ));
      toast({ title: 'Call failed', description: `Failed to call ${donor.name}`, variant: 'destructive' });
      return null;
    }
  };

  // Setup Realtime subscription for availability changes
  useEffect(() => {
    channelRef.current = supabase
      .channel('call-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_transactions',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          const newData = payload.new as { donor_id: string; availability: string; donor_selected: string };
          const availability = newData.availability?.toLowerCase() || '';
          const donorSelected = newData.donor_selected?.toLowerCase() || '';
          
          // Check if availability changed from NA to YES/NO
          if (availability === 'yes' || availability === 'no' || donorSelected === 'yes' || donorSelected === 'no') {
            console.log(`Availability changed: ${availability}, donor_selected: ${donorSelected}`);
            
            // Resolve the waiting promise if we're waiting for this donor
            if (waitingForDonorRef.current && waitingForDonorRef.current.donorId === newData.donor_id) {
              waitingForDonorRef.current.resolve({
                availability: newData.availability,
                donorSelected: newData.donor_selected,
              });
              waitingForDonorRef.current = null;
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [campaignId]);

  const waitForDonorResponse = useCallback((donorId: string): Promise<{ availability: string; donorSelected: string }> => {
    return new Promise((resolve) => {
      // Set a timeout of 5 minutes
      const timeout = setTimeout(() => {
        console.log('Timeout waiting for donor response');
        if (waitingForDonorRef.current?.donorId === donorId) {
          waitingForDonorRef.current = null;
          resolve({ availability: 'NA', donorSelected: 'NA' });
        }
      }, 5 * 60 * 1000);

      waitingForDonorRef.current = {
        donorId,
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
      };
    });
  }, []);

  const startCampaign = async () => {
    if (shortlistedDonors.length === 0) {
      toast({ title: 'Error', description: 'Please shortlist donors first', variant: 'destructive' });
      return;
    }

    setCampaignStarted(true);
    setCurrentDonorIndex(0);

    for (let i = 0; i < shortlistedDonors.length; i++) {
      setCurrentDonorIndex(i);
      const donor = shortlistedDonors[i];

      // Make outbound call
      const callId = await makeOutboundCall(donor, i);

      if (callId) {
        // Wait for realtime response
        const { availability, donorSelected } = await waitForDonorResponse(donor.id);

        // Update donor status based on response
        setShortlistedDonors(prev => prev.map((d, idx) => {
          if (idx === i) {
            const isSelected = donorSelected?.toLowerCase() === 'yes' || 
                              donorSelected?.toLowerCase() === 'selected' ||
                              availability?.toLowerCase() === 'yes' ||
                              availability?.toLowerCase() === 'available';
            return {
              ...d,
              availability,
              donorSelected,
              callStatus: isSelected ? 'selected' : 'declined',
            };
          }
          return d;
        }));

        // Check if donor agreed
        if (donorSelected?.toLowerCase() === 'yes' || 
            donorSelected?.toLowerCase() === 'selected' ||
            availability?.toLowerCase() === 'yes' ||
            availability?.toLowerCase() === 'available') {
          setSelectedDonor({ ...donor, availability, donorSelected, callStatus: 'selected' });
          setCampaignComplete(true);
          toast({ 
            title: 'Donor Found!', 
            description: `${donor.name} has agreed to donate blood!`,
          });
          return;
        }
      }

      // Small delay before next call
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Campaign complete - no one agreed
    setCampaignComplete(true);
    toast({ 
      title: 'Campaign Complete', 
      description: 'All donors have been contacted. No positive responses received.',
      variant: 'destructive',
    });
  };

  const getStatusIcon = (status: ShortlistedDonor['callStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'calling':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'completed':
        return <Phone className="w-4 h-4 text-yellow-500" />;
      case 'selected':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ShortlistedDonor['callStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'calling':
        return <Badge className="bg-primary">Calling...</Badge>;
      case 'completed':
        return <Badge variant="outline">Awaiting Response</Badge>;
      case 'selected':
        return <Badge className="bg-success">Selected</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign ID Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Donor Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Campaign ID</Label>
            <Input value={campaignId} readOnly className="font-mono bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Blood Type Required</Label>
              <Input value={bloodType} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Donors to Shortlist</Label>
              <Select value={donorsToShortlist} onValueChange={setDonorsToShortlist} disabled={shortlistedDonors.length > 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} Donor{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {shortlistedDonors.length === 0 && (
            <Button onClick={fetchAndShortlistDonors} disabled={loading || !donorsToShortlist} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Shortlist Donors
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Shortlisted Donors List */}
      {shortlistedDonors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shortlisted Donors ({shortlistedDonors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shortlistedDonors.map((donor, index) => (
              <div 
                key={donor.id} 
                className={`p-4 rounded-lg border ${
                  index === currentDonorIndex && campaignStarted && !campaignComplete 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(donor.callStatus)}
                    <div>
                      <p className="font-medium">{donor.name}</p>
                      <p className="text-sm text-muted-foreground">{donor.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{donor.blood_type}</Badge>
                    {getStatusBadge(donor.callStatus)}
                  </div>
                </div>
                {donor.callId && (
                  <p className="text-xs text-muted-foreground mt-2">Call ID: {donor.callId}</p>
                )}
                {donor.availability && donor.availability !== 'NA' && (
                  <p className="text-xs text-muted-foreground mt-1">Response: {donor.availability}</p>
                )}
              </div>
            ))}

            {!campaignStarted && (
              <Button onClick={startCampaign} className="w-full medical-gradient mt-4">
                <Phone className="mr-2 h-4 w-4" />
                Start Calling Donors
              </Button>
            )}

            {campaignComplete && selectedDonor && (
              <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success">
                <p className="font-semibold text-success flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Donor Found!
                </p>
                <p className="mt-2">{selectedDonor.name} has agreed to donate blood.</p>
                <p className="text-sm text-muted-foreground">Phone: {selectedDonor.phone_number}</p>
              </div>
            )}

            {campaignComplete && !selectedDonor && (
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive">
                <p className="font-semibold text-destructive flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  No Donors Available
                </p>
                <p className="text-sm mt-1">All shortlisted donors have been contacted but none are available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={onBack} className="w-full">
        Submit Another Request
      </Button>
    </div>
  );
};
