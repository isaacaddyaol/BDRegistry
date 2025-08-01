import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertBirthRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import Header from "@/components/layout/header";
import BirthForm from "@/components/forms/birth-form";
import { useLocation } from "wouter";

const birthFormSchema = insertBirthRegistrationSchema.extend({
  submittedBy: z.string().optional(),
});

export default function BirthRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // No authentication required

  const form = useForm<z.infer<typeof birthFormSchema>>({
    resolver: zodResolver(birthFormSchema),
    defaultValues: {
      childName: "",
      childSex: "",
      dateOfBirth: "",
      timeOfBirth: "",
      placeOfBirth: "",
      fatherName: "",
      fatherNationalId: "",
      fatherDateOfBirth: "",
      fatherOccupation: "",
      motherName: "",
      motherNationalId: "",
      motherDateOfBirth: "",
      motherOccupation: "",
    },
  });

  const createBirthRegistration = useMutation({
    mutationFn: async (data: z.infer<typeof birthFormSchema>) => {
      const response = await apiRequest("POST", "/api/birth-registrations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Birth registration submitted successfully! You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birth-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/signin";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit birth registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof birthFormSchema>) => {
    createBirthRegistration.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gov-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gov-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BirthForm 
          form={form}
          onSubmit={onSubmit}
          isSubmitting={createBirthRegistration.isPending}
          onCancel={() => setLocation("/")}
        />
      </div>
    </div>
  );
}
