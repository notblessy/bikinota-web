"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "./auth-context";

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceAdjustment {
  id: string;
  description: string;
  type: "addition" | "deduction";
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  adjustments: InvoiceAdjustment[];
  taxRate: number;
  status: "draft" | "sent" | "paid";
  createdAt: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  adjustmentsTotal: number;
  total: number;
  bankAccountId?: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  createInvoice: (
    invoice: Omit<
      Invoice,
      | "id"
      | "invoiceNumber"
      | "createdAt"
      | "subtotal"
      | "taxAmount"
      | "adjustmentsTotal"
      | "total"
    >
  ) => Promise<string>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceResponse {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  due_date: string;
  tax_rate: number;
  status: "draft" | "sent" | "paid";
  subtotal: number;
  tax_amount: number;
  adjustments_total: number;
  total: number;
  bank_account_id?: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  adjustments: Array<{
    id: string;
    description: string;
    type: "addition" | "deduction";
    amount: number;
  }>;
  created_at: string;
}

function mapInvoiceResponse(response: InvoiceResponse): Invoice {
  return {
    id: response.id,
    invoiceNumber: response.invoice_number,
    customerName: response.customer_name,
    customerEmail: response.customer_email,
    dueDate: response.due_date || undefined,
    taxRate: response.tax_rate,
    status: response.status,
    subtotal: response.subtotal,
    taxAmount: response.tax_amount,
    adjustmentsTotal: response.adjustments_total,
    total: response.total,
    bankAccountId: response.bank_account_id,
    items: response.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    })),
    adjustments: response.adjustments.map((adj) => ({
      id: adj.id,
      description: adj.description,
      type: adj.type,
      amount: adj.amount,
    })),
    createdAt: response.created_at,
  };
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await api.get<InvoiceResponse[]>("/api/invoice");
      if (response.success && response.data) {
        const mappedInvoices = response.data.map(mapInvoiceResponse);
        setInvoices(mappedInvoices);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Set empty array on error
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    } else {
      setInvoices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createInvoice = async (
    invoiceData: Omit<
      Invoice,
      | "id"
      | "invoiceNumber"
      | "createdAt"
      | "subtotal"
      | "taxAmount"
      | "adjustmentsTotal"
      | "total"
    >
  ): Promise<string> => {
    if (!user) {
      throw new Error("You must be logged in to create an invoice");
    }

    try {
      // Convert frontend format to backend format
      const backendRequest = {
        customer_name: invoiceData.customerName,
        customer_email: invoiceData.customerEmail,
        due_date: invoiceData.dueDate || undefined,
        tax_rate: invoiceData.taxRate,
        status: invoiceData.status,
        items: invoiceData.items.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
        adjustments: (invoiceData.adjustments || []).map((adj) => ({
          description: adj.description,
          type: adj.type,
          amount: adj.amount,
        })),
        bank_account_id: invoiceData.bankAccountId || null,
      };

      const response = await api.post<InvoiceResponse>(
        "/api/invoice",
        backendRequest
      );
      if (response.success && response.data) {
        const newInvoice = mapInvoiceResponse(response.data);
        setInvoices((prev) => [...prev, newInvoice]);
        return newInvoice.id;
      }
      throw new Error("Failed to create invoice");
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Failed to create invoice. Please try again.");
    }
  };

  const updateInvoice = async (
    id: string,
    updates: Partial<Invoice>
  ): Promise<void> => {
    if (!user) {
      throw new Error("You must be logged in to update an invoice");
    }

    try {
      // Convert frontend format to backend format
      const backendUpdate: any = {};
      if (updates.customerName !== undefined)
        backendUpdate.customer_name = updates.customerName;
      if (updates.customerEmail !== undefined)
        backendUpdate.customer_email = updates.customerEmail;
      if (updates.dueDate !== undefined)
        backendUpdate.due_date = updates.dueDate;
      if (updates.taxRate !== undefined)
        backendUpdate.tax_rate = updates.taxRate;
      if (updates.status !== undefined) backendUpdate.status = updates.status;
      if (updates.bankAccountId !== undefined)
        backendUpdate.bank_account_id = updates.bankAccountId || null;
      if (updates.items !== undefined) {
        backendUpdate.items = updates.items.map((item) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }));
      }
      if (updates.adjustments !== undefined) {
        backendUpdate.adjustments = updates.adjustments.map((adj) => ({
          description: adj.description,
          type: adj.type,
          amount: adj.amount,
        }));
      }

      const response = await api.put<InvoiceResponse>(
        `/api/invoice/${id}`,
        backendUpdate
      );
      if (response.success && response.data) {
        const updatedInvoice = mapInvoiceResponse(response.data);
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === id ? updatedInvoice : inv))
        );
      } else {
        throw new Error("Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Failed to update invoice. Please try again.");
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be logged in to delete an invoice");
    }

    try {
      await api.delete(`/api/invoice/${id}`);
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    } catch (error) {
      console.error("Error deleting invoice:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Failed to delete invoice. Please try again.");
    }
  };

  const getInvoice = (id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        refreshInvoices: fetchInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
}
