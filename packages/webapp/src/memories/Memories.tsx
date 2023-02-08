import * as React from "react";

import { useMemoriesStore } from '../store/memories-store';

export const Memories = () => {
    const getMemories = useMemoriesStore(state => state.getMemories)

    return (
    <>
    <div className="memories-container">
      <h2>Memórias</h2>

    </div>
    </>
  )
}