import { furnitureCatalog, userWarranties, type Furniture, type Warranty, type WarrantyStatus } from './dashboardData'
import type { AdminData, AdminOrder } from './adminDataStore'

function formatWarrantyDate(date: string | undefined) {
  if (!date) return 'Tanggal belum ditentukan'
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(parsed)
}

function getWarrantyClaimStatus(data: AdminData, serialNumber: string) {
  return data.claims.find((claim) => claim.warrantySerialNumber?.toUpperCase() === serialNumber.toUpperCase())?.status
}

function resolveWarrantyStatus(status: WarrantyStatus, claimStatus?: string): WarrantyStatus {
  if (claimStatus === 'Warranty Voided') return 'voided'
  if (claimStatus === 'Submitted' || claimStatus === 'In Review' || claimStatus === 'Approved') return 'claimed'
  if (claimStatus === 'Rejected') return status
  return status
}

function createMintedWarranty(order: AdminOrder, data: AdminData): Warranty {
  const matchedProduct = data.products.find((product) => product.name === order.productName)
  const date = order.orderDate
  const endDate = order.tokenExpiresAt ?? ''
  const warrantyMonths = order.warrantyMonths
  return {
    id: `warranty-${order.orderId.toLowerCase()}`,
    furnitureId: 'table',
    serialNumber: order.serialNumber,
    purchaseDate: formatWarrantyDate(date),
    warrantyEndDate: formatWarrantyDate(endDate),
    status: resolveWarrantyStatus('active', getWarrantyClaimStatus(data, order.serialNumber)),
    coverage: `Garansi rangka dan konstruksi selama ${warrantyMonths} bulan`,
    seller: 'WoodChain Official Store',
    tokenId: `#${order.tokenId ?? order.orderId}`,
    walletAddress: order.customerWallet,
    ipfsCid: matchedProduct?.cid ?? `ipfs://WoodChain-${order.serialNumber}`,
    svlkCertificate: matchedProduct?.svlkCertificate ?? 'Menunggu metadata DPP',
    productionDate: formatWarrantyDate(date),
    authenticationHistory: [
      { date: formatWarrantyDate(date), event: 'NFT garansi diterbitkan', result: 'Terverifikasi' },
      { date: formatWarrantyDate(date), event: 'Tag NFC / QR dipasangkan', result: 'Berhasil' },
    ],
  }
}

export function getConsumerWarranties(data: AdminData): Warranty[] {
  const existing = userWarranties.map((warranty) => ({
    ...warranty,
    status: resolveWarrantyStatus(warranty.status, getWarrantyClaimStatus(data, warranty.serialNumber)),
  }))
  const minted = data.pendingOrders
    .filter((order) => order.status === 'Minted' && order.tokenId)
    .map((order) => createMintedWarranty(order, data))
  const knownSerials = new Set(existing.map((warranty) => warranty.serialNumber.toUpperCase()))
  return [...existing, ...minted.filter((warranty) => !knownSerials.has(warranty.serialNumber.toUpperCase()))]
}

export function getWarrantyProductName(warranty: Warranty, data: AdminData) {
  return data.pendingOrders.find((order) => order.serialNumber.toUpperCase() === warranty.serialNumber.toUpperCase())?.productName
    ?? furnitureCatalog.find((item) => item.id === warranty.furnitureId)?.name
    ?? 'Produk WoodChain'
}

export function getWarrantyFurniture(warranty: Warranty, data: AdminData): Furniture | undefined {
  const baseFurniture = furnitureCatalog.find((item) => item.id === warranty.furnitureId)
  if (!baseFurniture) return undefined
  const product = data.products.find((item) => item.name === getWarrantyProductName(warranty, data))
  if (!product) return baseFurniture
  return {
    ...baseFurniture,
    name: product.name,
    category: product.category,
    warrantyMonths: product.warrantyMonths,
    craftsman: product.craftsman,
  }
}
