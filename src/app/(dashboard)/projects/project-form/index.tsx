"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppForm } from "@/components/form";
import { ProjectDetailForm } from "./project-detail-form";
import { formOptions } from "./project-form-schema";
import { ShootDetailForm } from "./shoot-detail-form";
import { ProjectDeliveryForm } from "./project-delivery-form";
import { ProjectPaymentForm } from "./project-payment-form";

const ProjeectForm = () => {
  const form = useAppForm({
    ...formOptions,
    onSubmit: ({ value }) => {
      console.log("Form submitted:", value);
    },
  });

  console.log(form);

  return (
    <main className="container max-w-5xl py-6 md:py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Tabs defaultValue="details" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="shoots">Shoots</TabsTrigger>
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
        <form.AppForm>
          <form.SubmitButton>Submit</form.SubmitButton>
        </form.AppForm>
      </form>
    </main>
  );
};

export default ProjeectForm;
