"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface Company {
  id: string;
  name: string;
  email: string;
  plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
  status: "ACTIVE" | "SUSPENDED" | "PENDING" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
  userCount: number;
  campaignCount: number;
  contactCount: number;
  lastLoginAt?: string;
  subscriptionId?: string;
  billingEmail?: string;
  phoneNumber?: string;
  address?: string;
  website?: string;
}

interface CompanyContextType {
  companies: Company[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  extendPlan: (companyId: string, newExpiryDate: string, planType?: string) => Promise<void>;
  suspendCompany: (companyId: string, reason: string) => Promise<void>;
  activateCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  isRefreshing: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompanies = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompanies must be used within a CompanyProvider");
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      setCompanies(data.companies || data);
    } catch (err) {
      setError("Failed to fetch companies");
      console.error("Error fetching companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const extendPlan = async (companyId: string, newExpiryDate: string, planType?: string) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/companies/${companyId}/extend-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newExpiryDate,
          planType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extend plan');
      }

      const data = await response.json();
      
      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              expiresAt: data.company.expiresAt,
              ...(data.company.plan && { plan: data.company.plan as Company["plan"] })
            }
          : company
      ));
      
      toast.success("Plan extended successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to extend plan");
      console.error("Error extending plan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const suspendCompany = async (companyId: string, reason: string) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/companies/${companyId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend company');
      }

      const data = await response.json();
      
      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, status: data.company.status as Company["status"] }
          : company
      ));
      
      toast.success("Company suspended successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to suspend company");
      console.error("Error suspending company:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activateCompany = async (companyId: string) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/companies/${companyId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate company');
      }

      const data = await response.json();
      
      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, status: data.company.status as Company["status"] }
          : company
      ));
      
      toast.success("Company activated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate company");
      console.error("Error activating company:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const refreshCompanies = async () => {
    setIsRefreshing(true);
    try {
      await fetchCompanies();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const value: CompanyContextType = {
    companies,
    isLoading,
    isSaving,
    error,
    fetchCompanies,
    extendPlan,
    suspendCompany,
    activateCompany,
    refreshCompanies,
    isRefreshing,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};