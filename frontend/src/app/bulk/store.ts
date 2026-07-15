import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LogEntry, ImportSummary } from './ImportProgressModal';
import { bulkImportAction } from './actions';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Company {
  previewId: string;
  companyName: string;
  industry: string;
  headquarters: string;
  country: string;
  phone: string;
  email:string;
  website: string;
  size: string;
  jobTitle: string;
  workMode: string;
  jobType: string;
  salary: string;
  requirements: string;
  icpMatch: string;
}

interface BulkCollectionState {
  activePlatform: string;
  count: number;
  companies: Company[];
  filteredCompanies: Company[];
  selected: Set<string>;
  searchQuery: string;
  loading: boolean;
  importing: boolean;
  showModal: boolean;
  importLog: LogEntry[];
  importProgress: number;
  importDone: boolean;
  importSummary: ImportSummary | null;
  importError: string | null;

  // Actions
  setActivePlatform: (platform: string) => void;
  setCount: (count: number) => void;
  setSearchQuery: (query: string) => void;
  setFilteredCompanies: (companies: Company[]) => void;
  toggleSelect: (id: string) => void;
  selectAll: (companies: Company[]) => void;
  clearAll: () => void;
  closeModal: () => void;
  fetchPreview: (platform: string, count: number) => Promise<void>;
  runImport: () => Promise<void>;
}

export const useBulkCollectionStore = create<BulkCollectionState>()(
  persist(
    (set, get) => ({
  // ── State ──
  activePlatform: 'linkedin',
  count: 20,
  companies: [],
  filteredCompanies: [],
  selected: new Set(),
  searchQuery: '',
  loading: true,
  importing: false,
  showModal: false,
  importLog: [],
  importProgress: 0,
  importDone: false,
  importSummary: null,
  importError: null,

  // ── Actions ──
  setActivePlatform: (platform) => set({ activePlatform: platform }),
  setCount: (count) => set({ count }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilteredCompanies: (companies) => set({ filteredCompanies: companies }),
  toggleSelect: (id) => set((state) => {
    const newSelected = new Set(state.selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    return { selected: newSelected };
  }),
  selectAll: (companies) => set({ selected: new Set(companies.map(c => c.previewId)) }),
  clearAll: () => set({ selected: new Set() }),
  closeModal: () => set({ showModal: false }),

  // ── Async Actions ──
  fetchPreview: async (platform, count) => {
    set({ loading: true, selected: new Set() });
    try {
      const res = await fetch(`/api/bulk/preview?platform=${platform}&count=${count}`);
      if (!res.ok) throw new Error(`Failed to fetch preview: ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.companies)) {
        const sanitizedCompanies = data.companies.map((c: any) => ({ ...c, previewId: String(c.previewId) }));
        set({ companies: sanitizedCompanies, loading: false });
      } else {
        set({ companies: [], loading: false });
      }
    } catch (err) {
      console.error("Error in fetchPreview:", err);
      set({ companies: [], loading: false });
    }
  },

  runImport: async () => {
    const { filteredCompanies, selected, activePlatform } = get();
    const toImport = selected.size > 0
      ? filteredCompanies.filter((c) => selected.has(c.previewId))
      : filteredCompanies;

    if (toImport.length === 0) return;

    set({ showModal: true, importing: true, importDone: false, importLog: [], importProgress: 0, importSummary: null, importError: null });

    // Simulate per-company progress
    const simulationDelay = Math.max(200, Math.floor(3000 / toImport.length));
    for (let i = 0; i < toImport.length; i++) {
      await new Promise((r) => setTimeout(r, simulationDelay));
      const c = toImport[i];
      set(state => ({
        importLog: [{ id: `${c.previewId}-${Date.now()}`, companyName: c.companyName, jobTitle: c.jobTitle, status: 'success' }, ...state.importLog],
        importProgress: Math.round(((i + 1) / toImport.length) * 100)
      }));
    }

    // Actual API call
    try {
      const summary = await bulkImportAction({
        platform: activePlatform,
        selectedIds: Array.from(selected),
        count: toImport.length,
      });
      set({ importSummary: summary });
    } catch (err) {
      set({ importError: err instanceof Error ? err.message : 'An unexpected error occurred.' });
    }

    set({ importDone: true, importing: false });
  }
    }),
    {
      name: 'bulk-collection-storage', // name of the item in the storage (must be unique)
      // Only persist a subset of the state
      partialize: (state) => ({ activePlatform: state.activePlatform, count: state.count, searchQuery: state.searchQuery }),
    }
  )
);