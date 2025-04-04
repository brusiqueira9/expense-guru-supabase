import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, CalendarClock } from "lucide-react";
import { PaymentStatus } from "@/types";

export function PaymentStatusBadge({ status }: { status?: PaymentStatus }) {
  if (!status) return null;

  const variants = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  };

  const icons = {
    paid: <Check className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    scheduled: <CalendarClock className="w-3 h-3 mr-1" />,
  };

  const labels = {
    paid: "Pago",
    pending: "Pendente",
    scheduled: "Agendado",
  };

  return (
    <Badge variant="secondary" className={variants[status]}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
} 