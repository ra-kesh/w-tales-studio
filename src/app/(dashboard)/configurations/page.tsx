"use client";

import { useEffect, useState } from "react";
import { PackageCard } from "./_components/package-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePackageTypes } from "@/hooks/use-configs";

export default function ConfigPage() {
  const { data: packageTypes = [] } = usePackageTypes();

  const handleEdit = (id: number) => {
    // TODO: Implement edit functionality
    console.log("Edit package:", id);
  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality
    console.log("Delete package:", id);
  };

  const handleCreate = () => {
    // TODO: Implement create functionality
    console.log("Create new package");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Package Types</h3>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packageTypes?.map((pkg) => (
          <PackageCard
            key={pkg.id}
            data={pkg}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
