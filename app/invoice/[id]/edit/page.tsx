"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { useInvoice, type InvoiceItem } from "@/contexts/invoice-context";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoice, updateInvoice } = useInvoice();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  const invoice = getInvoice(invoiceId);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [status, setStatus] = useState<"draft" | "sent" | "paid">("draft");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customerName);
      setCustomerEmail(invoice.customerEmail);
      setDueDate(invoice.dueDate || "");
      setTaxRate(invoice.taxRate);
      setStatus(invoice.status);
      setItems(invoice.items);
    }
  }, [invoice]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (
      items.some((item) => !item.name || item.quantity <= 0 || item.price < 0)
    ) {
      toast({
        title: "Invalid items",
        description:
          "Please ensure all items have valid names, quantities, and prices.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateInvoice(invoiceId, {
        customerName,
        customerEmail,
        dueDate,
        taxRate,
        status,
        items,
      });

      toast({
        title: "Invoice updated",
        description: "Your invoice has been successfully updated.",
      });

      router.push(`/invoice/${invoiceId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <Link href={`/invoice/${invoiceId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-gray-200 hover:border-gray-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Invoice
                </Button>
              </Link>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600">Update your invoice details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Update your customer's details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value: "draft" | "sent" | "paid") =>
                        setStatus(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>Update items in your invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-4 bg-gray-50/50"
                  >
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label>Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Item description (optional)"
                          className="text-sm text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <Label>Price</Label>
                        <NumberInput
                          value={item.price}
                          onValueChange={(value: number | undefined) =>
                            updateItem(item.id, "price", value ?? 0)
                          }
                          allowNegative={false}
                          decimalScale={0}
                          thousandSeparator="."
                          prefix="Rp "
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <Label>Total</Label>
                        <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50 text-sm font-medium">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item.quantity * item.price)}
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Tax and Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Tax & Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <NumberInput
                      id="taxRate"
                      value={taxRate}
                      onValueChange={(value: number | undefined) =>
                        setTaxRate(value ?? 0)
                      }
                      allowNegative={false}
                      decimalScale={2}
                      suffix="%"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Tax{" "}
                      <span className="text-xs text-gray-500">
                        ({taxRate}%)
                      </span>
                      :
                    </span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(calculateTax())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(calculateTotal())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href={`/invoice/${invoiceId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Invoice"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
