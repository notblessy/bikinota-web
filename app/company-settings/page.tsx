"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { useCompany, type BankAccount } from "@/contexts/company-context";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  X,
  Building2,
  Camera,
  BanknoteIcon as Bank,
  Plus,
  Star,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  swiftCode: z.string().optional(),
  routingNumber: z.string().optional(),
});

const companyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  email: z
    .union([
      z.string().email("Please enter a valid email address"),
      z.literal(""),
    ])
    .optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

export default function CompanySettingsPage() {
  const {
    companyInfo,
    updateCompanyInfo,
    uploadLogo,
    removeLogo,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
  } = useCompany();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Bank account form state
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);

  const bankForm = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      swiftCode: "",
      routingNumber: "",
    },
  });

  // Company info form
  const companyForm = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      name: companyInfo.name,
      address: companyInfo.address,
      city: companyInfo.city,
      state: companyInfo.state,
      zipCode: companyInfo.zipCode,
      country: companyInfo.country,
      email: companyInfo.email,
      phone: companyInfo.phone,
      website: companyInfo.website,
    },
  });

  // Update form when companyInfo changes
  React.useEffect(() => {
    companyForm.reset({
      name: companyInfo.name,
      address: companyInfo.address,
      city: companyInfo.city,
      state: companyInfo.state,
      zipCode: companyInfo.zipCode,
      country: companyInfo.country,
      email: companyInfo.email,
      phone: companyInfo.phone,
      website: companyInfo.website,
    });
  }, [companyInfo, companyForm]);

  const handleCompanyInfoSubmit = async (data: CompanyInfoFormValues) => {
    try {
      await updateCompanyInfo(data);
      toast({
        title: "Company information updated",
        description: "Your company information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update company information",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadLogo(file);
      toast({
        title: "Logo uploaded",
        description: "Your company logo has been successfully uploaded.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await removeLogo();
      toast({
        title: "Logo removed",
        description: "Your company logo has been removed.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove logo",
        description:
          error instanceof Error ? error.message : "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    companyForm.handleSubmit(handleCompanyInfoSubmit)();
  };

  const resetBankForm = () => {
    bankForm.reset({
      bankName: "",
      accountName: "",
      accountNumber: "",
      swiftCode: "",
      routingNumber: "",
    });
    setEditingBankId(null);
  };

  const openAddBankForm = () => {
    resetBankForm();
    setShowBankForm(true);
  };

  const openEditBankForm = (account: BankAccount) => {
    bankForm.reset({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      swiftCode: account.swiftCode || "",
      routingNumber: account.routingNumber || "",
    });
    setEditingBankId(account.id);
    setShowBankForm(true);
  };

  const handleBankFormSubmit = async (data: BankAccountFormValues) => {
    try {
      if (editingBankId) {
        await updateBankAccount(editingBankId, data);
        toast({
          title: "Bank account updated",
          description: "Your bank account has been successfully updated.",
        });
      } else {
        await addBankAccount(data);
        toast({
          title: "Bank account added",
          description: "Your bank account has been successfully added.",
        });
      }

      setShowBankForm(false);
      resetBankForm();
    } catch (error) {
      toast({
        title: "Operation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save bank account",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      try {
        await deleteBankAccount(id);
        toast({
          title: "Bank account deleted",
          description: "Your bank account has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Failed to delete bank account",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete bank account",
          variant: "destructive",
        });
      }
    }
  };

  const handleSetDefaultBank = async (id: string) => {
    try {
      await setDefaultBankAccount(id);
      toast({
        title: "Default bank account set",
        description: "Your default bank account has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to set default bank account",
        description:
          error instanceof Error
            ? error.message
            : "Failed to set default bank account",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 to-pink-50/30">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-gray-200 hover:border-gray-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Company Settings
              </h1>
              <p className="text-gray-600">
                Manage your company information and branding
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="company" className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center">
                <Bank className="h-4 w-4 mr-2" />
                Banking Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-8">
              {/* Company Logo */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Company Logo
                  </CardTitle>
                  <CardDescription>
                    Upload your company logo to appear on invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {companyInfo.logo ? (
                        <div className="relative">
                          <div className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-white">
                            <Image
                              src={companyInfo.logo || "/placeholder.svg"}
                              alt="Company Logo"
                              width={96}
                              height={96}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <label htmlFor="logo-upload">
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={isUploading}
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {isUploading ? "Uploading..." : "Upload Logo"}
                            </span>
                          </Button>
                        </label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {companyInfo.logo && (
                          <Button variant="ghost" onClick={handleRemoveLogo}>
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: Square image, max 5MB. Supports PNG, JPG,
                        GIF.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Form {...companyForm}>
                <form
                  onSubmit={companyForm.handleSubmit(handleCompanyInfoSubmit)}
                >
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                      <CardDescription>
                        This information will appear on your invoices
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={companyForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your Company Name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="www.yourcompany.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={companyForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Business Street"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={companyForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Business City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mt-6">
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        How customers can reach you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={companyForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="contact@yourcompany.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1 (555) 123-4567"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="banking" className="space-y-8">
              {/* Bank Accounts */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Bank Accounts</CardTitle>
                    <CardDescription>
                      Manage your bank accounts for invoices
                    </CardDescription>
                  </div>
                  <Button
                    onClick={openAddBankForm}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank
                  </Button>
                </CardHeader>
                <CardContent>
                  {companyInfo.bankAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Bank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No bank accounts yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Add your bank accounts to include on invoices
                      </p>
                      <Button onClick={openAddBankForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companyInfo.bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-4 rounded-lg border ${
                            account.isDefault
                              ? "border-rose-200 bg-rose-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Bank
                                className={`h-5 w-5 mr-3 ${
                                  account.isDefault
                                    ? "text-rose-600"
                                    : "text-gray-600"
                                }`}
                              />
                              <div>
                                <h3 className="font-medium text-gray-900 flex items-center">
                                  {account.bankName}
                                  {account.isDefault && (
                                    <span className="ml-2 text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {account.accountName} • ••••{" "}
                                  {account.accountNumber.slice(-4)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!account.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSetDefaultBank(account.id)
                                  }
                                  className="text-gray-600"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditBankForm(account)}
                                className="text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBank(account.id)}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8">
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Bank Account Form Dialog */}
      <Dialog open={showBankForm} onOpenChange={setShowBankForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBankId ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
            <DialogDescription>
              {editingBankId
                ? "Update your bank account details"
                : "Add your bank account details to include on invoices"}
            </DialogDescription>
          </DialogHeader>

          <Form {...bankForm}>
            <form
              onSubmit={bankForm.handleSubmit(handleBankFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={bankForm.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bank of Example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bankForm.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bankForm.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={bankForm.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input placeholder="987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bankForm.control}
                  name="swiftCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SWIFT/BIC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="EXAMPLEXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBankForm(false);
                    resetBankForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bankForm.formState.isSubmitting}
                >
                  {bankForm.formState.isSubmitting
                    ? "Saving..."
                    : editingBankId
                    ? "Update Bank Account"
                    : "Add Bank Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
