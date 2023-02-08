import create from 'zustand'

import { Entry } from './entry'
import { useEntryStore } from './entry-store'

export interface Memory{

}

export interface MemoriesStore {
    memories: Memory[],
    getMemories: () => void
}

export const useMemoriesStore = create<MemoriesStore>((set, get) => ({
    memories: [],
    
    getMemories: () => {
        const allEntries = useEntryStore.getState().allEntries
        console.log(allEntries)
    }
}))