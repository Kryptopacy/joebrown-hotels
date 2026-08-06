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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string
          guests_count: number | null
          hotel_id: string | null
          id: string
          payment_status: string
          room_id: string | null
          special_requests: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone: string
          guests_count?: number | null
          hotel_id?: string | null
          id?: string
          payment_status?: string
          room_id?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string
          guests_count?: number | null
          hotel_id?: string | null
          id?: string
          payment_status?: string
          room_id?: string | null
          special_requests?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_intercom_messages: {
        Row: {
          created_at: string
          guest_name: string
          hotel_id: string | null
          id: string
          is_read: boolean | null
          message: string
          requires_human: boolean | null
          room_or_table: string | null
          sender_role: string | null
          sender_type: string
          session_id: string
          status: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          hotel_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          requires_human?: boolean | null
          room_or_table?: string | null
          sender_role?: string | null
          sender_type: string
          session_id: string
          status?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          hotel_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          requires_human?: boolean | null
          room_or_table?: string | null
          sender_role?: string | null
          sender_type?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_intercom_messages_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          comments: string | null
          created_at: string | null
          guest_email: string | null
          guest_name: string | null
          hotel_id: string | null
          id: string
          rating: number
        }
        Insert: {
          category: string
          comments?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          hotel_id?: string | null
          id?: string
          rating: number
        }
        Update: {
          category?: string
          comments?: string | null
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          hotel_id?: string | null
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "feedback_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          hotel_id: string
          id: string
          is_active: boolean | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          hotel_id: string
          id?: string
          is_active?: boolean | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string | null
          hotel_id: string | null
          id: string
          loyalty_points: number | null
          name: string
          phone_number: string
          total_spend: number | null
          updated_at: string | null
          visit_count: number | null
        }
        Insert: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          loyalty_points?: number | null
          name: string
          phone_number: string
          total_spend?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Update: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          loyalty_points?: number | null
          name?: string
          phone_number?: string
          total_spend?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          ai_amenities: string | null
          ai_checkin_policy: string | null
          ai_custom_faq: string | null
          ai_parking_info: string | null
          ai_pet_smoking_policy: string | null
          ai_wifi_info: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          brand_color_primary: string | null
          created_at: string | null
          description: string | null
          gallery_randomize: boolean | null
          hero_image_url: string | null
          id: string
          logo_url: string | null
          loyalty_milestone_threshold: number | null
          naira_per_loyalty_point: number | null
          name: string
          slug: string
          tagline: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          ai_amenities?: string | null
          ai_checkin_policy?: string | null
          ai_custom_faq?: string | null
          ai_parking_info?: string | null
          ai_pet_smoking_policy?: string | null
          ai_wifi_info?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_color_primary?: string | null
          created_at?: string | null
          description?: string | null
          gallery_randomize?: boolean | null
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          loyalty_milestone_threshold?: number | null
          naira_per_loyalty_point?: number | null
          name: string
          slug: string
          tagline?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          ai_amenities?: string | null
          ai_checkin_policy?: string | null
          ai_custom_faq?: string | null
          ai_parking_info?: string | null
          ai_pet_smoking_policy?: string | null
          ai_wifi_info?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_color_primary?: string | null
          created_at?: string | null
          description?: string | null
          gallery_randomize?: boolean | null
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          loyalty_milestone_threshold?: number | null
          naira_per_loyalty_point?: number | null
          name?: string
          slug?: string
          tagline?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          display_order: number | null
          hotel_id: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string | null
        }
        Insert: {
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: string | null
        }
        Update: {
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          hotel_id: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          item_price: number
          menu_item_id: string | null
          order_id: string | null
          quantity: number
        }
        Insert: {
          id?: string
          item_name: string
          item_price: number
          menu_item_id?: string | null
          order_id?: string | null
          quantity?: number
        }
        Update: {
          id?: string
          item_name?: string
          item_price?: number
          menu_item_id?: string | null
          order_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          guest_name: string
          hotel_id: string | null
          id: string
          order_number: string
          payment_method: string | null
          payment_screenshot_url: string | null
          payment_status: string
          room_or_table: string | null
          special_instructions: string | null
          status: string
          stream: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guest_name: string
          hotel_id?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string
          room_or_table?: string | null
          special_instructions?: string | null
          status?: string
          stream?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guest_name?: string
          hotel_id?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string
          room_or_table?: string | null
          special_instructions?: string | null
          status?: string
          stream?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          created_at: string | null
          description: string | null
          display_order: number | null
          hotel_id: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          max_guests: number | null
          name: string
          price_per_night: number
          size_sqm: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          max_guests?: number | null
          name: string
          price_per_night?: number
          size_sqm?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hotel_id?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          max_guests?: number | null
          name?: string
          price_per_night?: number
          size_sqm?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string | null
          hotel_id: string | null
          id: string
          request_type: string
          room_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          request_type: string
          room_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          request_type?: string
          room_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          hotel_id: string | null
          id: string
          setting_key: string
          setting_value: Json
        }
        Insert: {
          hotel_id?: string | null
          id?: string
          setting_key: string
          setting_value: Json
        }
        Update: {
          hotel_id?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_approved_staff: { Args: never; Returns: boolean }
      is_dev_or_owner: { Args: never; Returns: boolean }
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
