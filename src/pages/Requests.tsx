import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ClipboardList, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface BloodRequest {
  id: string;
  request_id: string;
  patient_name: string;
  blood_type: string;
  quantity_units: number;
  urgency: string;
  status: string;
  hospital_name: string;
  created_at: string;
}

const urgencyColors: Record<string, string> = {
  immediate: 'bg-destructive text-destructive-foreground',
  within_3_hours: 'bg-orange-500 text-white',
  within_6_hours: 'bg-yellow-500 text-black',
  within_24_hours: 'bg-blue-500 text-white',
  within_48_hours: 'bg-green-500 text-white',
};

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase.from('blood_requests')
        .select('id, request_id, patient_name, blood_type, quantity_units, urgency, status, hospital_name, created_at')
        .order('created_at', { ascending: false }).limit(50);
      if (data) setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-primary" />
            Blood Requests
          </h1>
          <p className="text-muted-foreground">View all submitted blood requests</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No requests found.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="blood-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-primary">{req.request_id}</span>
                    <Badge className={urgencyColors[req.urgency]}>{req.urgency.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="font-medium">{req.patient_name}</p>
                  <p className="text-sm text-muted-foreground">{req.hospital_name}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="font-bold">{req.blood_type}</Badge>
                  <span>{req.quantity_units} unit(s)</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />{format(new Date(req.created_at), 'dd MMM, HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Requests;
