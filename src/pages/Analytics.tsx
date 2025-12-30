import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTip } from '@/components/InfoTip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity,
  Heart,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  Mail,
  Download
} from 'lucide-react';

interface CallTransaction {
  id: string;
  campaign_id: string;
  donor_id: string;
  call_id?: string;
  name: string;
  phone_number: string;
  blood_type: string;
  address: string;
  zip: string;
  urgency: string;
  hospital_location: string;
  availability?: string;
  donor_selected?: string;
  eligibility?: string;
  current_location?: string;
  pincode?: string;
  reason?: string;
  whatsapp_sent?: string;
  sms_sent?: string;
  email_sent?: string;
  created_at: string;
  updated_at: string;
}

interface Metrics {
  totalCalls24h: number;
  donorsAccepted: number;
  donorsDeclined: number;
  pendingResponses: number;
  avgResponseRate: number;
  smsSent: number;
  whatsappSent: number;
  emailSent: number;
  uniqueCampaigns: number;
}

const Analytics: React.FC = () => {
  const [transactions, setTransactions] = useState<CallTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [metrics, setMetrics] = useState<Metrics>({
    totalCalls24h: 0,
    donorsAccepted: 0,
    donorsDeclined: 0,
    pendingResponses: 0,
    avgResponseRate: 0,
    smsSent: 0,
    whatsappSent: 0,
    emailSent: 0,
    uniqueCampaigns: 0,
  });
  const { toast } = useToast();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['immediate', 'within_3_hours', 'within_6_hours', 'within_24_hours', 'within_48_hours'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('call_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      setTransactions(data || []);
      calculateMetrics(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({ title: 'Error', description: 'Failed to fetch call transactions', variant: 'destructive' });
    }
    setLoading(false);
  };

  const calculateMetrics = (data: CallTransaction[]) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const calls24h = data.filter(t => new Date(t.created_at) >= last24h);
    const accepted = data.filter(t => 
      t.donor_selected?.toLowerCase() === 'yes' || 
      t.availability?.toLowerCase() === 'yes'
    );
    const declined = data.filter(t => 
      t.donor_selected?.toLowerCase() === 'no' || 
      t.availability?.toLowerCase() === 'no'
    );
    const pending = data.filter(t => 
      (!t.availability || t.availability === 'NA') && 
      (!t.donor_selected || t.donor_selected === 'NA')
    );
    const smsSent = data.filter(t => t.sms_sent?.toLowerCase() === 'yes').length;
    const whatsappSent = data.filter(t => t.whatsapp_sent?.toLowerCase() === 'yes').length;
    const emailSent = data.filter(t => t.email_sent?.toLowerCase() === 'yes').length;
    const uniqueCampaigns = new Set(data.map(t => t.campaign_id)).size;

    const responseRate = data.length > 0 
      ? ((accepted.length + declined.length) / data.length) * 100 
      : 0;

    setMetrics({
      totalCalls24h: calls24h.length,
      donorsAccepted: accepted.length,
      donorsDeclined: declined.length,
      pendingResponses: pending.length,
      avgResponseRate: Math.round(responseRate),
      smsSent,
      whatsappSent,
      emailSent,
      uniqueCampaigns,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone_number.includes(searchTerm) ||
        t.campaign_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.call_id && t.call_id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesBloodType = bloodTypeFilter === 'all' || t.blood_type === bloodTypeFilter;
      const matchesUrgency = urgencyFilter === 'all' || t.urgency === urgencyFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'accepted') {
        matchesStatus = t.donor_selected?.toLowerCase() === 'yes' || t.availability?.toLowerCase() === 'yes';
      } else if (statusFilter === 'declined') {
        matchesStatus = t.donor_selected?.toLowerCase() === 'no' || t.availability?.toLowerCase() === 'no';
      } else if (statusFilter === 'pending') {
        matchesStatus = (!t.availability || t.availability === 'NA') && (!t.donor_selected || t.donor_selected === 'NA');
      }

      return matchesSearch && matchesBloodType && matchesUrgency && matchesStatus;
    });
  }, [transactions, searchTerm, bloodTypeFilter, urgencyFilter, statusFilter]);

  const getStatusBadge = (t: CallTransaction) => {
    if (t.donor_selected?.toLowerCase() === 'yes' || t.availability?.toLowerCase() === 'yes') {
      return <Badge className="bg-success text-white">Accepted</Badge>;
    } else if (t.donor_selected?.toLowerCase() === 'no' || t.availability?.toLowerCase() === 'no') {
      return <Badge variant="destructive">Declined</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      immediate: 'bg-destructive text-destructive-foreground',
      within_3_hours: 'bg-orange-500 text-white',
      within_6_hours: 'bg-yellow-500 text-black',
      within_24_hours: 'bg-blue-500 text-white',
      within_48_hours: 'bg-green-500 text-white',
    };
    return <Badge className={colors[urgency] || 'bg-muted'}>{urgency.replace(/_/g, ' ')}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Blood Type', 'Urgency', 'Status', 'Hospital', 'Campaign ID', 'Created At'];
    const rows = filteredTransactions.map(t => [
      t.name,
      t.phone_number,
      t.blood_type,
      t.urgency,
      t.donor_selected || t.availability || 'Pending',
      t.hospital_location,
      t.campaign_id,
      new Date(t.created_at).toLocaleString(),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="text-primary" />
              Analytics Dashboard
              <InfoTip content="Real-time metrics and call transaction data for campaign monitoring" />
            </h1>
            <p className="text-muted-foreground">Monitor campaign performance and donor responses</p>
          </div>
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Metrics Cards - Compact Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <PhoneCall className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.totalCalls24h}</p>
              <p className="text-[10px] text-muted-foreground">Calls (24h)</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-success">{metrics.donorsAccepted}</p>
              <p className="text-[10px] text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <XCircle className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold text-destructive">{metrics.donorsDeclined}</p>
              <p className="text-[10px] text-muted-foreground">Declined</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <Clock className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-500">{metrics.pendingResponses}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.avgResponseRate}%</p>
              <p className="text-[10px] text-muted-foreground">Response</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.uniqueCampaigns}</p>
              <p className="text-[10px] text-muted-foreground">Campaigns</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <MessageSquare className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.whatsappSent}</p>
              <p className="text-[10px] text-muted-foreground">WhatsApp</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <Phone className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.smsSent}</p>
              <p className="text-[10px] text-muted-foreground">SMS</p>
            </CardContent>
          </Card>

          <Card className="blood-card">
            <CardContent className="p-3 text-center">
              <Mail className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{metrics.emailSent}</p>
              <p className="text-[10px] text-muted-foreground">Emails</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="blood-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Call Transactions
              <InfoTip content="Search and filter all call transaction records" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, phone, campaign ID..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Blood Type</Label>
                <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {bloodTypes.map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Urgency</Label>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {urgencyLevels.map(u => (
                      <SelectItem key={u} value={u}>{u.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Donor</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.slice(0, 50).map((t) => (
                        <TableRow key={t.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.phone_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{t.blood_type}</Badge>
                          </TableCell>
                          <TableCell>{getUrgencyBadge(t.urgency)}</TableCell>
                          <TableCell>{getStatusBadge(t)}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={t.hospital_location}>
                            {t.hospital_location}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{t.campaign_id.slice(0, 8)}...</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
