"use client";

import { useState } from "react";
import { BrandForm } from "./brand-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateBrandDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> افزودن برند
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن برند جدید</DialogTitle>
        </DialogHeader>
        {/* چون اینجا داخل یک Client Component هستیم، 
           می‌توانیم تابع onSuccess را پاس بدهیم.
        */}
        <BrandForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
