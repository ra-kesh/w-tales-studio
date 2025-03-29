"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/components/form";
import { ProjectDetailForm } from "./project-detail-form";
import { formOptions } from "./project-form-schema";
import { ShootDetailForm } from "./shoot-detail-form";
import { ProjectDeliveryForm } from "./project-delivery-form";
import { ProjectPaymentForm } from "./project-payment-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const ProjeectForm = () => {
  const form = useAppForm({
    ...formOptions,
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  console.log(form);

  const searchParams = useSearchParams();
  const router = useRouter();

  const detailsTabRef = useRef<HTMLButtonElement>(null);
  const paymentsTabRef = useRef<HTMLButtonElement>(null);
  const deliverablesTabRef = useRef<HTMLButtonElement>(null);
  const shootsTabRef = useRef<HTMLButtonElement>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const tabOrder = ["details", "payments", "deliverables", "shoots"];
  const tabRefs = {
    details: detailsTabRef,
    payments: paymentsTabRef,
    deliverables: deliverablesTabRef,
    shoots: shootsTabRef,
  };

  const getInitialTabs = () => {
    const tab = searchParams.get("tab");
    return tab && tabOrder.includes(tab) ? tab : "details";
  };

  const [activeTab, setActiveTab] = React.useState(() => getInitialTabs());

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.push(`?${createQueryString("tab", activeTab)}`, { scroll: false });
    }
  }, []);

  useEffect(() => {
    const activeTabRef = tabRefs[activeTab as keyof typeof tabRefs];
    if (activeTabRef && activeTabRef.current) {
      activeTabRef.current.focus();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        e.target instanceof HTMLElement &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      ) {
        const isSomeTabFocused = Object.values(tabRefs).some(
          (ref) => ref.current === document.activeElement
        );

        if (!isSomeTabFocused) {
          e.preventDefault();
          const activeTabRef = tabRefs[activeTab as keyof typeof tabRefs];
          if (activeTabRef && activeTabRef.current) {
            activeTabRef.current.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab]);

  interface TabChangeHandler {
    (newTab: string): void;
  }

  const handleTabChange: TabChangeHandler = (newTab) => {
    setActiveTab(newTab);
    router.push(`?${createQueryString("tab", newTab)}`, { scroll: false });
  };

  const goToPreviousTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabOrder[currentIndex - 1]);
    }
  };

  const goToNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      handleTabChange(tabOrder[currentIndex + 1]);
    }
  };

  const isFirstTab = tabOrder.indexOf(activeTab) === 0;
  const isLastTab = tabOrder.indexOf(activeTab) === tabOrder.length - 1;

  return (
    <main className="container max-w-5xl py-6 md:py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger ref={detailsTabRef} value="details">
              Details
            </TabsTrigger>
            <TabsTrigger ref={paymentsTabRef} value="payments">
              Payments
            </TabsTrigger>
            <TabsTrigger ref={deliverablesTabRef} value="deliverables">
              Deliverables
            </TabsTrigger>
            <TabsTrigger ref={shootsTabRef} value="shoots">
              Shoots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <ProjectDetailForm form={form} />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <ProjectPaymentForm form={form} />
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-6">
            <ProjectDeliveryForm form={form} />
          </TabsContent>

          <TabsContent value="shoots" className="space-y-6">
            <ShootDetailForm form={form} />
          </TabsContent>
        </Tabs>
        <div className="flex justify-between mt-6">
          <div className="flex items-center gap-6">
            <Button
              type="button"
              variant={"secondary"}
              onClick={goToPreviousTab}
              disabled={isFirstTab}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant={"secondary"}
              onClick={goToNextTab}
              disabled={isLastTab}
            >
              Next
            </Button>
          </div>
          <form.AppForm>
            <form.SubmitButton>Submit</form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </main>
  );
};

export default ProjeectForm;
