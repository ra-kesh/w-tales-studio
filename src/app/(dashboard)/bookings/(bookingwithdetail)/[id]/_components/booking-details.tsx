"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckSquare,
  Camera,
  Image,
  X,
  Edit,
  Info,
  ArrowLeft,
  XIcon,
  XSquareIcon,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BookingOverview } from "./booking-overview";
import { BookingShoots } from "./booking-shoots";
import { BookingDeliverables } from "./booking-deliverables";
import { BookingFinancials } from "./booking-financials";
import { BookingTasks } from "./booking-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingDetail } from "@/hooks/use-bookings";

export function BookingDetails({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const router = useRouter();

  const { data: booking } = useBookingDetail(id);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Info className="h-4 w-4 mr-2" />,
    },
    {
      id: "shoots",
      label: "Shoots",
      icon: <Camera className="h-4 w-4 mr-2" />,
    },
    {
      id: "deliverables",
      label: "Deliverables",
      icon: <Image className="h-4 w-4 mr-2" />,
    },

    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare className="h-4 w-4 mr-2" />,
    },
    // {
    //   id: "financials",
    //   label: "Financials",
    //   icon: <DollarSign className="h-4 w-4 mr-2" />,
    // },
  ];

  const handleClose = () => {
    router.push("/bookings");
  };

  const handleEdit = () => {
    router.push(`/bookings/edit/${id}`);
  };

  return (
    <div className="h-full flex-1 flex flex-col border-r">
      <div ref={headerRef} className="border-b bg-white z-10">
        <div className="p-6 pb-2">
          <div className="flex flex-col items-start justify-between">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {booking?.name}
                </h2>
                <Badge variant={"secondary"}>{booking?.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="h-5 w-5 mr-1" />
                </Button>
              </div>
            </div>
            <div className="mt-1 rounded-lg bg-muted/70 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Bride Name
                  </p>
                  <p className="text-sm font-medium">
                    {booking.clients.brideName || "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Groom Name
                  </p>
                  <p className="text-sm font-medium">
                    {booking.clients.groomName || "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Email address
                  </p>
                  <p className="text-sm font-medium">
                    {booking.clients.email || "Not provided"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Package Type
                  </p>
                  <p className="text-sm font-medium">
                    {booking.packageTypeValue}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Package Cost
                  </p>
                  <p className="text-sm font-medium">
                    ₹{Number(booking.packageCost).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone number
                  </p>
                  <p className="text-sm font-medium">
                    {booking.clients.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex  px-6">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors relative",
                "hover:text-primary focus-visible:outline-none",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea
        className="flex-1"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div className="p-6">
          {activeTab === "overview" && <BookingOverview booking={booking} />}
          {activeTab === "shoots" && <BookingShoots shoots={booking?.shoots} />}
          {activeTab === "deliverables" && (
            <BookingDeliverables deliverables={booking?.deliverables} />
          )}

          {activeTab === "tasks" && <BookingTasks tasks={booking?.tasks} />}

          {/* {activeTab === "financials" && (
            <BookingFinancials
              packageCost={booking.packageCost}
              receivedAmounts={booking.receivedAmounts}
              paymentSchedules={booking.paymentSchedules}
              expenses={booking.expenses}
            />
          )} */}
        </div>
      </ScrollArea>
    </div>
  );
}
