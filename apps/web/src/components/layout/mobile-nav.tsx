"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function MobileNav({ isOpen, onClose, isAdmin }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="h-full bg-black/40 backdrop-blur-2xl">
          <Sidebar
            isAdmin={isAdmin}
            isOpen={true}
            onClose={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
