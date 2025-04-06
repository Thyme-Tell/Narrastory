
// This file re-exports the toast components from the hooks directory
// to maintain API compatibility
import { useToast as useToastHook, toast } from "@/hooks/use-toast";

export { useToastHook as useToast, toast };
