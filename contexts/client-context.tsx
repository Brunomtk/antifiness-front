"use client"

import React, { createContext, useReducer, ReactNode } from 'react'
import { Client, ClientFilters, ClientStats, ClientsResponse } from '@/types/client'

interface ClientState {
  clients: Client[]
  selectedClient: Client | null
  filters: ClientFilters
  stats: ClientStats | null
  loading: {
    clients: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    stats: boolean
  }
  error: string | null
}

type ClientAction =
  | { type: 'SET_CLIENTS'; payload: ClientsResponse }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: number }
  | { type: 'SET_SELECTED_CLIENT'; payload: Client | null }
  | { type: 'SET_FILTERS'; payload: ClientFilters }
  | { type: 'SET_STATS'; payload: ClientStats }
  | { type: 'SET_LOADING'; payload: { key: keyof ClientState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  filters: {},
  stats: null,
  loading: {
    clients: false,
    creating: false,
    updating: false,
    deleting: false,
    stats: false,
  },
  error: null,
}

function clientReducer(state: ClientState, action: ClientAction): ClientState {
  switch (action.type) {
    case 'SET_CLIENTS':
      return {
        ...state,
        clients: action.payload.results,
        error: null,
      }
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
        error: null,
      }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        ),
        selectedClient: state.selectedClient?.id === action.payload.id ? action.payload : state.selectedClient,
        error: null,
      }
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        selectedClient: state.selectedClient?.id === action.payload ? null : state.selectedClient,
        error: null,
      }
    case 'SET_SELECTED_CLIENT':
      return {
        ...state,
        selectedClient: action.payload,
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
      }
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}

export const ClientContext = createContext<{
  state: ClientState
  dispatch: React.Dispatch<ClientAction>
} | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clientReducer, initialState)

  return (
    <ClientContext.Provider value={{ state, dispatch }}>
      {children}
    </ClientContext.Provider>
  )
}
