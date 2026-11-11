import { useSyncExternalStore } from 'react'
import initialDataJson from './mockAdminData.json'

export type AdminProduct = {
  id: string
  name: string
  category: string
  price: number
  glbFile: string
  photoFile: string
  svlkCertificate: string
  craftsman: string
  warrantyMonths: number
  cid: string
  status: string
}

export type AdminOrder = {
  orderId: string
  customerEmail: string
  customerWallet: string
  productName: string
  serialNumber: string
  warrantyMonths: number
  orderDate: string
  status: string
  tokenId?: string
  tokenExpiresAt?: string
}

export type AdminClaim = {
  claimId: string
  tokenId: string
  customerEmail: string
  productName: string
  issueDescription: string
  photoIpfsUrl: string
  status: string
  submittedDate: string
  warrantySerialNumber?: string
  photoName?: string
}

export type AdminNfcLog = {
  logId: string
  serialNumber: string
  scannedAt: string
  device: string
  result: string
  newDynamicHash: string
}

export type AdminBatch = { batchId: string; createdAt: string; chipsCount: number }
export type AdminChip = {
  chipId: string
  chipType: string
  batchId: string
  serialNumber: string
  authInitHash: string
}
export type WarrantyTransfer = {
  transferId: string
  tokenId: string
  productName: string
  from: string
  to: string
  transferredAt: string
  status: string
}

export type AdminData = {
  adminProfile: { address: string; role: string; network: string; connectedWallet: string }
  products: AdminProduct[]
  pendingOrders: AdminOrder[]
  claims: AdminClaim[]
  nfcLogs: AdminNfcLog[]
  batches: AdminBatch[]
  chips: AdminChip[]
  warrantyTransfers: WarrantyTransfer[]
}
export type AdminDataUpdater = (update: AdminData | ((current: AdminData) => AdminData)) => void

const storageKey = 'woodchain.admin-data.v1'
const initialData = initialDataJson as AdminData
const listeners = new Set<() => void>()

function isAdminData(value: unknown): value is AdminData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<AdminData>
  return Boolean(
    data.adminProfile &&
    Array.isArray(data.products) &&
    Array.isArray(data.pendingOrders) &&
    Array.isArray(data.claims) &&
    Array.isArray(data.nfcLogs) &&
    Array.isArray(data.batches) &&
    Array.isArray(data.chips) &&
    Array.isArray(data.warrantyTransfers),
  )
}

function readStoredData(): AdminData {
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return initialData
  const parsed: unknown = JSON.parse(stored)
  if (!isAdminData(parsed)) {
    throw new Error('Data WoodChain lokal tidak valid. Hapus data situs untuk memulai ulang demo.')
  }
  return parsed
}

let snapshot = readStoredData()

function notify() {
  listeners.forEach((listener) => listener())
}

window.addEventListener('storage', (event) => {
  if (event.key !== storageKey) return
  snapshot = event.newValue ? readStoredData() : initialData
  notify()
})

export function subscribeAdminData(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAdminDataSnapshot() {
  return snapshot
}

export const setAdminData: AdminDataUpdater = (update) => {
  const next = typeof update === 'function' ? update(snapshot) : update
  if (!isAdminData(next)) throw new Error('Perubahan data admin tidak valid.')
  window.localStorage.setItem(storageKey, JSON.stringify(next))
  snapshot = next
  notify()
}

export function useAdminData() {
  const data = useSyncExternalStore(subscribeAdminData, getAdminDataSnapshot, getAdminDataSnapshot)
  return { data, setData: setAdminData }
}
