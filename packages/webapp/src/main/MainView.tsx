import * as React from "react";
import { useEffect } from "react";

import { List } from '../list/List';
import { useSearchStore } from '../store/search-store'
import { Memories } from './../memories/Memories';

export const MainView = () => {
  const search = useSearchStore(state => state.search);

  useEffect(() => {
    search({type: 'none'});
  }, [])

  return ( 
    <>
      <Memories />
      <List />
    </>
  )
}
