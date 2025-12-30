import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DashboardLayout } from "@/components/DashboardLayout";

const BASE_URL = "https://<>.supabase.co/functions/v1";

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

interface EndpointProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  curlExample: string;
}

function Endpoint({ method, path, description, parameters, requestBody, responseExample, curlExample }: EndpointProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const methodColors = {
    GET: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    POST: "bg-green-500/10 text-green-600 border-green-500/20",
    PATCH: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Badge variant="outline" className={methodColors[method]}>
            {method}
          </Badge>
          <code className="text-sm font-mono flex-1">{path}</code>
          <span className="text-sm text-muted-foreground hidden md:block">{description}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          <p className="text-muted-foreground">{description}</p>

          {parameters && parameters.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <div className="space-y-2">
                {parameters.map((param) => (
                  <div key={param.name} className="flex gap-2 text-sm">
                    <code className="bg-muted px-2 py-0.5 rounded">{param.name}</code>
                    <span className="text-muted-foreground">{param.type}</span>
                    {param.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                    <span className="text-muted-foreground">- {param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestBody && requestBody.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Request Body (JSON)</h4>
              <div className="space-y-2">
                {requestBody.map((field) => (
                  <div key={field.name} className="flex gap-2 text-sm flex-wrap">
                    <code className="bg-muted px-2 py-0.5 rounded">{field.name}</code>
                    <span className="text-muted-foreground">{field.type}</span>
                    {field.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                    <span className="text-muted-foreground">- {field.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="curl" className="w-full">
            <TabsList>
              <TabsTrigger value="curl">cURL Example</TabsTrigger>
              <TabsTrigger value="response">Response Example</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-2">
              <CodeBlock code={curlExample} />
            </TabsContent>
            <TabsContent value="response" className="mt-2">
              <CodeBlock code={responseExample} language="json" />
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ApiDocs() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            REST API endpoints for the Vital Voice Dashboard
          </p>
        </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
          <CardDescription>All API requests should be made to this base URL</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={BASE_URL} />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>API authentication requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            These APIs are currently <Badge variant="outline" className="mx-1">public</Badge> and do not require authentication.
            No API key or authorization header is needed.
          </p>
        </CardContent>
      </Card>

      {/* Blood Requests API */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Blood Requests API</h2>
          <Badge>blood-requests</Badge>
        </div>
        <p className="text-muted-foreground">
          Full CRUD operations for managing blood donation requests.
        </p>

        <div className="space-y-2">
          <Endpoint
            method="GET"
            path="/blood-requests"
            description="List all blood requests with pagination and filters"
            parameters={[
              { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
              { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
              { name: "status", type: "string", required: false, description: "Filter by status: pending, in_progress, fulfilled, cancelled" },
              { name: "blood_type", type: "string", required: false, description: "Filter by blood type: A+, A-, B+, B-, AB+, AB-, O+, O-" },
              { name: "urgency", type: "string", required: false, description: "Filter by urgency: immediate, within_3_hours, within_6_hours, within_24_hours, within_48_hours" },
            ]}
            curlExample={`curl "${BASE_URL}/blood-requests?page=1&limit=10&status=pending"`}
            responseExample={`{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "request_id": "abc123",
      "patient_name": "John Doe",
      "blood_type": "O+",
      "quantity_units": 2,
      "urgency": "immediate",
      "status": "pending",
      "hospital_name": "City Hospital",
      "hospital_city": "Bangalore",
      "hospital_zipcode": "560001",
      "caretaker_name": "Jane Doe",
      "caretaker_phone": "+91-9876543210",
      "caretaker_email": "jane@example.com",
      "patient_age": 45,
      "patient_gender": "male",
      "notes": "Urgent surgery",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/blood-requests/{request_id}"
            description="Get a specific blood request by its request_id"
            curlExample={`curl "${BASE_URL}/blood-requests/abc123-uuid"`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "patient_name": "John Doe",
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "immediate",
    "status": "pending",
    "hospital_name": "City Hospital",
    "hospital_city": "Bangalore",
    "hospital_zipcode": "560001",
    "caretaker_name": "Jane Doe",
    "caretaker_phone": "+91-9876543210",
    "caretaker_email": "jane@example.com",
    "patient_age": 45,
    "patient_gender": "male",
    "notes": "Urgent surgery",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}`}
          />

          <Endpoint
            method="POST"
            path="/blood-requests"
            description="Create a new blood request"
            requestBody={[
              { name: "patient_name", type: "string", required: true, description: "Patient's full name (max 100 chars)" },
              { name: "blood_type", type: "string", required: true, description: "A+, A-, B+, B-, AB+, AB-, O+, O-" },
              { name: "quantity_units", type: "number", required: true, description: "Units needed (1-20)" },
              { name: "urgency", type: "string", required: true, description: "immediate, within_3_hours, within_6_hours, within_24_hours, within_48_hours" },
              { name: "patient_age", type: "number", required: true, description: "Patient age (0-120)" },
              { name: "patient_gender", type: "string", required: true, description: "male, female, other" },
              { name: "caretaker_phone", type: "string", required: true, description: "Contact phone number" },
              { name: "caretaker_email", type: "string", required: true, description: "Contact email" },
              { name: "hospital_name", type: "string", required: true, description: "Hospital name" },
              { name: "hospital_city", type: "string", required: true, description: "Hospital city" },
              { name: "hospital_zipcode", type: "string", required: true, description: "Hospital ZIP code" },
              { name: "caretaker_name", type: "string", required: false, description: "Caretaker's name (max 100 chars)" },
              { name: "notes", type: "string", required: false, description: "Additional notes (max 1000 chars)" },
            ]}
            curlExample={`curl -X POST "${BASE_URL}/blood-requests" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_name": "John Doe",
    "blood_type": "O+",
    "quantity_units": 2,
    "urgency": "immediate",
    "patient_age": 45,
    "patient_gender": "male",
    "caretaker_name": "Jane Doe",
    "caretaker_phone": "+91-9876543210",
    "caretaker_email": "jane@example.com",
    "hospital_name": "City Hospital",
    "hospital_city": "Bangalore",
    "hospital_zipcode": "560001",
    "notes": "Urgent surgery required"
  }'`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "new-uuid",
    "request_id": "generated-uuid",
    "patient_name": "John Doe",
    "blood_type": "O+",
    "status": "pending",
    ...
  },
  "request_id": "generated-uuid"
}`}
          />

          <Endpoint
            method="PATCH"
            path="/blood-requests/{request_id}"
            description="Update an existing blood request"
            requestBody={[
              { name: "status", type: "string", required: false, description: "pending, in_progress, fulfilled, cancelled" },
              { name: "notes", type: "string", required: false, description: "Additional notes (max 1000 chars)" },
              { name: "quantity_units", type: "number", required: false, description: "Units needed (1-20)" },
              { name: "urgency", type: "string", required: false, description: "Urgency level" },
              { name: "caretaker_name", type: "string", required: false, description: "Caretaker name" },
              { name: "caretaker_phone", type: "string", required: false, description: "Contact phone" },
              { name: "caretaker_email", type: "string", required: false, description: "Contact email" },
              { name: "patient_name", type: "string", required: false, description: "Patient name" },
              { name: "patient_age", type: "number", required: false, description: "Patient age (0-120)" },
              { name: "patient_gender", type: "string", required: false, description: "male, female, other" },
              { name: "blood_type", type: "string", required: false, description: "Blood type" },
            ]}
            curlExample={`curl -X PATCH "${BASE_URL}/blood-requests/abc123-uuid" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "in_progress",
    "notes": "Donor found, blood being processed"
  }'`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "status": "in_progress",
    "notes": "Donor found, blood being processed",
    "updated_at": "2024-01-15T12:00:00Z",
    ...
  }
}`}
          />

          <Endpoint
            method="DELETE"
            path="/blood-requests/{request_id}"
            description="Cancel a blood request (soft delete - sets status to 'cancelled')"
            curlExample={`curl -X DELETE "${BASE_URL}/blood-requests/abc123-uuid"`}
            responseExample={`{
  "success": true,
  "message": "Request cancelled",
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "status": "cancelled",
    ...
  }
}`}
          />
        </div>
      </div>

      {/* Update Blood Request API (Legacy) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Update Blood Request API</h2>
          <Badge variant="secondary">update-blood-request</Badge>
          <Badge variant="outline">Legacy</Badge>
        </div>
        <p className="text-muted-foreground">
          Alternative endpoint for retrieving and updating blood requests. Provides the same update functionality as the main Blood Requests API.
        </p>

        <div className="space-y-2">
          <Endpoint
            method="GET"
            path="/update-blood-request"
            description="List all blood requests with pagination"
            parameters={[
              { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
              { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
              { name: "status", type: "string", required: false, description: "Filter by status" },
            ]}
            curlExample={`curl "${BASE_URL}/update-blood-request?page=1&limit=10"`}
            responseExample={`{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/update-blood-request/{request_id}"
            description="Get a specific blood request"
            curlExample={`curl "${BASE_URL}/update-blood-request/abc123-uuid"`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    ...
  }
}`}
          />

          <Endpoint
            method="PATCH"
            path="/update-blood-request/{request_id}"
            description="Update a blood request"
            requestBody={[
              { name: "status", type: "string", required: false, description: "pending, in_progress, fulfilled, cancelled" },
              { name: "notes", type: "string", required: false, description: "Additional notes" },
              { name: "quantity_units", type: "number", required: false, description: "Units needed (1-20)" },
              { name: "urgency", type: "string", required: false, description: "Urgency level" },
              { name: "blood_type", type: "string", required: false, description: "Blood type" },
            ]}
            curlExample={`curl -X PATCH "${BASE_URL}/update-blood-request/abc123-uuid" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "fulfilled", "notes": "Blood delivered successfully"}'`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "abc123-uuid",
    "status": "fulfilled",
    "notes": "Blood delivered successfully",
    "updated_at": "2024-01-15T14:00:00Z",
    ...
  }
}`}
          />
        </div>
      </div>

      {/* Donors API */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Donors API</h2>
          <Badge>donors</Badge>
        </div>
        <p className="text-muted-foreground">
          Search and retrieve blood donors with filtering, pagination, and proximity-based search.
        </p>

        <div className="space-y-2">
          <Endpoint
            method="GET"
            path="/donors"
            description="List donors with filters and optional proximity search"
            parameters={[
              { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
              { name: "limit", type: "number", required: false, description: "Items per page (default: 50, max: 100)" },
              { name: "blood_type", type: "string", required: false, description: "Filter by blood type: A+, A-, B+, B-, AB+, AB-, O+, O-" },
              { name: "zipcode", type: "string", required: false, description: "Filter by exact ZIP code" },
              { name: "city", type: "string", required: false, description: "Filter by city (partial match)" },
              { name: "area", type: "string", required: false, description: "Filter by area (partial match)" },
              { name: "available_only", type: "boolean", required: false, description: "Show only available donors (default: true)" },
              { name: "proximity_search", type: "boolean", required: false, description: "Enable proximity sorting (requires search_zipcode)" },
              { name: "search_zipcode", type: "string", required: false, description: "ZIP code for proximity search center" },
            ]}
            curlExample={`# Basic search
curl "${BASE_URL}/donors?blood_type=O+&city=Bangalore"

# Proximity search - find donors near a ZIP code, sorted by distance
curl "${BASE_URL}/donors?blood_type=O+&proximity_search=true&search_zipcode=560001"`}
            responseExample={`{
  "success": true,
  "data": [
    {
      "id": "donor-uuid",
      "name": "Ramesh Kumar",
      "blood_type": "O+",
      "phone_number": "+91-9876543210",
      "email": "ramesh@example.com",
      "address": "123 MG Road",
      "area": "Indiranagar",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipcode": "560038",
      "age": 32,
      "is_available": true,
      "last_donation_date": "2024-01-01",
      "distance_km": 2.5,
      "distance_text": "3 km",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "total_pages": 1
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/donors/{donor_id}"
            description="Get a specific donor by ID"
            curlExample={`curl "${BASE_URL}/donors/donor-uuid-here"`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "donor-uuid",
    "name": "Ramesh Kumar",
    "blood_type": "O+",
    "phone_number": "+91-9876543210",
    "email": "ramesh@example.com",
    "address": "123 MG Road",
    "area": "Indiranagar",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipcode": "560038",
    "age": 32,
    "is_available": true,
    "last_donation_date": "2024-01-01",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}`}
          />
        </div>
      </div>

      {/* Call Transactions API */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Call Transactions API</h2>
          <Badge>call-transactions</Badge>
        </div>
        <p className="text-muted-foreground">
          Track and manage voice agent call transactions for blood donation campaigns. Records donor outreach calls and their outcomes.
        </p>

        <div className="space-y-2">
          <Endpoint
            method="GET"
            path="/call-transactions"
            description="List call transactions with filters and pagination"
            parameters={[
              { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
              { name: "limit", type: "number", required: false, description: "Items per page (default: 50, max: 100)" },
              { name: "campaign_id", type: "string", required: false, description: "Filter by campaign/request ID" },
              { name: "donor_id", type: "string", required: false, description: "Filter by donor UUID" },
              { name: "phone_number", type: "string", required: false, description: "Filter by donor phone number" },
              { name: "availability", type: "string", required: false, description: "Filter by availability: YES, NO, NA" },
              { name: "blood_type", type: "string", required: false, description: "Filter by blood type" },
            ]}
            curlExample={`curl "${BASE_URL}/call-transactions?campaign_id=abc123-uuid&page=1&limit=20"`}
            responseExample={`{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "campaign_id": "abc123-uuid",
      "donor_id": "donor-uuid",
      "phone_number": "+91-9876543210",
      "name": "Ramesh Kumar",
      "address": "123 MG Road, Indiranagar",
      "zip": "560038",
      "gender": "male",
      "blood_type": "O+",
      "urgency": "immediate",
      "reason": "Accident",
      "hospital_location": "City Hospital, Bangalore - 560001",
      "availability": "YES",
      "alternate_phone": "+91-9876543211",
      "current_location": "HSR Layout, Bangalore",
      "pincode": "560102",
      "eligibility": "Eligible - No recent donations",
      "donor_selected": "YES",
      "whatsapp_sent": "YES",
      "sms_sent": "NO",
      "email_sent": "YES",
      "call_id": "conv_abc123xyz",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "total_pages": 1
  }
}`}
          />

          <Endpoint
            method="GET"
            path="/call-transactions/{id}"
            description="Get a specific call transaction by ID or campaign_id"
            curlExample={`curl "${BASE_URL}/call-transactions/transaction-uuid-here"`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid",
    "phone_number": "+91-9876543210",
    "name": "Ramesh Kumar",
    "address": "123 MG Road, Indiranagar",
    "zip": "560038",
    "gender": "male",
    "blood_type": "O+",
    "urgency": "immediate",
    "reason": "Accident",
    "hospital_location": "City Hospital, Bangalore - 560001",
    "availability": "YES",
    "alternate_phone": "+91-9876543211",
    "current_location": "HSR Layout, Bangalore",
    "pincode": "560102",
    "eligibility": "Eligible - No recent donations",
    "donor_selected": "YES",
    "whatsapp_sent": "YES",
    "sms_sent": "NO",
    "email_sent": "YES",
    "call_id": "conv_abc123xyz",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}`}
          />

          <Endpoint
            method="POST"
            path="/call-transactions"
            description="Create a new call transaction record when initiating a donor outreach call"
            requestBody={[
              { name: "campaign_id", type: "string", required: true, description: "The request_id from the blood request (links to campaign)" },
              { name: "donor_id", type: "string", required: true, description: "UUID of the donor being called" },
              { name: "phone_number", type: "string", required: true, description: "Donor's phone number" },
              { name: "name", type: "string", required: true, description: "Donor's name" },
              { name: "address", type: "string", required: true, description: "Donor's address" },
              { name: "zip", type: "string", required: true, description: "Donor's ZIP code" },
              { name: "blood_type", type: "string", required: true, description: "Donor's blood type" },
              { name: "urgency", type: "string", required: true, description: "Urgency level of the request" },
              { name: "hospital_location", type: "string", required: true, description: "Hospital name and location with ZIP" },
              { name: "gender", type: "string", required: false, description: "Donor's gender (default: 'NA')" },
              { name: "reason", type: "string", required: false, description: "Reason for blood request (default: 'NA')" },
              { name: "availability", type: "string", required: false, description: "Donor availability - updated post-call (default: 'NA')" },
              { name: "alternate_phone", type: "string", required: false, description: "Alternate phone - updated post-call (default: 'NA')" },
              { name: "current_location", type: "string", required: false, description: "Current location - updated post-call (default: 'NA')" },
              { name: "pincode", type: "string", required: false, description: "Current pincode - updated post-call (default: 'NA')" },
              { name: "eligibility", type: "string", required: false, description: "Eligibility status - updated post-call (default: 'NA')" },
              { name: "donor_selected", type: "string", required: false, description: "Whether donor was selected: YES, NO (default: 'NA')" },
              { name: "whatsapp_sent", type: "string", required: false, description: "WhatsApp notification sent: YES, NO (default: 'NA')" },
              { name: "sms_sent", type: "string", required: false, description: "SMS notification sent: YES, NO (default: 'NA')" },
              { name: "email_sent", type: "string", required: false, description: "Email notification sent: YES, NO (default: 'NA')" },
              { name: "call_id", type: "string", required: false, description: "Conversation ID from outbound call system (default: null)" },
            ]}
            curlExample={`curl -X POST "${BASE_URL}/call-transactions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid-here",
    "phone_number": "+91-9876543210",
    "name": "Ramesh Kumar",
    "address": "123 MG Road, Indiranagar",
    "zip": "560038",
    "gender": "male",
    "blood_type": "O+",
    "urgency": "immediate",
    "reason": "Accident - Emergency surgery",
    "hospital_location": "City Hospital, Bangalore - 560001",
    "donor_selected": "NO",
    "whatsapp_sent": "NO",
    "sms_sent": "NO",
    "email_sent": "NO",
    "call_id": "conv_xyz789abc"
  }'`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "new-transaction-uuid",
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid-here",
    "phone_number": "+91-9876543210",
    "name": "Ramesh Kumar",
    "address": "123 MG Road, Indiranagar",
    "zip": "560038",
    "gender": "male",
    "blood_type": "O+",
    "urgency": "immediate",
    "reason": "Accident - Emergency surgery",
    "hospital_location": "City Hospital, Bangalore - 560001",
    "availability": "NA",
    "alternate_phone": "NA",
    "current_location": "NA",
    "pincode": "NA",
    "eligibility": "NA",
    "donor_selected": "NO",
    "whatsapp_sent": "NO",
    "sms_sent": "NO",
    "email_sent": "NO",
    "call_id": "conv_xyz789abc",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}`}
          />

          <Endpoint
            method="PATCH"
            path="/call-transactions/{id}"
            description="Update a call transaction after voice agent call completes. Use this to record call outcomes."
            requestBody={[
              { name: "availability", type: "string", required: false, description: "Donor availability: YES, NO, or descriptive text" },
              { name: "alternate_phone", type: "string", required: false, description: "Alternate phone number provided by donor" },
              { name: "current_location", type: "string", required: false, description: "Donor's current location/address" },
              { name: "pincode", type: "string", required: false, description: "Donor's current pincode/ZIP" },
              { name: "eligibility", type: "string", required: false, description: "Eligibility status with reason (e.g., 'Ineligible - Recent surgery')" },
              { name: "donor_selected", type: "string", required: false, description: "Whether donor was selected: YES, NO" },
              { name: "whatsapp_sent", type: "string", required: false, description: "WhatsApp notification sent: YES, NO" },
              { name: "sms_sent", type: "string", required: false, description: "SMS notification sent: YES, NO" },
              { name: "email_sent", type: "string", required: false, description: "Email notification sent: YES, NO" },
              { name: "call_id", type: "string", required: false, description: "Conversation ID from outbound call system" },
            ]}
            curlExample={`curl -X PATCH "${BASE_URL}/call-transactions/transaction-uuid-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "availability": "YES",
    "alternate_phone": "+91-9876543211",
    "current_location": "HSR Layout, Bangalore",
    "pincode": "560102",
    "eligibility": "Eligible - Last donation was 6 months ago",
    "donor_selected": "YES",
    "whatsapp_sent": "YES",
    "sms_sent": "YES",
    "email_sent": "NO",
    "call_id": "conv_abc123xyz"
  }'`}
            responseExample={`{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "campaign_id": "abc123-uuid",
    "donor_id": "donor-uuid",
    "phone_number": "+91-9876543210",
    "name": "Ramesh Kumar",
    "availability": "YES",
    "alternate_phone": "+91-9876543211",
    "current_location": "HSR Layout, Bangalore",
    "pincode": "560102",
    "eligibility": "Eligible - Last donation was 6 months ago",
    "donor_selected": "YES",
    "whatsapp_sent": "YES",
    "sms_sent": "YES",
    "email_sent": "NO",
    "call_id": "conv_abc123xyz",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}`}
          />
        </div>
      </div>

      {/* Enum Values Reference */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enum Values Reference</CardTitle>
          <CardDescription>Valid values for enum fields used across all APIs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Blood Types</h4>
            <div className="flex flex-wrap gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                <Badge key={type} variant="outline">{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Request Status</h4>
            <div className="flex flex-wrap gap-2">
              {["pending", "in_progress", "fulfilled", "cancelled"].map((status) => (
                <Badge key={status} variant="outline">{status}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Urgency Levels</h4>
            <div className="flex flex-wrap gap-2">
              {["immediate", "within_3_hours", "within_6_hours", "within_24_hours", "within_48_hours"].map((level) => (
                <Badge key={level} variant="outline">{level}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {["male", "female", "other"].map((gender) => (
                <Badge key={gender} variant="outline">{gender}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Error Responses</CardTitle>
          <CardDescription>Common error response formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">400 Bad Request - Validation Error</h4>
            <CodeBlock
              code={`{
  "success": false,
  "errors": [
    "patient_name is required",
    "blood_type is required and must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-"
  ]
}`}
              language="json"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">404 Not Found</h4>
            <CodeBlock
              code={`{
  "success": false,
  "error": "Request not found"
}`}
              language="json"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">405 Method Not Allowed</h4>
            <CodeBlock
              code={`{
  "error": "Method not allowed. Use GET, POST, PATCH, or DELETE."
}`}
              language="json"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">500 Internal Server Error</h4>
            <CodeBlock
              code={`{
  "success": false,
  "error": "Error message description"
}`}
              language="json"
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
