"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar, CreditCard } from "lucide-react";
import { Company } from "@/context/company-provider";

interface ExtendPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (companyId: string, newExpiryDate: string, planType?: string) => Promise<void>;
  company: Company | null;
}

export const ExtendPlanModal: React.FC<ExtendPlanModalProps> = ({
  open,
  onClose,
  onSubmit,
  company,
}) => {
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newPlanType, setNewPlanType] = useState<Company["plan"] | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open && company) {
      // Set default expiry date to 1 year from current expiry
      const currentExpiry = new Date(company.expiresAt);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      setNewExpiryDate(newExpiry.toISOString().split('T')[0]);
      setNewPlanType(company.plan);
    }
  }, [open, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newExpiryDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit(company.id, newExpiryDate, newPlanType || undefined);
      onClose();
      setNewExpiryDate("");
      setNewPlanType("");
    } catch (error) {
      console.error("Error extending plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNewExpiryDate("");
    setNewPlanType("");
  };

  if (!open || !company) return null;

  const planOptions: { value: Company["plan"]; label: string; color: string }[] = [
    { value: "FREE", label: "Free", color: "text-gray-600" },
    { value: "BASIC", label: "Basic", color: "text-blue-600" },
    { value: "PREMIUM", label: "Premium", color: "text-purple-600" },
    { value: "ENTERPRISE", label: "Enterprise", color: "text-green-600" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">
              Extend Plan
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{company.name}</p>
              <p className="text-sm text-gray-600">{company.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Plan
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className={`font-medium ${planOptions.find(p => p.value === company.plan)?.color}`}>
                {planOptions.find(p => p.value === company.plan)?.label}
              </span>
              <p className="text-sm text-gray-600">
                Expires: {new Date(company.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Plan Type (Optional)
            </label>
            <select
              value={newPlanType}
              onChange={(e) => setNewPlanType(e.target.value as Company["plan"])}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave unchanged to keep current plan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="pl-10"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newExpiryDate}
            >
              {isSubmitting ? "Extending..." : "Extend Plan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
