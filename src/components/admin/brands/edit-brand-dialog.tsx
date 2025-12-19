"use client";

import { useState } from "react";
import { BrandForm } from "./brand-form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditBrandDialogProps {
  brand: {
    id: string;
    name: string;
    slug: string;
  };
}

export function EditBrandDialog({ brand }: EditBrandDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش برند: {brand.name}</DialogTitle>
        </DialogHeader>
        <BrandForm
          onSuccess={() => setOpen(false)}
          initialData={brand} // 👈 پاس دادن دیتای موجود به فرم
        />
      </DialogContent>
    </Dialog>
  );
}
