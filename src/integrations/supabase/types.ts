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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booked_by: string | null
          booking_ref: string | null
          branch_id: string
          commission_amount: number
          created_at: string | null
          deleted_at: string | null
          discount_amount: number
          fare_amount: number
          id: string
          mpesa_receipt: string | null
          passenger_name: string
          passenger_phone: string
          payment_method: string | null
          payment_status: string | null
          seat_number: string | null
          trip_id: string
        }
        Insert: {
          booked_by?: string | null
          booking_ref?: string | null
          branch_id: string
          commission_amount?: number
          created_at?: string | null
          deleted_at?: string | null
          discount_amount?: number
          fare_amount: number
          id?: string
          mpesa_receipt?: string | null
          passenger_name: string
          passenger_phone: string
          payment_method?: string | null
          payment_status?: string | null
          seat_number?: string | null
          trip_id: string
        }
        Update: {
          booked_by?: string | null
          booking_ref?: string | null
          branch_id?: string
          commission_amount?: number
          created_at?: string | null
          deleted_at?: string | null
          discount_amount?: number
          fare_amount?: number
          id?: string
          mpesa_receipt?: string | null
          passenger_name?: string
          passenger_phone?: string
          payment_method?: string | null
          payment_status?: string | null
          seat_number?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          town: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          town?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          town?: string | null
        }
        Relationships: []
      }
      buses: {
        Row: {
          branch_id: string | null
          capacity: number
          created_at: string
          id: string
          model: string | null
          plate_number: string
          status: string
        }
        Insert: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          model?: string | null
          plate_number: string
          status?: string
        }
        Update: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          model?: string | null
          plate_number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "buses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          logged_by: string | null
          spent_at: string | null
        }
        Insert: {
          amount: number
          branch_id: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          spent_at?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          spent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          access_password: string
          booked_by: string | null
          created_at: string | null
          description: string | null
          destination_branch_id: string
          fare_amount: number
          id: string
          mpesa_receipt: string | null
          origin_branch_id: string
          payment_status: string | null
          receiver_name: string
          receiver_phone: string
          sender_name: string
          sender_phone: string
          status: string | null
          tracking_code: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          access_password: string
          booked_by?: string | null
          created_at?: string | null
          description?: string | null
          destination_branch_id: string
          fare_amount: number
          id?: string
          mpesa_receipt?: string | null
          origin_branch_id: string
          payment_status?: string | null
          receiver_name: string
          receiver_phone: string
          sender_name: string
          sender_phone: string
          status?: string | null
          tracking_code: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          access_password?: string
          booked_by?: string | null
          created_at?: string | null
          description?: string | null
          destination_branch_id?: string
          fare_amount?: number
          id?: string
          mpesa_receipt?: string | null
          origin_branch_id?: string
          payment_status?: string | null
          receiver_name?: string
          receiver_phone?: string
          sender_name?: string
          sender_phone?: string
          status?: string | null
          tracking_code?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          booking_id: string | null
          created_at: string
          full_name: string
          id: string
          id_number: string | null
          phone: string | null
          seat_number: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          id_number?: string | null
          phone?: string | null
          seat_number?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          id_number?: string | null
          phone?: string | null
          seat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mpesa_checkout_request_id: string | null
          mpesa_receipt_number: string | null
          phone: string
          raw_callback: Json | null
          reference_id: string
          reference_type: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone: string
          raw_callback?: Json | null
          reference_id: string
          reference_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone?: string
          raw_callback?: Json | null
          reference_id?: string
          reference_type?: string
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          base_fare: number
          created_at: string | null
          destination: string
          id: string
          origin_branch_id: string | null
        }
        Insert: {
          base_fare: number
          created_at?: string | null
          destination: string
          id?: string
          origin_branch_id?: string | null
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          destination?: string
          id?: string
          origin_branch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          branch_id: string
          bus_plate: string | null
          created_at: string | null
          deleted_at: string | null
          departure_time: string
          dispatch_status: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          route_id: string | null
          seats_booked: number
          status: string | null
          total_seats: number
        }
        Insert: {
          branch_id: string
          bus_plate?: string | null
          created_at?: string | null
          deleted_at?: string | null
          departure_time: string
          dispatch_status?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_id?: string | null
          seats_booked?: number
          status?: string | null
          total_seats?: number
        }
        Update: {
          branch_id?: string
          bus_plate?: string | null
          created_at?: string | null
          deleted_at?: string | null
          departure_time?: string
          dispatch_status?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_id?: string | null
          seats_booked?: number
          status?: string | null
          total_seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "trips_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_branch: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      create_public_booking: {
        Args: {
          _id_number?: string
          _passenger_name: string
          _passenger_phone: string
          _seat_number: string
          _trip_id: string
        }
        Returns: {
          booking_id: string
          booking_ref: string
          fare: number
        }[]
      }
      expire_pending_bookings: { Args: never; Returns: undefined }
      get_taken_seats: {
        Args: { _trip_id: string }
        Returns: {
          seat_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_main_admin: { Args: never; Returns: boolean }
      is_staff_admin: { Args: { _user_id: string }; Returns: boolean }
      track_booking: {
        Args: { _booking_ref: string; _phone: string }
        Returns: {
          booking_ref: string
          bus_plate: string
          created_at: string
          departure_time: string
          destination: string
          fare_amount: number
          mpesa_receipt: string
          origin: string
          passenger_name: string
          payment_status: string
          seat_number: string
        }[]
      }
      track_parcel: {
        Args: { _access_password: string; _tracking_code: string }
        Returns: {
          created_at: string
          destination: string
          origin: string
          payment_status: string
          status: string
          tracking_code: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "administrator"
        | "manager"
        | "booking_agent"
        | "dispatcher"
        | "parcel_staff"
        | "finance_staff"
        | "branch_staff"
      user_role: "admin" | "clerk"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "super_admin",
        "administrator",
        "manager",
        "booking_agent",
        "dispatcher",
        "parcel_staff",
        "finance_staff",
        "branch_staff",
      ],
      user_role: ["admin", "clerk"],
    },
  },
} as const
