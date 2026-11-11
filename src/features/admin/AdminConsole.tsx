import { useState, type FormEvent } from 'react'
import mockAdminData from '../../data/mockAdminData.json'
import './AdminConsole.css'

type Product = {
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

type Order = {
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

type Claim = {
  claimId: string
  tokenId: string
  customerEmail: string
  productName: string
  issueDescription: string
  photoIpfsUrl: string
  status: string
  submittedDate: string
}

type NfcLog = {
  logId: string
  serialNumber: string
  scannedAt: string
  device: string
  result: string
  newDynamicHash: string
}

type Batch = { batchId: string; createdAt: string; chipsCount: number }
type Chip = { chipId: string; chipType: string; batchId: string; serialNumber: string; authInitHash: string }
type Transfer = {
  transferId: string
  tokenId: string
  productName: string
  from: string
  to: string
  transferredAt: string
  status: string
}

type AdminData = {
  adminProfile: { address: string; role: string; network: string; connectedWallet: string }
  products: Product[]
  pendingOrders: Order[]
  claims: Claim[]
  nfcLogs: NfcLog[]
  batches: Batch[]
  chips: Chip[]
  warrantyTransfers: Transfer[]
}

const initialAdminData = mockAdminData as AdminData
const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
const createDemoHash = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`

export function AdminConsole({ page }: { page: string }) {
  const [data, setData] = useState<AdminData>(() => ({
    ...initialAdminData,
    products: [...initialAdminData.products],
    pendingOrders: [...initialAdminData.pendingOrders],
    claims: [...initialAdminData.claims],
    nfcLogs: [...initialAdminData.nfcLogs],
    batches: [...initialAdminData.batches],
    chips: [...initialAdminData.chips],
    warrantyTransfers: [...initialAdminData.warrantyTransfers],
  }))
  const [notice, setNotice] = useState('')

  const updateClaimStatus = (claimId: string, status: string) => {
    setData((current) => ({
      ...current,
      claims: current.claims.map((claim) => claim.claimId === claimId ? { ...claim, status } : claim),
    }))
    setNotice(`${claimId}: status diperbarui menjadi ${status}.`)
  }

  if (page === 'Katalog & DPP') {
    return <CatalogPage data={data} setData={setData} notice={notice} setNotice={setNotice} />
  }
  if (page === 'Pesanan & Minting') {
    return <OrdersPage data={data} setData={setData} notice={notice} setNotice={setNotice} />
  }
  if (page === 'NFC Encoder') {
    return <NfcPage data={data} setData={setData} notice={notice} setNotice={setNotice} />
  }
  if (page === 'Klaim Garansi') {
    return <ClaimsPage claims={data.claims} onStatusChange={updateClaimStatus} notice={notice} />
  }
  if (page === 'Riwayat AuthentiCoding') {
    return <HistoryPage data={data} />
  }
  return null
}

function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="admin-console-intro">
      <div>
        <span className="admin-console-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}

function Notice({ children }: { children: string }) {
  return children ? <div className="admin-console-notice" role="status">{children}</div> : null
}

function CatalogPage({ data, setData, notice, setNotice }: { data: AdminData; setData: React.Dispatch<React.SetStateAction<AdminData>>; notice: string; setNotice: (message: string) => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [glbFile, setGlbFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    setError('')
    setNotice('')
    if (!glbFile || !photoFile) {
      setError('Pilih file 3D .glb dan foto produk sebelum menyimpan.')
      return
    }
    if (!glbFile.name.toLowerCase().endsWith('.glb')) {
      setError('File model 3D harus berformat .glb.')
      return
    }
    const form = new FormData(formElement)
    setSaving(true)
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    const cid = `ipfs://${createDemoHash('QmWoodChain')}`
    const product: Product = {
      id: createDemoHash('PRD'),
      name: String(form.get('name')),
      category: String(form.get('category')),
      price: Number(form.get('price')),
      glbFile: glbFile.name,
      photoFile: photoFile.name,
      svlkCertificate: String(form.get('svlkCertificate')),
      craftsman: String(form.get('craftsman')),
      warrantyMonths: Number(form.get('warrantyMonths')),
      cid,
      status: 'Pinned',
    }
    setData((current) => ({ ...current, products: [product, ...current.products] }))
    setNotice(`Produk tersimpan. CID simulasi Pinata: ${cid}`)
    formElement.reset()
    setGlbFile(null)
    setPhotoFile(null)
    setSaving(false)
  }

  return (
    <div className="admin-console">
      <PageIntro eyebrow="KATALOG & DIGITAL PRODUCT PASSPORT" title="Katalog & Digital Product Passport" description="Daftarkan furnitur, metadata legalitas kayu, dan passport digital produk." />
      <div className="admin-profile-strip">
        <span className="admin-online-dot" />
        <strong>{data.adminProfile.connectedWallet}</strong>
        <span>{data.adminProfile.role}</span>
        <span>{data.adminProfile.network}</span>
        <code>{data.adminProfile.address}</code>
      </div>
      <div className="admin-console-grid admin-console-grid--catalog">
        <form className="admin-console-card admin-form" onSubmit={submitProduct}>
          <div className="admin-card-heading"><div><h3>Tambah produk & DPP</h3><p>Simulasi pinning metadata melalui Pinata SDK.</p></div><span className="admin-card-icon">＋</span></div>
          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">Nama produk<input name="name" required placeholder="Contoh: Meja makan jati" /></label>
            <label className="admin-field">Kategori<select name="category" defaultValue="Meja makan"><option>Meja makan</option><option>Kursi</option><option>Lemari</option><option>Rak</option><option>Lainnya</option></select></label>
            <label className="admin-field">Harga (Rp)<input name="price" type="number" min="1" required placeholder="18500000" /></label>
            <label className="admin-field">Model 3D (.glb)<input type="file" accept=".glb,model/gltf-binary" required onChange={(event) => setGlbFile(event.currentTarget.files?.[0] ?? null)} /></label>
            <label className="admin-field">Foto produk<input type="file" accept="image/*" required onChange={(event) => setPhotoFile(event.currentTarget.files?.[0] ?? null)} /></label>
            <label className="admin-field admin-field--wide">Sertifikasi kayu (SVLK)<input name="svlkCertificate" required placeholder="SVLK-JTG-2026-00089" /></label>
            <label className="admin-field admin-field--wide">Profil perajin ukir<input name="craftsman" required placeholder="Nama perajin · lokasi" /></label>
            <label className="admin-field">Garansi (bulan)<input name="warrantyMonths" type="number" min="1" required defaultValue="24" /></label>
          </div>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <Notice>{notice}</Notice>
          <button className="admin-primary-button" type="submit" disabled={saving}>{saving ? <><span className="admin-spinner" /> Mengunggah metadata...</> : 'Simpan & Unggah IPFS (Pinata SDK)'}</button>
          <p className="admin-demo-note">Demo lokal: CID dan unggahan hanya disimulasikan, tidak ada file yang dikirim ke IPFS.</p>
        </form>
        <section className="admin-console-card admin-catalog-list">
          <div className="admin-card-heading"><div><h3>Katalog aktif</h3><p>{data.products.length} produk terdaftar</p></div><span className="admin-count-badge">{data.products.length} produk</span></div>
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead><tr><th>PRODUK</th><th>HARGA</th><th>GARANSI</th><th>STATUS IPFS</th></tr></thead>
              <tbody>{data.products.map((product) => <tr key={product.id}>
                <td><strong>{product.name}</strong><small>{product.category} · {product.svlkCertificate}</small></td>
                <td>{formatPrice(product.price)}</td><td>{product.warrantyMonths} bln</td>
                <td><span className="admin-status admin-status--good">● {product.status}</span><small className="admin-cid">{product.cid}</small></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function OrdersPage({ data, setData, notice, setNotice }: { data: AdminData; setData: React.Dispatch<React.SetStateAction<AdminData>>; notice: string; setNotice: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(data.pendingOrders.find((order) => order.status === 'Pending Mint')?.orderId ?? '')
  const selectedOrder = data.pendingOrders.find((order) => order.orderId === selectedId)
  const [buyerAddress, setBuyerAddress] = useState(selectedOrder?.customerWallet ?? '')
  const [serialNumber, setSerialNumber] = useState(selectedOrder?.serialNumber ?? '')
  const [expirationDate, setExpirationDate] = useState('')
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState('')

  const chooseOrder = (order: Order) => {
    setSelectedId(order.orderId)
    setBuyerAddress(order.customerWallet)
    setSerialNumber(order.serialNumber)
    setError('')
  }

  const mintWarranty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!selectedOrder || selectedOrder.status !== 'Pending Mint') {
      setError('Pilih pesanan dengan status Pending Mint.')
      return
    }
    if (!buyerAddress.trim() || !serialNumber.trim() || !expirationDate) {
      setError('Alamat/email pembeli, nomor seri, dan tanggal kedaluwarsa wajib diisi.')
      return
    }
    setMinting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1400))
    const tokenId = String(102 + data.pendingOrders.filter((order) => order.tokenId).length)
    setData((current) => ({
      ...current,
      pendingOrders: current.pendingOrders.map((order) => order.orderId === selectedId ? { ...order, status: 'Minted', tokenId, tokenExpiresAt: expirationDate, customerWallet: buyerAddress, serialNumber } : order),
    }))
    setNotice(`Pesanan ${selectedId} dikonfirmasi. NFT garansi #${tokenId} berhasil disimulasikan di Polygon Amoy.`)
    setMinting(false)
  }

  return (
    <div className="admin-console">
      <PageIntro eyebrow="KONFIRMASI PESANAN & NFT" title="Pesanan & Minting Garansi" description="Konfirmasi pesanan masuk dan simulasi penerbitan NFT garansi ERC-721." />
      <section className="admin-console-card admin-orders-list">
        <div className="admin-card-heading"><div><h3>Pesanan masuk</h3><p>Pesanan konsumen yang membutuhkan konfirmasi.</p></div><span className="admin-count-badge">{data.pendingOrders.filter((order) => order.status === 'Pending Mint').length} menunggu</span></div>
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead><tr><th>NO. PESANAN</th><th>PEMBELI</th><th>PRODUK</th><th>TANGGAL</th><th>STATUS</th><th /></tr></thead>
            <tbody>{data.pendingOrders.map((order) => <tr key={order.orderId} className={selectedId === order.orderId ? 'admin-row-selected' : ''}>
              <td><strong>{order.orderId}</strong><small>{order.serialNumber}</small></td><td>{order.customerEmail}<small>{order.customerWallet}</small></td><td>{order.productName}<small>Garansi {order.warrantyMonths} bulan</small></td><td>{order.orderDate}</td>
              <td><span className={`admin-status ${order.status === 'Minted' ? 'admin-status--good' : 'admin-status--pending'}`}>{order.status === 'Minted' ? '● ' : '◷ '}{order.status}{order.tokenId ? ` · #${order.tokenId}` : ''}</span>{order.tokenExpiresAt && <small className="admin-expiration">Berakhir {order.tokenExpiresAt}</small>}</td>
              <td><button className="admin-small-button" type="button" disabled={order.status !== 'Pending Mint'} onClick={() => chooseOrder(order)}>{order.status === 'Pending Mint' ? 'Pilih' : 'Selesai'}</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
      <form className="admin-console-card admin-mint-form" onSubmit={mintWarranty}>
        <div className="admin-card-heading"><div><h3>Konfirmasi & minting garansi</h3><p>{selectedOrder ? `Pesanan terpilih: ${selectedOrder.orderId}` : 'Pilih pesanan pending untuk mulai.'}</p></div><span className="admin-card-icon">◇</span></div>
        <div className="admin-form-grid admin-form-grid--mint">
          <label className="admin-field">Alamat wallet / email pembeli<input value={buyerAddress} onChange={(event) => setBuyerAddress(event.currentTarget.value)} placeholder="0x... atau email pembeli" required /></label>
          <label className="admin-field">Nomor seri kayu<input value={serialNumber} onChange={(event) => setSerialNumber(event.currentTarget.value)} required /></label>
          <label className="admin-field">Tanggal kedaluwarsa garansi<input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.currentTarget.value)} required /></label>
        </div>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <Notice>{notice}</Notice>
        <div className="admin-form-actions"><span className="admin-demo-note">Transaksi dan wallet hanya simulasi; tidak ada transaksi blockchain nyata.</span><button className="admin-primary-button" type="submit" disabled={minting || !selectedOrder || selectedOrder.status !== 'Pending Mint'}>{minting ? <><span className="admin-spinner" /> Mengirim transaksi...</> : 'Confirm Order & Mint NFT'}</button></div>
      </form>
    </div>
  )
}

function NfcPage({ data, setData, notice, setNotice }: { data: AdminData; setData: React.Dispatch<React.SetStateAction<AdminData>>; notice: string; setNotice: (message: string) => void }) {
  const [batchName, setBatchName] = useState('')
  const [selectedBatch, setSelectedBatch] = useState(data.batches[0]?.batchId ?? '')
  const [chipId, setChipId] = useState('')
  const [chipType, setChipType] = useState('NTAG213')
  const [serial, setSerial] = useState('')
  const [activeChip, setActiveChip] = useState<Chip | null>(data.chips[0] ?? null)
  const [error, setError] = useState('')

  const createBatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = batchName.trim()
    if (!id || data.batches.some((batch) => batch.batchId.toLowerCase() === id.toLowerCase())) {
      setError(id ? 'ID batch sudah terdaftar.' : 'Masukkan ID batch produksi.')
      return
    }
    const batch = { batchId: id, createdAt: new Date().toISOString().slice(0, 10), chipsCount: 0 }
    setData((current) => ({ ...current, batches: [batch, ...current.batches] }))
    setSelectedBatch(id)
    setBatchName('')
    setError('')
    setNotice(`Batch ${id} berhasil dibuat.`)
  }

  const registerChip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!selectedBatch) {
      setError('Buat atau pilih batch produksi terlebih dahulu.')
      return
    }
    if (data.chips.some((chip) => chip.chipId.toLowerCase() === chipId.trim().toLowerCase())) {
      setError('ID chip sudah terdaftar.')
      return
    }
    const chip: Chip = { chipId: chipId.trim(), chipType, batchId: selectedBatch, serialNumber: serial.trim(), authInitHash: createDemoHash('AUTH-INIT') }
    const log: NfcLog = {
      logId: createDemoHash('LOG'),
      serialNumber: chip.serialNumber,
      scannedAt: new Date().toLocaleString('sv-SE'),
      device: 'Admin NFC Encoder (simulasi)',
      result: 'Chip NFC terdaftar',
      newDynamicHash: chip.authInitHash,
    }
    setData((current) => ({
      ...current,
      chips: [chip, ...current.chips],
      batches: current.batches.map((batch) => batch.batchId === selectedBatch ? { ...batch, chipsCount: batch.chipsCount + 1 } : batch),
      nfcLogs: [log, ...current.nfcLogs],
    }))
    setActiveChip(chip)
    setChipId('')
    setSerial('')
    setNotice(`Chip ${chip.chipId} terdaftar dan AUTH-INIT-HASH berhasil dibuat.`)
  }

  return (
    <div className="admin-console">
      <PageIntro eyebrow="PRODUKSI & PAIRING NFC" title="NFC Batch Encoder" description="Kelola batch produksi, daftarkan chip NTAG, dan siapkan pairing untuk aplikasi smartphone." />
      <div className="admin-console-grid admin-console-grid--nfc">
        <div className="admin-console-card">
          <div className="admin-card-heading"><div><h3>Batch produksi</h3><p>Buat identitas kelompok produksi furnitur.</p></div><span className="admin-card-icon">▦</span></div>
          <form className="admin-inline-form" onSubmit={createBatch}><label className="admin-field">ID batch baru<input value={batchName} onChange={(event) => setBatchName(event.currentTarget.value)} placeholder="BATCH-JATI-2026-Q1" /></label><button className="admin-primary-button" type="submit">Buat batch</button></form>
          <div className="admin-batch-list">{data.batches.map((batch) => <button key={batch.batchId} type="button" className={`admin-batch-item${selectedBatch === batch.batchId ? ' admin-batch-item--active' : ''}`} onClick={() => setSelectedBatch(batch.batchId)}><span><strong>{batch.batchId}</strong><small>Dibuat {batch.createdAt}</small></span><span>{batch.chipsCount} chip</span></button>)}</div>
        </div>
        <form className="admin-console-card admin-form" onSubmit={registerChip}>
          <div className="admin-card-heading"><div><h3>Registrasi chip NFC</h3><p>Pasangkan ID fisik chip dengan nomor seri produk.</p></div><span className="admin-card-icon">⌁</span></div>
          <div className="admin-form-grid">
            <label className="admin-field">ID fisik chip<input value={chipId} onChange={(event) => setChipId(event.currentTarget.value)} required placeholder="04:A1:B2:C3:D4:E5:80" /></label>
            <label className="admin-field">Tipe chip<select value={chipType} onChange={(event) => setChipType(event.currentTarget.value)}><option>NTAG213</option><option>NTAG215</option></select></label>
            <label className="admin-field admin-field--wide">Nomor seri produk<input value={serial} onChange={(event) => setSerial(event.currentTarget.value)} required placeholder="MBL-JATI-2026-089" /></label>
          </div>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <Notice>{notice}</Notice>
          <button className="admin-primary-button" type="submit">Daftarkan chip & generate hash</button>
        </form>
      </div>
      <section className="admin-console-card admin-pairing-card">
        <div className="admin-card-heading"><div><h3>QR Code pairing</h3><p>QR simulasi untuk alur penanaman data di chip produk.</p></div><span className="admin-count-badge">SIMULASI</span></div>
        {activeChip ? <div className="admin-pairing-content"><SimulatedQr value={`${activeChip.chipId}|${activeChip.serialNumber}|${activeChip.authInitHash}`} /><div><span className="admin-console-eyebrow">CHIP TERPILIH · {activeChip.chipType}</span><h4>{activeChip.serialNumber}</h4><p>ID chip: <code>{activeChip.chipId}</code></p><p>Hash awal: <code>{activeChip.authInitHash}</code></p><p>Batch: <strong>{activeChip.batchId}</strong></p><p className="admin-demo-note">QR bersifat visual demo dan belum membawa payload yang dapat dipindai.</p></div></div> : <div className="admin-empty-state">Daftarkan chip NFC untuk membuat preview QR pairing.</div>}
      </section>
      <section className="admin-console-card">
        <div className="admin-card-heading"><div><h3>Chip terdaftar</h3><p>{data.chips.length} chip terhubung ke batch produksi.</p></div></div>
        <div className="admin-table-wrap"><table className="admin-data-table"><thead><tr><th>ID CHIP</th><th>TIPE</th><th>BATCH</th><th>NOMOR SERI</th><th>AUTH-INIT-HASH</th></tr></thead><tbody>
          {data.chips.length ? data.chips.map((chip) => <tr key={chip.chipId}><td><strong>{chip.chipId}</strong></td><td>{chip.chipType}</td><td>{chip.batchId}</td><td>{chip.serialNumber}</td><td><code>{chip.authInitHash}</code></td></tr>) : <tr><td colSpan={5} className="admin-table-empty">Belum ada chip terdaftar.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}

function SimulatedQr({ value }: { value: string }) {
  const size = 21
  const seed = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0)
  const finderCell = (x: number, y: number, left: number, top: number) => {
    const dx = x - left
    const dy = y - top
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
    return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
  }
  return <div className="admin-qr" role="img" aria-label="Ilustrasi QR code pairing simulasi">{Array.from({ length: size * size }, (_, index) => {
    const x = index % size
    const y = Math.floor(index / size)
    const fixed = finderCell(x, y, 0, 0) ?? finderCell(x, y, size - 7, 0) ?? finderCell(x, y, 0, size - 7)
    const filled = fixed ?? ((x * 17 + y * 31 + seed + x * y) % 7 < 3)
    return <i key={index} className={filled ? 'admin-qr-cell admin-qr-cell--filled' : 'admin-qr-cell'} />
  })}</div>
}

function ClaimsPage({ claims, onStatusChange, notice }: { claims: Claim[]; onStatusChange: (claimId: string, status: string) => void; notice: string }) {
  return (
    <div className="admin-console">
      <PageIntro eyebrow="KLAIM KONSUMEN" title="Konsol Verifikasi & Klaim Garansi" description="Tinjau bukti kerusakan, putuskan klaim, atau cabut garansi untuk kasus kloning." />
      <section className="admin-console-card">
        <div className="admin-card-heading"><div><h3>Pengajuan klaim</h3><p>Tindakan admin akan memperbarui status pada data simulasi.</p></div><span className="admin-count-badge">{claims.filter((claim) => claim.status === 'Submitted').length} perlu ditinjau</span></div>
        <Notice>{notice}</Notice>
        <div className="admin-table-wrap"><table className="admin-data-table admin-claims-table">
          <thead><tr><th>TOKEN / PEMBELI</th><th>PRODUK & KERUSAKAN</th><th>FOTO IPFS</th><th>TANGGAL</th><th>STATUS</th><th>AKSI ADMIN</th></tr></thead>
          <tbody>{claims.map((claim) => <tr key={claim.claimId}>
            <td><strong>#{claim.tokenId} · {claim.claimId}</strong><small>{claim.customerEmail}</small></td>
            <td><strong>{claim.productName}</strong><small className="admin-claim-description">{claim.issueDescription}</small></td>
            <td><div className="admin-photo-preview"><span>IPFS</span><small>{claim.photoIpfsUrl}</small></div></td>
            <td>{claim.submittedDate}</td><td><span className={`admin-status ${claim.status === 'Submitted' ? 'admin-status--pending' : claim.status === 'Approved' ? 'admin-status--good' : 'admin-status--muted'}`}>{claim.status}</span></td>
            <td><div className="admin-claim-actions"><button type="button" className="admin-action-button admin-action-button--approve" onClick={() => onStatusChange(claim.claimId, 'Approved')} disabled={claim.status === 'Warranty Voided'}>✓ Approve</button><button type="button" className="admin-action-button admin-action-button--reject" onClick={() => onStatusChange(claim.claimId, 'Rejected')} disabled={claim.status === 'Warranty Voided'}>× Reject</button><button type="button" className="admin-action-button admin-action-button--void" onClick={() => onStatusChange(claim.claimId, 'Warranty Voided')} disabled={claim.status === 'Warranty Voided'}>⚠ Void</button></div></td>
          </tr>)}</tbody>
        </table></div>
      </section>
      <p className="admin-demo-note">Void Warranty menandai klaim sebagai Warranty Voided pada simulasi ini; tidak ada kontrak pintar yang dipanggil.</p>
    </div>
  )
}

function HistoryPage({ data }: { data: AdminData }) {
  return (
    <div className="admin-console">
      <PageIntro eyebrow="AUDIT & PASAR SEKUNDER" title="Riwayat AuthentiCoding & Pasar Sekunder" description="Pantau pemindaian NFC dan perpindahan kepemilikan NFT garansi." />
      <section className="admin-console-card">
        <div className="admin-card-heading"><div><h3>Log pemindaian AuthentiCoding</h3><p>Aktivitas verifikasi NFC di lapangan.</p></div><span className="admin-live-badge"><i /> LIVE DEMO</span></div>
        <div className="admin-table-wrap"><table className="admin-data-table"><thead><tr><th>TIMESTAMP</th><th>NOMOR SERI</th><th>DEVICE / HASIL</th><th>UPDATE HASH</th></tr></thead><tbody>
          {data.nfcLogs.map((log) => <tr key={log.logId}><td>{log.scannedAt}</td><td><strong>{log.serialNumber}</strong></td><td><strong>{log.device}</strong><small className="admin-status admin-status--good">● {log.result} · {log.logId}</small></td><td><code>{log.newDynamicHash}</code></td></tr>)}
        </tbody></table></div>
      </section>
      <section className="admin-console-card admin-history-transfers">
        <div className="admin-card-heading"><div><h3>Pengalihan garansi</h3><p>Riwayat transfer NFT garansi antar pemilik.</p></div><span className="admin-count-badge">{data.warrantyTransfers.length} transfer</span></div>
        <div className="admin-table-wrap"><table className="admin-data-table"><thead><tr><th>TOKEN / PRODUK</th><th>DARI PEMILIK</th><th>KE PEMILIK</th><th>WAKTU TRANSFER</th><th>STATUS</th></tr></thead><tbody>
          {data.warrantyTransfers.map((transfer) => <tr key={transfer.transferId}><td><strong>#{transfer.tokenId}</strong><small>{transfer.productName}</small></td><td><code>{transfer.from}</code></td><td><code>{transfer.to}</code></td><td>{transfer.transferredAt}</td><td><span className="admin-status admin-status--good">{transfer.status}</span></td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  )
}
