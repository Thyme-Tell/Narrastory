import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  coverUrl: string;
  gutsUrl: string;
}

interface OrderItem {
  sku: string;
  quantity: number;
  retailPrice: string;
  itemDescription: string;
  product: Product;
}

interface Destination {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
}

interface CreateOrderRequest {
  destination: Destination;
  orderItems: OrderItem[];
}

export const useRPIPrint = () => {
  const { toast } = useToast();

  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data, error } = await supabase.functions.invoke('rpi-print-order', {
        body: orderData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Print order created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating print order:', error);
      toast({
        title: "Error",
        description: "Failed to create print order",
        variant: "destructive",
      });
    },
  });

  return {
    createOrder,
  };
};