import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, X } from "lucide-react";
import { z } from "zod";
import { insertDeathRegistrationSchema } from "@shared/schema";

const deathFormSchema = insertDeathRegistrationSchema.extend({
  submittedBy: z.string().optional(),
});

interface DeathFormProps {
  form: UseFormReturn<z.infer<typeof deathFormSchema>>;
  onSubmit: (data: z.infer<typeof deathFormSchema>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function DeathForm({ form, onSubmit, isSubmitting, onCancel }: DeathFormProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Death Registration</h2>
              <p className="text-sm text-gov-gray mt-1">
                Complete all required information to register a death
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Deceased Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deceased Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="deceasedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name of Deceased *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Death *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Death</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Death *</FormLabel>
                      <FormControl>
                        <Input placeholder="Hospital name or location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="causeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cause of Death *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the cause of death as stated by medical professional"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Next of Kin Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next of Kin Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nextOfKinName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter next of kin's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextOfKinRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Deceased *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spouse, Child, Parent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextOfKinContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextOfKinNationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input placeholder="National ID number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gov-blue transition-colors">
                  <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">Medical Certificate of Death *</p>
                  <p className="text-sm text-gov-gray mb-4">
                    Upload death certificate from hospital or medical professional
                  </p>
                  <Button type="button" className="bg-gov-blue hover:bg-blue-700 text-white">
                    Choose File
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gov-blue transition-colors">
                  <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">Next of Kin Identification</p>
                  <p className="text-sm text-gov-gray mb-4">
                    Upload copy of next of kin's national ID card
                  </p>
                  <Button type="button" className="bg-gov-blue hover:bg-blue-700 text-white">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gov-blue hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
