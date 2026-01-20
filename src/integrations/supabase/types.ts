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
      custom_filters: {
        Row: {
          created_at: string
          description: string | null
          filter_criteria: Json
          id: string
          matched_applicant_ids: string[] | null
          name: string
          original_query: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filter_criteria: Json
          id?: string
          matched_applicant_ids?: string[] | null
          name: string
          original_query?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filter_criteria?: Json
          id?: string
          matched_applicant_ids?: string[] | null
          name?: string
          original_query?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      talent_pool_applicants: {
        Row: {
          application_responses: Json | null
          applied_date: string
          category: string
          created_at: string
          current_company: string | null
          education: string | null
          email: string
          employment_type: string
          expected_salary: string | null
          experience_level: string
          id: string
          linkedin: string | null
          name: string
          notice_period: string | null
          phone: string | null
          portfolio: string | null
          skills: string[] | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          application_responses?: Json | null
          applied_date?: string
          category: string
          created_at?: string
          current_company?: string | null
          education?: string | null
          email: string
          employment_type: string
          expected_salary?: string | null
          experience_level: string
          id?: string
          linkedin?: string | null
          name: string
          notice_period?: string | null
          phone?: string | null
          portfolio?: string | null
          skills?: string[] | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          application_responses?: Json | null
          applied_date?: string
          category?: string
          created_at?: string
          current_company?: string | null
          education?: string | null
          email?: string
          employment_type?: string
          expected_salary?: string | null
          experience_level?: string
          id?: string
          linkedin?: string | null
          name?: string
          notice_period?: string | null
          phone?: string | null
          portfolio?: string | null
          skills?: string[] | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      work_with_us_applicants: {
        Row: {
          application_responses: Json | null
          applied_date: string
          category: string
          created_at: string
          current_company: string | null
          education: string | null
          email: string
          employment_type: string
          expected_salary: string | null
          experience_level: string
          id: string
          job_description: string | null
          job_id: string | null
          linkedin: string | null
          name: string
          notice_period: string | null
          phone: string | null
          portfolio: string | null
          skills: string[] | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          application_responses?: Json | null
          applied_date?: string
          category: string
          created_at?: string
          current_company?: string | null
          education?: string | null
          email: string
          employment_type: string
          expected_salary?: string | null
          experience_level: string
          id?: string
          job_description?: string | null
          job_id?: string | null
          linkedin?: string | null
          name: string
          notice_period?: string | null
          phone?: string | null
          portfolio?: string | null
          skills?: string[] | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          application_responses?: Json | null
          applied_date?: string
          category?: string
          created_at?: string
          current_company?: string | null
          education?: string | null
          email?: string
          employment_type?: string
          expected_salary?: string | null
          experience_level?: string
          id?: string
          job_description?: string | null
          job_id?: string | null
          linkedin?: string | null
          name?: string
          notice_period?: string | null
          phone?: string | null
          portfolio?: string | null
          skills?: string[] | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
