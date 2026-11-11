import mockProducts from '../mockProducts.json'
import type { IconName } from '../components/Icon'

export const userNavigation: { label: string; icon: IconName }[] = [
  { label: 'Beranda', icon: 'grid' },
  { label: 'My Warranties', icon: 'box' },
  { label: 'Klaim garansi', icon: 'orders' },
  { label: 'Pelacakan', icon: 'truck' },
]

export const adminNavigation: { label: string; icon: IconName }[] = [
  { label: 'Ringkasan', icon: 'grid' },
  { label: 'Katalog & DPP', icon: 'box' },
  { label: 'Pesanan & Minting', icon: 'orders' },
  { label: 'NFC Encoder', icon: 'nfc' },
  { label: 'Klaim Garansi', icon: 'shield' },
  { label: 'Riwayat AuthentiCoding', icon: 'rotate' },
]

export const adminPagePaths: Record<string, string> = {
  Ringkasan: '/admin',
  'Katalog & DPP': '/admin/catalog',
  'Pesanan & Minting': '/admin/orders',
  'NFC Encoder': '/admin/nfc-encoder',
  'Klaim Garansi': '/admin/claims',
  'Riwayat AuthentiCoding': '/admin/history',
  Pengaturan: '/admin/settings',
}

export const userOrders = [
  { id: 'WC-24085', item: 'Kayu Jati Grade A', date: '12 Okt 2025', status: 'Dalam pengiriman', tone: 'shipping' },
  { id: 'WC-24064', item: 'Kayu Mahoni', date: '08 Okt 2025', status: 'Menunggu pembayaran', tone: 'waiting' },
  { id: 'WC-23992', item: 'Kayu Merbau', date: '01 Okt 2025', status: 'Selesai', tone: 'complete' },
]

export const adminOrders = [
  { id: 'WC-24091', customer: 'Nadia Putri', item: 'Kayu Jati Grade A', date: 'Hari ini, 09:42', status: 'Perlu diproses', tone: 'waiting' },
  { id: 'WC-24090', customer: 'Bima Pratama', item: 'Kayu Merbau', date: 'Hari ini, 09:18', status: 'Dalam pengiriman', tone: 'shipping' },
  { id: 'WC-24089', customer: 'Dewi Anggraini', item: 'Kayu Mahoni', date: 'Hari ini, 08:56', status: 'Selesai', tone: 'complete' },
]

export type Furniture = {
  id: 'cabinet' | 'table' | 'shelf'
  name: string
  category: string
  description: string
  materials: string[]
  wood: string
  finish: string
  dimensions: string
  craftsman: string
  warrantyMonths: number
  woodVariants: { name: string; color: string }[]
}

export const furnitureCatalog: Furniture[] = mockProducts.map((product) => {
  if (product.id !== 'cabinet' && product.id !== 'table' && product.id !== 'shelf') {
    throw new Error(`Unsupported furniture model: ${product.id}`)
  }
  return { ...product, id: product.id }
})

export type WarrantyStatus = 'active' | 'expiringSoon' | 'claimed' | 'expired'

export type Warranty = {
  id: string
  furnitureId: Furniture['id']
  serialNumber: string
  purchaseDate: string
  warrantyEndDate: string
  status: WarrantyStatus
  coverage: string
  seller: string
  tokenId: string
  walletAddress: string
  ipfsCid: string
  svlkCertificate: string
  productionDate: string
  authenticationHistory: { date: string; event: string; result: string }[]
}

export const userWarranties: Warranty[] = [
  {
    id: 'warranty-aruna',
    furnitureId: 'cabinet',
    serialNumber: 'WC-LMA-2025-08421',
    purchaseDate: '12 Mei 2025',
    warrantyEndDate: '12 Mei 2027',
    status: 'active',
    coverage: 'Garansi rangka dan konstruksi selama 2 tahun',
    seller: 'WoodChain Official Store',
    tokenId: '#008421',
    walletAddress: '0x71C...93F2',
    ipfsCid: 'ipfs://QmWoodChainAruna8f3c9d2a1b7e',
    svlkCertificate: 'SVLK-JTG-2025-009184',
    productionDate: '28 April 2025',
    authenticationHistory: [
      { date: '12 Mei 2025 · 10:34', event: 'NFT garansi diterbitkan', result: 'Terverifikasi' },
      { date: '12 Mei 2025 · 10:35', event: 'Tag NFC dipasangkan', result: 'Berhasil' },
      { date: '07 November 2026 · 14:12', event: 'Pemeriksaan autentikasi', result: 'Cocok' },
    ],
  },
  {
    id: 'warranty-rona',
    furnitureId: 'table',
    serialNumber: 'WC-MJR-2024-03158',
    purchaseDate: '30 November 2024',
    warrantyEndDate: '30 November 2026',
    status: 'expiringSoon',
    coverage: 'Garansi rangka dan konstruksi selama 2 tahun',
    seller: 'WoodChain Official Store',
    tokenId: '#003158',
    walletAddress: '0x71C...93F2',
    ipfsCid: 'ipfs://QmWoodChainRona61bd97c24ef0',
    svlkCertificate: 'SVLK-DIY-2024-004872',
    productionDate: '16 Oktober 2024',
    authenticationHistory: [
      { date: '30 November 2024 · 09:16', event: 'NFT garansi diterbitkan', result: 'Terverifikasi' },
      { date: '07 November 2026 · 14:12', event: 'Pemeriksaan autentikasi', result: 'Cocok' },
    ],
  },
  {
    id: 'warranty-nara',
    furnitureId: 'shelf',
    serialNumber: 'WC-RKN-2023-01937',
    purchaseDate: '21 September 2023',
    warrantyEndDate: '21 September 2025',
    status: 'claimed',
    coverage: 'Garansi rangka dan konstruksi selama 2 tahun',
    seller: 'Mitra Furnitur Nusantara',
    tokenId: '#001937',
    walletAddress: '0x71C...93F2',
    ipfsCid: 'ipfs://QmWoodChainNara6e4a8f3c1290',
    svlkCertificate: 'SVLK-JTG-2023-001937',
    productionDate: '02 September 2023',
    authenticationHistory: [
      { date: '21 September 2023 · 16:08', event: 'NFT garansi diterbitkan', result: 'Terverifikasi' },
      { date: '14 Februari 2025 · 11:20', event: 'Klaim #CL-2025-001 diajukan', result: 'Disetujui' },
      { date: '26 Februari 2025 · 15:40', event: 'Perbaikan selesai', result: 'Tuntas' },
    ],
  },
  {
    id: 'warranty-nara-expired',
    furnitureId: 'shelf',
    serialNumber: 'WC-RKN-2023-01862',
    purchaseDate: '15 Agustus 2023',
    warrantyEndDate: '15 Agustus 2025',
    status: 'expired',
    coverage: 'Garansi rangka dan konstruksi selama 2 tahun',
    seller: 'Mitra Furnitur Nusantara',
    tokenId: '#001862',
    walletAddress: '0x71C...93F2',
    ipfsCid: 'ipfs://QmWoodChainNara4f930b1ea8d7',
    svlkCertificate: 'SVLK-JTG-2023-001862',
    productionDate: '27 Juli 2023',
    authenticationHistory: [
      { date: '15 Agustus 2023 · 11:02', event: 'NFT garansi diterbitkan', result: 'Terverifikasi' },
      { date: '15 Agustus 2025 · 00:00', event: 'Masa garansi berakhir', result: 'Selesai' },
    ],
  },
]
