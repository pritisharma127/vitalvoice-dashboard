import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHospital } from '@/contexts/HospitalContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Copy, Droplets, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CampaignPanel } from '@/components/CampaignPanel';
import { InfoTip } from '@/components/InfoTip';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const urgencyLevels = [
  { value: 'immediate', label: 'Immediate', color: 'bg-destructive' },
  { value: 'within_3_hours', label: 'Within 3 Hours', color: 'bg-orange-500' },
  { value: 'within_6_hours', label: 'Within 6 Hours', color: 'bg-yellow-500' },
  { value: 'within_24_hours', label: 'Within 24 Hours', color: 'bg-blue-500' },
  { value: 'within_48_hours', label: 'Within 48 Hours', color: 'bg-green-500' },
] as const;
const genders = ['male', 'female', 'other'] as const;

const requestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientAge: z.number().min(0).max(150, 'Invalid age'),
  patientGender: z.enum(genders),
  bloodType: z.enum(bloodTypes),
  quantity: z.number().min(1).max(20, 'Quantity must be between 1-20 units'),
  urgency: z.enum(['immediate', 'within_3_hours', 'within_6_hours', 'within_24_hours', 'within_48_hours']),
  reason: z.string().min(2, 'Reason is required'),
  caretakerName: z.string().optional(),
  caretakerPhone: z.string().regex(/^\+\d{10,15}$/, 'Phone must be in format +919113669741 (no dashes)'),
  caretakerEmail: z.string().email('Valid email required'),
  notes: z.string().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

interface RequestData {
  requestId: string;
  bloodType: string;
  urgency: string;
  reason: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const { selectedHospital } = useHospital();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { quantity: 1 },
  });

  const [lastSubmittedData, setLastSubmittedData] = useState<{ bloodType: string; urgency: string; reason: string } | null>(null);

  const onSubmit = async (data: RequestForm) => {
    if (!selectedHospital) {
      toast({ title: 'Error', description: 'Please select a hospital', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const newRequestId = uuidv4();

    const { error } = await supabase.from('blood_requests').insert({
      request_id: newRequestId,
      patient_name: data.patientName,
      patient_age: data.patientAge,
      patient_gender: data.patientGender,
      blood_type: data.bloodType,
      quantity_units: data.quantity,
      urgency: data.urgency,
      reason: data.reason,
      caretaker_name: data.caretakerName || null,
      caretaker_phone: data.caretakerPhone,
      caretaker_email: data.caretakerEmail,
      hospital_name: selectedHospital.name,
      hospital_city: selectedHospital.city,
      hospital_zipcode: selectedHospital.zipcode,
      notes: data.notes || null,
      admin_user_id: user?.id,
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setLastSubmittedData({
        bloodType: data.bloodType,
        urgency: data.urgency,
        reason: data.reason,
      });
      setRequestData({
        requestId: newRequestId,
        bloodType: data.bloodType,
        urgency: data.urgency,
        reason: data.reason,
      });
      form.reset();
    }
  };

  const handleBack = () => {
    setRequestData(null);
    setLastSubmittedData(null);
  };

  if (requestData) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto animate-scale-in">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="text-success" />
              Request Submitted Successfully
            </h1>
            <p className="text-muted-foreground">Now start the donor campaign to find blood donors</p>
          </div>
          <CampaignPanel
            campaignId={requestData.requestId}
            bloodType={requestData.bloodType}
            urgency={requestData.urgency}
            reason={requestData.reason}
            onBack={handleBack}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="text-destructive" />
            New Blood Request
            <InfoTip content="Fill out this form to create a blood donation request. Once submitted, you can start a campaign to call potential donors." />
          </h1>
          <p className="text-muted-foreground">Fill in the patient and caretaker details</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information */}
          <div className="blood-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Patient Information
              <InfoTip content="Enter the patient's details who needs the blood transfusion" />
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1">
                  Patient Name *
                  <InfoTip content="Full legal name of the patient" side="right" />
                </Label>
                <Input {...form.register('patientName')} placeholder="Full name" />
                {form.formState.errors.patientName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.patientName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age *</Label>
                  <Input type="number" {...form.register('patientAge', { valueAsNumber: true })} placeholder="Age" />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select onValueChange={(v) => form.setValue('patientGender', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {genders.map(g => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Blood Type *</Label>
                <Select onValueChange={(v) => form.setValue('bloodType', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity (Units) *</Label>
                <Input type="number" {...form.register('quantity', { valueAsNumber: true })} min={1} max={20} />
              </div>
              <div className="md:col-span-2">
                <Label>Urgency *</Label>
                <Select onValueChange={(v) => form.setValue('urgency', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Select urgency level" /></SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map(u => (
                      <SelectItem key={u.value} value={u.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.color}`} />
                          {u.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Reason for Blood Requirement *</Label>
                <Input {...form.register('reason')} placeholder="e.g., Surgery, Accident, Medical treatment" />
                {form.formState.errors.reason && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.reason.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Caretaker Information */}
          <div className="blood-card p-6">
            <h3 className="font-semibold mb-4">Caretaker Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Caretaker Name</Label>
                <Input {...form.register('caretakerName')} placeholder="Full name" />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input {...form.register('caretakerPhone')} placeholder="+919113669741" />
                {form.formState.errors.caretakerPhone && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.caretakerPhone.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Email Address *</Label>
                <Input {...form.register('caretakerEmail')} type="email" placeholder="email@example.com" />
                {form.formState.errors.caretakerEmail && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.caretakerEmail.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Additional Notes</Label>
                <Textarea {...form.register('notes')} placeholder="Any special requirements..." />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full medical-gradient" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Blood Request
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
