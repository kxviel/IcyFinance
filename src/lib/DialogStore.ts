import { create } from "zustand";

interface DialogState {
  showDialog: boolean;
  setDialog: (isOpen: boolean) => void;
}

export const useDialogStore = create<DialogState>()((set) => ({
  showDialog: false,
  setDialog: (isOpen) => set(() => ({ showDialog: isOpen })),
}));
