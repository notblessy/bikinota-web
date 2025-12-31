"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { useInvoice } from "@/contexts/invoice-context";
import { usePlan } from "@/contexts/plan-context";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Crown,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompany } from "@/contexts/company-context";

export default function DashboardPage() {
  const { invoices, deleteInvoice } = useInvoice();
  const { canCreateInvoice, currentPlan, invoicesThisMonth, monthlyLimit } =
    usePlan();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const { companyInfo } = useCompany();

  const handleCreateInvoice = () => {
    if (!canCreateInvoice) {
      setShowUpgradeModal(true);
      return;
    }
    router.push("/create-invoice");
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        toast({
          title: "Invoice deleted",
          description: "The invoice has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Failed to delete invoice",
          description:
            error instanceof Error ? error.message : "Failed to delete invoice",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 to-pink-50/50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your invoices and track your business
              </p>
            </div>
            <Button
              onClick={handleCreateInvoice}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invoicesThisMonth}
                  {currentPlan === "free" && (
                    <span className="text-sm font-normal text-gray-500">
                      /{monthlyLimit}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    invoices
                      .filter((inv) => inv.status === "paid")
                      .reduce((sum, inv) => sum + inv.total, 0)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Plan
                </CardTitle>
                {currentPlan === "unlimited" ? (
                  <Crown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {currentPlan}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Setup Prompt */}
          {companyInfo.name === "Your Company Name" && (
            <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Complete your company setup
                      </h3>
                      <p className="text-gray-600">
                        Add your company information and logo to create
                        professional invoices
                      </p>
                    </div>
                  </div>
                  <Link href="/company-settings">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Setup Company
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices Table */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                {invoices.length === 0
                  ? "No invoices yet. Create your first invoice to get started."
                  : `You have ${invoices.length} invoice${
                      invoices.length !== 1 ? "s" : ""
                    } total.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No invoices yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first invoice
                  </p>
                  <Button
                    onClick={handleCreateInvoice}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/invoice/${invoice.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/invoice/${invoice.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade Required</DialogTitle>
              <DialogDescription>
                You've reached your monthly limit of {monthlyLimit} invoices.
                Upgrade to unlimited to create more invoices.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Link href="/billing">
                <Button>Upgrade Now</Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
