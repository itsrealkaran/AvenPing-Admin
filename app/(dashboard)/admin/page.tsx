"use client";

import Body from "@/components/layout/body";
import { Calendar, Shield, Users, Mail, Globe, Phone, MapPin, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import Table, { ActionMenuItem } from "@/components/ui/table";
import { MRT_ColumnDef } from "material-react-table";
import { ExtendPlanModal } from "@/components/admin/extend-plan-modal";
import { SuspendCompanyModal } from "@/components/admin/suspend-company-modal";
import { useCompanies, Company } from "@/context/company-provider";
import { toast } from "sonner";

export default function AdminPage() {
  const {
    companies,
    isLoading,
    isSaving,
    error,
    extendPlan,
    suspendCompany,
    activateCompany,
    refreshCompanies,
    isRefreshing,
  } = useCompanies();

  const [showExtendPlanModal, setShowExtendPlanModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleExtendPlan = (company: Company) => {
    setSelectedCompany(company);
    setShowExtendPlanModal(true);
  };

  const handleSuspendCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowSuspendModal(true);
  };

  const handleActivateCompany = async (company: Company) => {
    try {
      await activateCompany(company.id);
    } catch (error) {
      console.error("Error activating company:", error);
    }
  };

  const handleExtendPlanSubmit = async (companyId: string, newExpiryDate: string, planType?: string) => {
    try {
      await extendPlan(companyId, newExpiryDate, planType);
      setShowExtendPlanModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Error extending plan:", error);
    }
  };

  const handleSuspendSubmit = async (companyId: string, reason: string) => {
    try {
      await suspendCompany(companyId, reason);
      setShowSuspendModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error("Error suspending company:", error);
    }
  };

  const getStatusBadge = (status: Company["status"]) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      SUSPENDED: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Calendar },
      EXPIRED: { color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", icon: AlertTriangle };
    const Icon = config.icon;
    const statusName = status || "UNKNOWN";

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3" />
        {statusName}
      </span>
    );
  };

  const getPlanBadge = (plan: Company["plan"]) => {
    const planConfig = {
      FREE: { color: "bg-gray-100 text-gray-800" },
      BASIC: { color: "bg-blue-100 text-blue-800" },
      PREMIUM: { color: "bg-purple-100 text-purple-800" },
      ENTERPRISE: { color: "bg-green-100 text-green-800" },
    };

    const config = planConfig[plan] || { color: "bg-gray-100 text-gray-800" };
    const planName = plan || "UNKNOWN";

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {planName}
      </span>
    );
  };

  const columns: MRT_ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Company Name",
      Cell: ({ row }) => {
        const company = row.original;
        return (
          <div>
            <p className="font-medium text-gray-900">{company.name}</p>
            <p className="text-sm text-gray-500">{company.email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      Cell: ({ row }) => getPlanBadge(row.original.plan),
    },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "campaignCount",
      header: "Campaigns",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{row.original.campaignCount || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "contactCount",
      header: "Contacts",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{(row.original.contactCount || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      Cell: ({ row }) => {
        const date = new Date(row.original.expiresAt);
        const isExpired = date < new Date();
        const isExpiringSoon = date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'}`}>
            {date.toLocaleDateString()}
            {isExpired && <span className="block text-xs text-red-500">Expired</span>}
            {!isExpired && isExpiringSoon && <span className="block text-xs text-yellow-500">Expiring Soon</span>}
          </div>
        );
      },
    },
  ];

  const actionMenuItems: ActionMenuItem[] = [
    {
      key: "extend-plan",
      label: "Extend Plan",
      icon: <Calendar className="size-4" />,
      onClick: (company: Company, closeMenu: () => void) => {
        handleExtendPlan(company);
        closeMenu();
      },
    },
    {
      key: "suspend",
      label: (company: Company) => company.status === "SUSPENDED" ? "Activate" : "Suspend",
      icon: (company: Company) => company.status === "SUSPENDED" ? 
        <CheckCircle className="size-4" /> : 
        <AlertTriangle className="size-4" />,
      onClick: (company: Company, closeMenu: () => void) => {
        if (company.status === "SUSPENDED") {
          handleActivateCompany(company);
        } else {
          handleSuspendCompany(company);
        }
        closeMenu();
      },
      className: selectedCompany?.status === "SUSPENDED" ? 
        "text-green-600" : "text-red-600",
    },
  ];

  return (
    <>
      <Body title="Admin Dashboard">
        <Table
          data={companies}
          columns={columns}
          isLoading={isLoading || isRefreshing}
          isSaving={isSaving}
          actionMenuItems={actionMenuItems}
          onRefresh={refreshCompanies}
          searchPlaceholder="Search companies..."
          addButtonLabel=""
          onAddItem={undefined}
        />
      </Body>

      <ExtendPlanModal
        open={showExtendPlanModal}
        onClose={() => {
          setShowExtendPlanModal(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleExtendPlanSubmit}
        company={selectedCompany}
      />

      <SuspendCompanyModal
        open={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedCompany(null);
        }}
        onSubmit={handleSuspendSubmit}
        company={selectedCompany}
      />
    </>
  );
}
