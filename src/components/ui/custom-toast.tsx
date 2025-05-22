"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  button?: {
    label: string;
    onClick: () => void;
  };
}

function toast(props: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={props.title}
      description={props.description}
      variant={props.variant || "default"}
      button={props.button}
    />
  ));
}

toast.success = (title: string, description: string, button?: ToastProps["button"]) => {
  return toast({ title, description, variant: "success", button });
};

toast.error = (title: string, description: string, button?: ToastProps["button"]) => {
  return toast({ title, description, variant: "error", button });
};

toast.warning = (title: string, description: string, button?: ToastProps["button"]) => {
  return toast({ title, description, variant: "warning", button });
};

toast.info = (title: string, description: string, button?: ToastProps["button"]) => {
  return toast({ title, description, variant: "info", button });
};

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, button, id, variant = "default" } = props;

  const variantStyles = {
    default: {
      container: "bg-white",
      icon: null,
      title: "text-gray-900",
      description: "text-gray-500",
      button: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    },
    success: {
      container: "bg-white border-l-4 border-green-500",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "text-gray-900",
      description: "text-gray-500",
      button: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    error: {
      container: "bg-white border-l-4 border-red-500",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "text-gray-900",
      description: "text-gray-500",
      button: "bg-red-50 text-red-600 hover:bg-red-100",
    },
    warning: {
      container: "bg-white border-l-4 border-amber-500",
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      title: "text-gray-900",
      description: "text-gray-500",
      button: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    },
    info: {
      container: "bg-white border-l-4 border-blue-500",
      icon: <Info className="h-5 w-5 text-blue-500" />,
      title: "text-gray-900",
      description: "text-gray-500",
      button: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("flex rounded-lg shadow-lg ring-1 ring-black/5 w-full md:max-w-[364px] items-center p-4", styles.container)}>
      {styles.icon && (
        <div className="mr-3 flex-shrink-0">
          {styles.icon}
        </div>
      )}
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className={cn("text-sm font-medium", styles.title)}>{title}</p>
          <p className={cn("mt-1 text-sm", styles.description)}>{description}</p>
        </div>
      </div>
      {button && (
        <div className="ml-5 shrink-0">
          <button
            className={cn("rounded px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2", styles.button)}
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

export { toast };
