
import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";

interface AlertBannerProps {
  message: string;
  title: string;
  variant?: 'default' | 'high' | 'critical';
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const AlertBanner = ({ 
  message, 
  title, 
  variant = 'default', 
  onClose,
  autoClose = true,
  autoCloseTime = 5000
}: AlertBannerProps) => {
  useEffect(() => {
    let timer: number;
    if (autoClose) {
      timer = window.setTimeout(onClose, autoCloseTime);
    }
    return () => clearTimeout(timer);
  }, [autoClose, autoCloseTime, onClose]);

  const getAlertClass = () => {
    switch (variant) {
      case 'high':
        return 'border-energy-high';
      case 'critical':
        return 'border-energy-critical';
      default:
        return 'border-energy-medium';
    }
  };

  return (
    <Alert className={`mb-4 pr-10 relative ${getAlertClass()}`}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <button 
        className="absolute right-2 top-2 p-1 rounded-full hover:bg-slate-100"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};

export default AlertBanner;
