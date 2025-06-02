import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FileUpload from "@/components/ui/file-upload";
import { X, CheckCircle } from "lucide-react";
import { z } from "zod";
import { insertBirthRegistrationSchema } from "@shared/schema";

const birthFormSchema = insertBirthRegistrationSchema.extend({
  submittedBy: z.string().optional(),
});

interface BirthFormProps {
  form: UseFormReturn<z.infer<typeof birthFormSchema>>;
  onSubmit: (data: z.infer<typeof birthFormSchema>) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function BirthForm({ form, onSubmit, isSubmitting, onCancel }: BirthFormProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Birth Registration</h2>
              <p className="text-sm text-gov-gray mt-1">
                Complete all required information to register a birth
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-gov-blue">Child Info</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gov-gray rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm text-gov-gray">Parents</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gov-gray rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-gov-gray">Documents</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Child Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter child's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="childSex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Birth</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth *</FormLabel>
                      <FormControl>
                        <Input placeholder="Hospital name or location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Father's Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Father's Details</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherNationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fatherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Mother's Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Mother's Details</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherNationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gov-blue transition-colors">
                  <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">Hospital/Midwife Certificate *</p>
                  <p className="text-sm text-gov-gray mb-4">
                    Upload birth certificate from hospital or midwife
                  </p>
                  <Button type="button" className="bg-gov-blue hover:bg-blue-700 text-white">
                    Choose File
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gov-blue transition-colors">
                  <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">Parent Identification</p>
                  <p className="text-sm text-gov-gray mb-4">
                    Upload copies of parents' national ID cards
                  </p>
                  <Button type="button" className="bg-gov-blue hover:bg-blue-700 text-white">
                    Choose Files
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
