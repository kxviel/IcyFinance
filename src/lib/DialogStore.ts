import { create } from "zustand";
import { GetBudgetColumn } from "../features/Budget/columns";

interface DialogState {
  showDialog: boolean;
  dialogProps?: GetBudgetColumn;
  setDialog: (isOpen: boolean, props?: GetBudgetColumn) => void;
}

export const useDialogStore = create<DialogState>()((set) => ({
  showDialog: false,
  dialogProps: undefined,
  setDialog: (isOpen, props = undefined) =>
    set(() => ({ showDialog: isOpen, dialogProps: props })),
}));
