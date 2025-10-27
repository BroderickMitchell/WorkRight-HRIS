import { create } from 'zustand';

export type ProfileSectionKey =
  | 'personal'
  | 'contact'
  | 'job'
  | 'compensation'
  | 'timeAndEligibility'
  | 'costSplits'
  | 'documents'
  | 'history';

interface ProfileEditingState {
  activeSection?: ProfileSectionKey;
  dirtySections: Set<ProfileSectionKey>;
  startEditing: (section: ProfileSectionKey) => void;
  stopEditing: (section: ProfileSectionKey) => void;
  markDirty: (section: ProfileSectionKey, dirty: boolean) => void;
  reset: () => void;
}

export const useProfileEditingStore = create<ProfileEditingState>((set, get) => ({
  activeSection: undefined,
  dirtySections: new Set(),
  startEditing: (section) => {
    set(() => ({ activeSection: section }));
  },
  stopEditing: (section) => {
    set((state) => {
      const dirtySections = new Set(state.dirtySections);
      dirtySections.delete(section);
      return {
        activeSection: state.activeSection === section ? undefined : state.activeSection,
        dirtySections
      };
    });
  },
  markDirty: (section, dirty) => {
    set((state) => {
      const dirtySections = new Set(state.dirtySections);
      if (dirty) {
        dirtySections.add(section);
      } else {
        dirtySections.delete(section);
      }
      return { dirtySections };
    });
  },
  reset: () => {
    set({ activeSection: undefined, dirtySections: new Set() });
  }
}));

export function useHasUnsavedChanges() {
  return useProfileEditingStore((state) => state.dirtySections.size > 0);
}

export function getDirtySections() {
  return useProfileEditingStore.getState().dirtySections;
}
