"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertTriangle, Shield } from "lucide-react";
import { Company } from "@/context/company-provider";

interface SuspendCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (companyId: string, reason: string) => Promise<void>;
  company: Company | null;
}

export const SuspendCompanyModal: React.FC<SuspendCompanyModalProps> = ({
  open,
  onClose,
  onSubmit,
  company,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(company.id, reason.trim());
      onClose();
      setReason("");
    } catch (error) {
      console.error("Error suspending company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReason("");
  };

  if (!open || !company) return null;

  const predefinedReasons = [
    "Payment overdue",
    "Terms of service violation",
    "Suspicious activity detected",
    "Account under review",
    "Manual suspension requested",
    "Other"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Suspend Company
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-900">{company.name}</p>
              <p className="text-sm text-gray-600">{company.email}</p>
              <p className="text-sm text-gray-600">
                Current Status: <span className="font-medium text-green-600">{company.status}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Suspension
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason) => (
                <button
                  key={predefinedReason}
                  type="button"
                  onClick={() => setReason(predefinedReason)}
                  className={`w-full text-left p-2 rounded-md border transition-colors ${
                    reason === predefinedReason
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {predefinedReason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Reason (if "Other" selected)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter detailed reason for suspension..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Suspending this company will immediately restrict their access to the platform. 
                  They will not be able to create campaigns or access their data until reactivated.
                </p>
              </div>
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
              variant="destructive"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Suspending..." : "Suspend Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
