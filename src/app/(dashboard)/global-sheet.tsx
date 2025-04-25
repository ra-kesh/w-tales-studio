"use client";

import { ShootCreateSheet } from "@/app/(dashboard)/shoots/_components/shoot-create-sheet";

import { PackageEditSheet } from "./configurations/_components/package-edit-sheet";
import { ShootEditSheet } from "./shoots/_components/shoot-edit-sheet";

export function GlobalSheets() {
  return (
    <>
      <ShootCreateSheet />
      <ShootEditSheet />
      <PackageEditSheet />
    </>
  );
}
