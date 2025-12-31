"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { useInvoice } from "@/contexts/invoice-context";
import { useCompany } from "@/contexts/company-context";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  BanknoteIcon as Bank,
} from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoice } = useInvoice();
  const { companyInfo } = useCompany();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  // Redirect if someone tries to access /invoice/new through the dynamic route
  useEffect(() => {
    if (invoiceId === "new") {
      router.replace("/invoice/new");
      return;
    }
  }, [invoiceId, router]);

  const invoice = getInvoice(invoiceId);
  const bankAccount = invoice?.bankAccountId
    ? companyInfo.bankAccounts.find(
        (account) => account.id === invoice.bankAccountId
      )
    : companyInfo.bankAccounts.find((account) => account.isDefault);

  // Don't render anything if this is the "new" route
  if (invoiceId === "new") {
    return null;
  }

  if (!invoice) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invoice not found
              </h2>
              <p className="text-gray-600 mb-4">
                The invoice you're looking for doesn't exist.
              </p>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleExportPDF = () => {
    // Add print stylesheet to remove borders, shadows, and minimize browser headers/footers
    const style = document.createElement("style");
    style.textContent = `
      @page {
        margin: 0;
        size: A4;
      }
      @media print {
        /* Remove browser header/footer margins */
        @page {
          margin: 0;
          size: A4;
        }
        
        /* Hide everything except invoice content */
        body * {
          visibility: hidden;
        }
        
        #invoice-content,
        #invoice-content * {
          visibility: visible;
        }
        
        #invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          page-break-after: avoid;
        }
        
        /* Remove only outer card border */
        #invoice-content > div > [class*="Card"] {
          border: none !important;
          border-width: 0 !important;
        }
        
        /* Keep table outer border */
        #invoice-content table {
          border: 1px solid #d1d5db !important;
        }
        
        /* Keep table borders */
        #invoice-content table tr.border-b,
        #invoice-content table tr[class*="border-b"] {
          border-bottom: 1px solid #e5e7eb !important;
        }
        
        /* Keep table header grey background - force print */
        #invoice-content table thead tr,
        #invoice-content table thead tr[class*="bg-gray"],
        #invoice-content table thead tr.bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Force background colors to print */
        #invoice-content [class*="bg-gray-50"],
        #invoice-content [class*="bg-gray-100"] {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Ensure padding is preserved */
        #invoice-content [class*="CardContent"] {
          padding: 3rem !important;
        }
        
        /* Force grid to display side by side in print */
        #invoice-content .grid {
          display: grid !important;
          gap: 3rem !important;
          column-gap: 3rem !important;
          row-gap: 3rem !important;
        }
        
        /* Ensure specific spacing for invoice details and payment sections */
        #invoice-content .grid.gap-12,
        #invoice-content [class*="grid"][class*="gap-12"],
        #invoice-content [class*="grid-cols-2"] {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 3rem !important;
          column-gap: 3rem !important;
          row-gap: 3rem !important;
        }
        
        /* Ensure grid columns don't stack in print */
        #invoice-content .grid > div {
          display: block !important;
        }
        
        /* Add explicit padding to grid children for print */
        #invoice-content .grid > div.print\\:pr-6 {
          padding-right: 1.5rem !important;
        }
        
        #invoice-content .grid > div.print\\:pl-6 {
          padding-left: 1.5rem !important;
        }
        
        /* Preserve margin bottom for spacing */
        #invoice-content .mb-8 {
          margin-bottom: 2rem !important;
        }
        
        /* Keep separator/dividers */
        #invoice-content [role="separator"],
        #invoice-content hr,
        #invoice-content [class*="Separator"] {
          border-top: 1px solid #e5e7eb !important;
          border-bottom: none !important;
        }
        
        /* Remove all shadows */
        #invoice-content *,
        #invoice-content [class*="shadow"] {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
        
        /* Remove rounded corners */
        #invoice-content *,
        #invoice-content [class*="rounded"] {
          border-radius: 0 !important;
        }
        
        /* Remove background colors except white */
        #invoice-content [class*="bg-gray"],
        #invoice-content [class*="bg-rose"],
        #invoice-content [class*="bg-pink"],
        #invoice-content [class*="backdrop"] {
          background: white !important;
          background-color: white !important;
        }
        
        /* Ensure clean white background */
        #invoice-content {
          background: white !important;
          background-color: white !important;
        }
        
        /* Ensure text is readable */
        #invoice-content {
          color: black !important;
        }
        
        /* Hide navigation and buttons */
        nav,
        button,
        .navbar,
        [class*="navbar"] {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Trigger print
    window.print();

    // Clean up after print dialog closes
    setTimeout(() => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 1000);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <p className="text-gray-600">
                  Created on {formatDate(invoice.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/invoice/${invoice.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  onClick={handleExportPDF}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <div id="invoice-content">
            <Card className="mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-12">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-start space-x-4">
                    {/* Company Logo */}
                    {companyInfo.logo ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                        <Image
                          src={companyInfo.logo || "/placeholder.svg"}
                          alt={companyInfo.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                    )}

                    {/* Company Information */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {companyInfo.name}
                      </h2>
                      <div className="text-sm text-gray-600">
                        <p className="inline">
                          {companyInfo.address}
                          {companyInfo.address &&
                            (companyInfo.city ||
                              companyInfo.state ||
                              companyInfo.zipCode ||
                              companyInfo.country) &&
                            ", "}
                          {companyInfo.city && `${companyInfo.city}`}
                          {companyInfo.city && companyInfo.state && ", "}
                          {companyInfo.state && `${companyInfo.state}`}
                          {companyInfo.state && companyInfo.zipCode && " "}
                          {companyInfo.zipCode && `${companyInfo.zipCode}`}
                          {(companyInfo.city ||
                            companyInfo.state ||
                            companyInfo.zipCode) &&
                            companyInfo.country &&
                            ", "}
                          {companyInfo.country && `${companyInfo.country}`}
                        </p>
                        <p>{companyInfo.email}</p>
                        <p>{companyInfo.phone}</p>
                        {companyInfo.website && <p>{companyInfo.website}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      INVOICE
                    </h2>
                    <p className="text-gray-600 mb-1">
                      #{invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(invoice.createdAt)}
                    </p>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 print:gap-12">
                  <div className="print:pr-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Bill To:
                    </h3>
                    <p className="font-medium">{invoice.customerName}</p>
                    <p className="text-gray-600">{invoice.customerEmail}</p>
                  </div>
                  {invoice.dueDate && (
                    <div className="text-right print:pl-6">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date:</span>
                          <span>{formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="mb-8" />

                {/* Invoice Items */}
                <div className="mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="border-b bg-gray-100">
                          <th className="text-left py-3 px-2">Item</th>
                          <th className="text-right py-3 px-2">Qty</th>
                          <th className="text-right py-3 px-2">Price</th>
                          <th className="text-right py-3 px-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="border-b text-sm">
                            <td className="p-3">
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className="text-right p-3">{item.quantity}</td>
                            <td className="text-right p-3">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="text-right p-3">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Info and Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:gap-12">
                  {/* Bank Information */}
                  {bankAccount && (
                    <div className="bg-gray-50 p-3 rounded-lg print:pr-6">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">{bankAccount.bankName}</p>
                          <p>{bankAccount.accountName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Number:</p>
                          <p className="font-medium">
                            {bankAccount.accountNumber}
                          </p>
                        </div>
                        {bankAccount.routingNumber && (
                          <div>
                            <p className="text-gray-600">Routing Number:</p>
                            <p className="font-medium">
                              {bankAccount.routingNumber}
                            </p>
                          </div>
                        )}
                        {bankAccount.swiftCode && (
                          <div>
                            <p className="text-gray-600">SWIFT/BIC Code:</p>
                            <p className="font-medium">
                              {bankAccount.swiftCode}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Invoice Totals */}
                  <div
                    className={`${
                      bankAccount ? "" : "md:col-start-2"
                    } flex justify-end print:pl-6`}
                  >
                    <div className="w-56 space-y-2 text-right ml-auto">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Tax{" "}
                          <span className="text-xs text-gray-500">
                            ({invoice.taxRate}%)
                          </span>
                          :
                        </span>
                        <span>{formatCurrency(invoice.taxAmount)}</span>
                      </div>

                      {/* Adjustments */}
                      {invoice.adjustments &&
                        invoice.adjustments.length > 0 && (
                          <>
                            <Separator />
                            {invoice.adjustments.map((adjustment) => (
                              <div
                                key={adjustment.id}
                                className="flex justify-between text-sm"
                              >
                                <span>{adjustment.description}:</span>
                                <span
                                  className={
                                    adjustment.type === "deduction"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }
                                >
                                  {adjustment.type === "deduction" ? "-" : "+"}{" "}
                                  {formatCurrency(adjustment.amount)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between">
                              <span>Adjustments Total:</span>
                              <span
                                className={
                                  invoice.adjustmentsTotal < 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }
                              >
                                {invoice.adjustmentsTotal >= 0 ? "+" : ""}{" "}
                                {formatCurrency(invoice.adjustmentsTotal)}
                              </span>
                            </div>
                          </>
                        )}

                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
