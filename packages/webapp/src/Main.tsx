import * as React from "react";
import {useEffect} from 'react';
import {
    BrowserRouter,
    Navigate,
    Routes,
    Route,
  } from "react-router-dom";

import { LastLocationProvider } from './utils/lastLocation/LoastLocationProvider'
import { useEntryStore } from './store/entry-store'
import { useEventStore } from './store/event-store'

import { fetchAll, getEvents, eventStream, mapEntriesForBrowser } from './api/ApiService';

import { MainView } from "./main/MainView";
import { SearchView } from './list/Search';
import { SimilarView } from './list/Similar';
import { FacesView } from './list/Faces';
import { Years, YearView } from './year/Years';
import { Tags } from './tags/Tags';
import { Map } from './map';
import { MediaView } from './single/MediaView';
import { useAppConfig } from './utils/useAppConfig'

export const Root = () => {
  return (
    <Main />
  )
}

export const Main = () => {
    const addEntries = useEntryStore(state => state.addEntries);
    const initEvents = useEventStore(state => state.initEvents);
    const addEvent = useEventStore(state => state.addEvent);
    const appConfig = useAppConfig()

    addEntries(appConfig.entries.map(mapEntriesForBrowser));

    useEffect(() => {
      const fetchEvents = () => getEvents()
        .then(events => initEvents(events?.data || []))
        .catch(e => {
          console.log(`Could not fetch intitial events: ${e}`);
        })

      const onChunk = entries => {
        addEntries(entries)
      }

      const subscribeEvents = () => {
        if (appConfig.disabledServerEvents) {
          return
        }
        eventStream(
          (event) => addEvent(event),
          (serverEvent) => {
            if (serverEvent.action === 'databaseReloaded') {
              console.log(`Reload database due server event`)
              fetchAll(chunkLimits, onChunk)
            }
          }
        )
      }

      const chunkLimits = [1000, 2000, 4000, 8000, 16000, 32000];
      fetchAll(chunkLimits, onChunk)
        .finally(fetchEvents)
        .finally(subscribeEvents);
    }, []);

    const base = document.querySelector('base')?.getAttribute('href') || '/';

    return (
      <BrowserRouter basename={base}>
        <LastLocationProvider>
          <Routes>
            <Route path="/" element={<MainView />} />
            <Route path="/years" element={<Years />} />
            <Route path="/years/:year" element={<YearView />} />
            <Route path="/view/:id" element={<MediaView />} />
            <Route path="/similar/:id" element={<SimilarView />} />
            <Route path="/search/:term" element={<SearchView />} />
            <Route path="/faces/:id/:faceIndex" element={<FacesView />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/map" element={<Map />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LastLocationProvider>
      </BrowserRouter>
    );
}
