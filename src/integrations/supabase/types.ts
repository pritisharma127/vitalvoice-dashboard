export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blood_requests: {
        Row: {
          admin_user_id: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          caretaker_email: string
          caretaker_name: string | null
          caretaker_phone: string
          created_at: string
          hospital_city: string
          hospital_name: string
          hospital_zipcode: string
          id: string
          notes: string | null
          patient_age: number
          patient_gender: Database["public"]["Enums"]["gender_type"]
          patient_name: string
          quantity_units: number
          reason: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          admin_user_id?: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          caretaker_email: string
          caretaker_name?: string | null
          caretaker_phone: string
          created_at?: string
          hospital_city: string
          hospital_name: string
          hospital_zipcode: string
          id?: string
          notes?: string | null
          patient_age: number
          patient_gender: Database["public"]["Enums"]["gender_type"]
          patient_name: string
          quantity_units?: number
          reason?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          admin_user_id?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          caretaker_email?: string
          caretaker_name?: string | null
          caretaker_phone?: string
          created_at?: string
          hospital_city?: string
          hospital_name?: string
          hospital_zipcode?: string
          id?: string
          notes?: string | null
          patient_age?: number
          patient_gender?: Database["public"]["Enums"]["gender_type"]
          patient_name?: string
          quantity_units?: number
          reason?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: []
      }
      call_transactions: {
        Row: {
          address: string
          alternate_phone: string | null
          availability: string | null
          blood_type: string
          call_id: string | null
          campaign_id: string
          created_at: string
          current_location: string | null
          donor_id: string
          donor_selected: string | null
          eligibility: string | null
          email_sent: string | null
          gender: string | null
          hospital_location: string
          id: string
          name: string
          phone_number: string
          pincode: string | null
          reason: string | null
          sms_sent: string | null
          updated_at: string
          urgency: string
          whatsapp_sent: string | null
          zip: string
        }
        Insert: {
          address: string
          alternate_phone?: string | null
          availability?: string | null
          blood_type: string
          call_id?: string | null
          campaign_id: string
          created_at?: string
          current_location?: string | null
          donor_id: string
          donor_selected?: string | null
          eligibility?: string | null
          email_sent?: string | null
          gender?: string | null
          hospital_location: string
          id?: string
          name: string
          phone_number: string
          pincode?: string | null
          reason?: string | null
          sms_sent?: string | null
          updated_at?: string
          urgency: string
          whatsapp_sent?: string | null
          zip: string
        }
        Update: {
          address?: string
          alternate_phone?: string | null
          availability?: string | null
          blood_type?: string
          call_id?: string | null
          campaign_id?: string
          created_at?: string
          current_location?: string | null
          donor_id?: string
          donor_selected?: string | null
          eligibility?: string | null
          email_sent?: string | null
          gender?: string | null
          hospital_location?: string
          id?: string
          name?: string
          phone_number?: string
          pincode?: string | null
          reason?: string | null
          sms_sent?: string | null
          updated_at?: string
          urgency?: string
          whatsapp_sent?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_transactions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string
          age: number | null
          area: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          city: string
          created_at: string
          email: string | null
          id: string
          is_available: boolean | null
          last_donation_date: string | null
          name: string
          phone_number: string
          state: string
          updated_at: string
          zipcode: string
        }
        Insert: {
          address: string
          age?: number | null
          area?: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          city: string
          created_at?: string
          email?: string | null
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          name: string
          phone_number: string
          state: string
          updated_at?: string
          zipcode: string
        }
        Update: {
          address?: string
          age?: number | null
          area?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          name?: string
          phone_number?: string
          state?: string
          updated_at?: string
          zipcode?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          name: string
          phone: string | null
          zipcode: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          zipcode: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          zipcode?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          hospital_id: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          hospital_id?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          hospital_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      gender_type: "male" | "female" | "other"
      request_status: "pending" | "in_progress" | "fulfilled" | "cancelled"
      urgency_level:
        | "immediate"
        | "within_3_hours"
        | "within_6_hours"
        | "within_24_hours"
        | "within_48_hours"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      gender_type: ["male", "female", "other"],
      request_status: ["pending", "in_progress", "fulfilled", "cancelled"],
      urgency_level: [
        "immediate",
        "within_3_hours",
        "within_6_hours",
        "within_24_hours",
        "within_48_hours",
      ],
    },
  },
} as const
