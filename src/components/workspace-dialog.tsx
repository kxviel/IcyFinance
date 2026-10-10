import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type WorkspaceDialogProps = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  busy?: boolean;
  initialFocus?: ComponentProps<typeof DialogContent>["initialFocus"];
};

const WorkspaceDialog = ({
  title,
  description,
  children,
  onClose,
  wide,
  busy = false,
  initialFocus,
}: WorkspaceDialogProps) => (
  <Dialog
    open
    onOpenChange={(open, details) => {
      if (busy) details.cancel();
      else if (!open) onClose();
    }}
  >
    <DialogContent
      showCloseButton={false}
      initialFocus={initialFocus}
      className={cn(
        "max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-140",
        wide && "sm:max-w-172.5",
      )}
    >
      <DialogHeader className="gap-3 border-b pr-8 pb-5">
        <DialogTitle className="text-3xl leading-tight font-normal">{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
      <DialogClose
        disabled={busy}
        aria-label="Close dialog"
        render={<Button variant="ghost" size="icon-sm" className="absolute top-6 right-6" />}
      >
        <X />
      </DialogClose>
    </DialogContent>
  </Dialog>
);

export default WorkspaceDialog;
