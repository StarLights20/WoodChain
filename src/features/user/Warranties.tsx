import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import type { IScannerControls } from '@zxing/browser'
import { Icon } from '../../components/Icon'
import type { Furniture, Warranty, WarrantyStatus } from '../../data/dashboardData'
import { getAdminDataSnapshot, setAdminData, useAdminData, type AdminData } from '../../data/adminDataStore'
import { getConsumerWarranties, getWarrantyFurniture, getWarrantyProductName } from '../../data/consumerData'
import { FurnitureIllustration } from './Furniture'

type NdefRecordData = { recordType: string; data: DataView }
type NdefReadingEvent = Event & { message: { records: NdefRecordData[] } }
type NdefReaderLike = EventTarget & { scan: (options?: { signal?: AbortSignal }) => Promise<void> }

declare global {
  interface Window {
    NDEFReader?: new () => NdefReaderLike
  }
}


type ScanResult = {
  serialNumber: string | null
  warranty: Warranty | null
  productName: string | null
  verdict: 'verified' | 'registered' | 'mismatch' | 'unknown'
  chipId: string | null
}

function getScanResult(payload: string, data: AdminData): ScanResult {
  let serialNumber: string | null = null
  let chipId: string | null = null
  let authInitHash: string | null = null
  try {
    const parsed: unknown = JSON.parse(payload)
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>
      if (typeof record.serialNumber === 'string') serialNumber = record.serialNumber
      if (typeof record.chipId === 'string') chipId = record.chipId
      if (typeof record.authInitHash === 'string') authInitHash = record.authInitHash
    }
  } catch {
    // Non-JSON payloads are handled as URLs or serial numbers below.
  }
  try {
    const url = new URL(payload)
    serialNumber ??= url.searchParams.get('serial') ?? url.searchParams.get('serialNumber')
    chipId ??= url.searchParams.get('chip')
    authInitHash ??= url.searchParams.get('hash')
  } catch {
    // NFC tags may contain a plain serial number instead of a URL.
  }
  serialNumber ??= payload.match(/\b(?:WC-[A-Z]{3}-\d{4}-\d{5,8}|MBL-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b/i)?.[0] ?? null
  serialNumber = serialNumber?.toUpperCase() ?? null

  const warranty = serialNumber
    ? getConsumerWarranties(data).find((item) => item.serialNumber.toUpperCase() === serialNumber)
    : null
  const chip = serialNumber
    ? data.chips.find((item) => item.serialNumber.toUpperCase() === serialNumber && (!chipId || item.chipId.toLowerCase() === chipId.toLowerCase()))
    : null
  const suppliedChipProof = Boolean(chipId || authInitHash)
  const verifiedChip = Boolean(chip && authInitHash && chip.authInitHash === authInitHash)
  const registered = Boolean(warranty || chip)
  const verdict = !serialNumber
    ? 'unknown'
    : suppliedChipProof && !verifiedChip
      ? 'mismatch'
      : verifiedChip
        ? 'verified'
        : registered
          ? 'registered'
          : 'unknown'
  return {
    serialNumber,
    warranty: warranty ?? null,
    productName: warranty ? getWarrantyProductName(warranty, data) : null,
    verdict,
    chipId: chip?.chipId ?? chipId,
  }
}

function describeCameraError(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini lalu coba lagi.'
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'Kamera tidak ditemukan pada perangkat ini.'
  }
  if (error instanceof DOMException && error.name === 'NotReadableError') {
    return 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.'
  }
  return 'Kamera tidak dapat dibuka. Pastikan halaman dibuka melalui HTTPS dan izin kamera tersedia.'
}

function decodeNdefRecord(record: NdefRecordData) {
  const bytes = new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength)
  if (record.recordType === 'text' && bytes.length > 0) {
    const languageLength = bytes[0] & 0x3f
    return new TextDecoder().decode(bytes.subarray(languageLength + 1))
  }
  if (record.recordType === 'url' && bytes.length > 0) {
    const urlPrefixes = ['', 'http://www.', 'https://www.', 'http://', 'https://']
    return `${urlPrefixes[bytes[0]] ?? ''}${new TextDecoder().decode(bytes.subarray(1))}`
  }
  return new TextDecoder().decode(bytes)
}

type ScannerPlatform = 'desktop' | 'android-chrome' | 'mobile-other'
type ScanMode = 'qr' | 'nfc'

export function AuthenticityScanner({ platform, onClose }: { platform: ScannerPlatform; onClose: () => void }) {
  const [mode, setMode] = useState<ScanMode>('qr')
  const [cameraStatus, setCameraStatus] = useState('Membuka kamera...')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)
  const [nfcStatus, setNfcStatus] = useState('Dekatkan ponsel ke tag NFC produk.')
  const [nfcError, setNfcError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [manualPayload, setManualPayload] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerControlsRef = useRef<IScannerControls | null>(null)
  const nfcAbortControllerRef = useRef<AbortController | null>(null)
  const cameraSessionRef = useRef(0)

  const processPayload = useCallback((payload: string, method: 'QR' | 'NFC') => {
    const data = getAdminDataSnapshot()
    const scanResult = getScanResult(payload, data)
    setResult(scanResult)
    const registeredChip = scanResult.serialNumber
      ? data.chips.find((chip) => chip.serialNumber.toUpperCase() === scanResult.serialNumber)
      : undefined
    const log = {
      logId: `LOG-${Date.now()}`,
      serialNumber: scanResult.serialNumber ?? 'UNKNOWN',
      scannedAt: new Date().toLocaleString('sv-SE'),
      device: `${method} · ${platform}`,
      result: scanResult.verdict === 'verified'
        ? 'AuthentiCoding Verified'
        : scanResult.verdict === 'mismatch'
          ? 'AuthentiCoding Hash Mismatch'
          : scanResult.verdict === 'registered'
            ? 'Produk terdaftar'
            : 'Kode tidak terdaftar',
      newDynamicHash: registeredChip?.authInitHash ?? 'N/A',
    }
    setAdminData((current) => ({ ...current, nfcLogs: [log, ...current.nfcLogs].slice(0, 100) }))
  }, [platform])

  useEffect(() => {
    if (mode !== 'qr' || result) return

    const session = cameraSessionRef.current + 1
    cameraSessionRef.current = session
    const isCurrentSession = () => cameraSessionRef.current === session

    const startCamera = async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        if (!isCurrentSession() || !videoRef.current) return

        const reader = new BrowserQRCodeReader()
        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (decoded) => {
            if (decoded && isCurrentSession()) {
              cameraSessionRef.current += 1
              processPayload(decoded.getText(), 'QR')
              scannerControlsRef.current?.stop()
              scannerControlsRef.current = null
            }
          },
        )

        if (!isCurrentSession()) {
          controls.stop()
          return
        }
        scannerControlsRef.current = controls
        setCameraStatus('Kamera aktif. Arahkan ke QR pairing WoodChain.')
      } catch (error) {
        if (isCurrentSession()) setCameraError(describeCameraError(error))
      }
    }

    void startCamera()
    return () => {
      if (isCurrentSession()) cameraSessionRef.current += 1
      scannerControlsRef.current?.stop()
      scannerControlsRef.current = null
    }
  }, [cameraAttempt, mode, processPayload, result])

  useEffect(() => () => nfcAbortControllerRef.current?.abort(), [])

  async function startNfc() {
    scannerControlsRef.current?.stop()
    scannerControlsRef.current = null
    setMode('nfc')
    setResult(null)
    setNfcError(null)
    setCameraError(null)

    const NDEFReader = window.NDEFReader
    if (!NDEFReader) {
      setNfcError('NFC Web tidak tersedia di browser ini. Gunakan Chrome Android yang mendukung NFC dan buka PWA melalui HTTPS.')
      return
    }

    nfcAbortControllerRef.current?.abort()
    const controller = new AbortController()
    nfcAbortControllerRef.current = controller

    try {
      const reader = new NDEFReader()
      reader.addEventListener('reading', (event: Event) => {
        const payload = (event as NdefReadingEvent).message.records.map(decodeNdefRecord).join(' ')
        processPayload(payload, 'NFC')
        setNfcStatus('Tag NFC berhasil dibaca.')
        controller.abort()
      }, { signal: controller.signal })
      await reader.scan({ signal: controller.signal })
      if (!controller.signal.aborted) setNfcStatus('NFC aktif. Dekatkan ponsel ke tag NFC produk.')
    } catch (error) {
      if (!controller.signal.aborted) {
        setNfcError(error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Izin NFC ditolak. Aktifkan izin NFC untuk situs ini lalu coba lagi.'
          : 'NFC tidak dapat dimulai. Pastikan NFC aktif, perangkat mendukungnya, dan PWA dibuka melalui HTTPS.')
      }
    }
  }

  const showCamera = () => {
    nfcAbortControllerRef.current?.abort()
    nfcAbortControllerRef.current = null
    setCameraError(null)
    setCameraStatus('Membuka kamera...')
    setCameraAttempt((attempt) => attempt + 1)
    setResult(null)
    setMode('qr')
  }

  const retryScan = () => {
    setResult(null)
    if (mode === 'nfc') void startNfc()
  }

  const submitManualPayload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!manualPayload.trim()) return
    processPayload(manualPayload.trim(), 'QR')
    setManualPayload('')
  }

  return (
    <div className="furniture-modal-backdrop scanner-backdrop" onClick={onClose}>
      <section className="scanner-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title" onClick={(event) => event.stopPropagation()}>
        <div className="furniture-modal-header">
          <span>VERIFIKASI PRODUK</span>
          <button className="furniture-modal-close" onClick={onClose} aria-label="Tutup pemindai"><Icon name="close" size={19} /></button>
        </div>
        <div className="scanner-heading">
          <span className="scanner-heading-icon"><Icon name="shield" size={21} /></span>
          <h2 id="scanner-title">Pindai keaslian produk</h2>
          <p>Pindai QR dengan kamera di desktop maupun ponsel, atau gunakan NFC pada perangkat yang mendukungnya.</p>
        </div>

        <div className="scanner-mode-switch" aria-label="Pilih metode pemindaian">
          <button className={mode === 'qr' ? 'scanner-mode--active' : ''} onClick={showCamera}><Icon name="scan" size={16} /> Kamera QR</button>
          <button className={mode === 'nfc' ? 'scanner-mode--active' : ''} onClick={() => void startNfc()}><Icon name="nfc" size={17} /> NFC</button>
        </div>

        {result ? (
          <div className={`scanner-result${result.verdict === 'verified' || result.verdict === 'registered' ? ' scanner-result--matched' : ''}`} role="status">
            <span className="scanner-result-icon"><Icon name={result.verdict === 'verified' || result.verdict === 'registered' ? 'shield' : 'close'} size={21} /></span>
            <strong>
              {result.verdict === 'verified' ? 'Produk dan pairing terverifikasi'
                : result.verdict === 'registered' ? 'Produk terdaftar'
                  : result.verdict === 'mismatch' ? 'Hash pairing tidak cocok'
                    : 'Kode tidak dikenali'}
            </strong>
            {result.serialNumber && <span>{result.productName ? `${result.productName} · ` : ''}{result.serialNumber}</span>}
            {result.chipId && <span>ID chip: {result.chipId}</span>}
            {result.warranty && <WarrantyStatusBadge status={result.warranty.status} />}
            <p>Hasil dicocokkan dengan data demo yang tersimpan di browser ini; verifikasi kriptografis server belum tersedia.</p>
            <button className="scanner-retry-button" onClick={retryScan}>Pindai lagi</button>
          </div>
        ) : mode === 'qr' ? (
          <>
            <div className="scanner-camera">
              <video ref={videoRef} autoPlay muted playsInline aria-label="Pratinjau kamera untuk memindai QR produk" />
              {!cameraError && <span className="scanner-frame" aria-hidden="true" />}
              <p role={cameraError ? 'alert' : 'status'}>{cameraError ?? cameraStatus}</p>
              {cameraError && <button className="scanner-retry-button" onClick={showCamera}>Coba kamera lagi</button>}
            </div>
            <form className="scanner-manual-form" onSubmit={submitManualPayload}>
              <label htmlFor="scanner-manual-code">Tidak bisa mengakses kamera? Tempel payload QR</label>
              <div><input id="scanner-manual-code" value={manualPayload} onChange={(event) => setManualPayload(event.currentTarget.value)} placeholder="woodchain://verify?serial=..." /><button type="submit" disabled={!manualPayload.trim()}>Verifikasi</button></div>
            </form>
          </>
        ) : (
          <div className="scanner-nfc">
            <span className="scanner-nfc-icon"><Icon name="nfc" size={32} /></span>
            <strong>{nfcError ? 'NFC belum dapat digunakan' : 'Tempelkan perangkat ke tag produk'}</strong>
            <p role={nfcError ? 'alert' : 'status'}>{nfcError ?? nfcStatus}</p>
            <button className="scanner-retry-button" onClick={() => void startNfc()}>{nfcError ? 'Coba NFC lagi' : 'Mulai pindai NFC'}</button>
          </div>
        )}

        <p className="scanner-disclaimer">Kamera memerlukan izin browser dan HTTPS atau localhost. NFC memerlukan browser/perangkat yang kompatibel. Status dicocokkan dengan data lokal demo.</p>
      </section>
    </div>
  )
}

export function MyWarranties() {
  const { data } = useAdminData()
  const warranties = getConsumerWarranties(data)
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null)
  const [transferWarranty, setTransferWarranty] = useState<Warranty | null>(null)

  const activeCount = warranties.filter((warranty) => warranty.status === 'active' || warranty.status === 'expiringSoon').length
  const selectedFurniture = selectedWarranty && getWarrantyFurniture(selectedWarranty, data)
  const transferFurniture = transferWarranty && getWarrantyFurniture(transferWarranty, data)

  return (
    <>
      <section className="warranty-summary">
        <div className="warranty-summary-icon"><Icon name="shield" size={23} /></div>
        <div>
          <strong>Garansi NFT tertaut ke Smart Account Anda.</strong>
          <p>Token ERC-721 ini menghubungkan kepemilikan furnitur dengan paspor produk digitalnya.</p>
        </div>
        <div className="warranty-summary-count"><strong>{activeCount}</strong><span>NFT terlindungi</span></div>
      </section>

      <section className="warranty-section" aria-labelledby="warranty-heading">
        <div className="warranty-section-heading">
          <div>
            <h2 id="warranty-heading">Wallet-linked warranties</h2>
            <p>{warranties.length} NFT garansi tercatat pada Smart Account Anda</p>
          </div>
          <span className="warranty-list-count"><Icon name="shield" size={15} /> ERC-721</span>
        </div>
        <div className="warranty-grid">
          {warranties.map((warranty) => {
            const furniture = getWarrantyFurniture(warranty, data)
            if (!furniture) return null

            return (
              <article className="warranty-card" key={warranty.id}>
                <button className="warranty-card-main" onClick={() => setSelectedWarranty(warranty)} aria-label={`Lihat detail garansi ${furniture.name}`}>
                  <span className={`warranty-image warranty-image--${furniture.id}`}><FurnitureIllustration type={furniture.id} /></span>
                  <span className="warranty-card-copy">
                    <span className="warranty-nft-token">NFT GARANSI · {warranty.tokenId}</span>
                    <span className="warranty-product-category">{furniture.category}</span>
                    <strong className="warranty-product-name">{getWarrantyProductName(warranty, data)}</strong>
                    <span className="warranty-serial"><span>No. seri</span><strong>{warranty.serialNumber}</strong></span>
                    <span className="warranty-purchase"><span>Tanggal pembelian</span><strong>{warranty.purchaseDate}</strong></span>
                    <span className="warranty-wallet-line"><Icon name="shield" size={12} /> {warranty.walletAddress}</span>
                  </span>
                  <WarrantyStatusBadge status={warranty.status} />
                  <span className="warranty-card-hint">Lihat detail <Icon name="chevron" size={15} /></span>
                </button>
                <button
                  className="warranty-transfer-button"
                  disabled={warranty.status !== 'active' && warranty.status !== 'expiringSoon'}
                  onClick={() => setTransferWarranty(warranty)}
                >
                  <Icon name="rotate" size={15} />
                  {warranty.status === 'active' || warranty.status === 'expiringSoon' ? 'Transfer garansi' : 'Tidak dapat ditransfer'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="warranty-note">
        <span className="warranty-note-icon"><Icon name="shield" size={18} /></span>
        <div><strong>Digital Product Passport tersedia</strong><p>Pilih NFT untuk melihat CID IPFS, sertifikat SVLK, tanggal produksi, dan riwayat autentikasi.</p></div>
      </section>

      {selectedWarranty && selectedFurniture && (
        <WarrantyDetail
          warranty={selectedWarranty}
          furniture={selectedFurniture}
          onClose={() => setSelectedWarranty(null)}
          onTransfer={() => {
            setSelectedWarranty(null)
            setTransferWarranty(selectedWarranty)
          }}
          canTransfer={selectedWarranty.status === 'active' || selectedWarranty.status === 'expiringSoon'}
        />
      )}
      {transferWarranty && transferFurniture && (
        <WarrantyTransfer
          warranty={transferWarranty}
          furniture={transferFurniture}
          onClose={() => setTransferWarranty(null)}
        />
      )}
    </>
  )
}

function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  const labels: Record<WarrantyStatus, string> = {
    active: 'Active',
    expiringSoon: 'Expiring Soon',
    claimed: 'Claimed',
    expired: 'Expired',
    voided: 'Warranty Voided',
  }
  return <span className={`warranty-status warranty-status--${status}`}><span />{labels[status]}</span>
}

function WarrantyDetail({
  warranty,
  furniture,
  onClose,
  onTransfer,
  canTransfer,
}: {
  warranty: Warranty
  furniture: Furniture
  onClose: () => void
  onTransfer: () => void
  canTransfer: boolean
}) {
  return (
    <div className="furniture-modal-backdrop" onClick={onClose}>
      <section className="warranty-modal dpp-modal" role="dialog" aria-modal="true" aria-labelledby="warranty-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="furniture-modal-header">
          <span>DIGITAL PRODUCT PASSPORT · ERC-721</span>
          <button className="furniture-modal-close" onClick={onClose} aria-label="Tutup detail"><Icon name="close" size={19} /></button>
        </div>
        <div className="warranty-detail-product">
          <span className={`warranty-detail-image warranty-image--${furniture.id}`}><FurnitureIllustration type={furniture.id} /></span>
          <div>
            <span className="warranty-product-category">{furniture.category}</span>
            <h2 id="warranty-detail-title">{furniture.name}</h2>
            <WarrantyStatusBadge status={warranty.status} />
          </div>
        </div>
        <div className="warranty-detail-list">
          <div><span>Token</span><strong>ERC-721 · {warranty.tokenId}</strong></div>
          <div><span>Wallet pemilik</span><strong>{warranty.walletAddress}</strong></div>
          <div><span>Nomor seri produk</span><strong>{warranty.serialNumber}</strong></div>
          <div><span>Produksi</span><strong>{warranty.productionDate}</strong></div>
          <div><span>Sertifikat kayu SVLK</span><strong>{warranty.svlkCertificate}</strong></div>
          <div><span>Garansi sampai</span><strong>{warranty.warrantyEndDate} · {warranty.coverage}</strong></div>
          <div><span>Penjual</span><strong>{warranty.seller}</strong></div>
        </div>
        <div className="dpp-cid"><span>IPFS CONTENT IDENTIFIER</span><code>{warranty.ipfsCid}</code></div>
        <section className="authentication-history">
          <h3>Riwayat autentikasi</h3>
          {warranty.authenticationHistory.map((entry) => (
            <div className="authentication-entry" key={`${entry.date}-${entry.event}`}>
              <span className="authentication-entry-dot" />
              <div><strong>{entry.event}</strong><span>{entry.date}</span></div>
              <em>{entry.result}</em>
            </div>
          ))}
        </section>
        <div className="warranty-detail-info">
          <span className="certificate-icon"><Icon name="shield" size={18} /></span>
          <div><strong>Passport dari data tiruan</strong><p>Informasi blockchain dan IPFS pada prototipe ini belum diterbitkan atau diverifikasi jaringan.</p></div>
        </div>
        {canTransfer && (
          <button className="warranty-transfer-button warranty-transfer-button--modal" onClick={onTransfer}>
            <Icon name="rotate" size={16} /> Transfer garansi
          </button>
        )}
      </section>
    </div>
  )
}

function WarrantyTransfer({
  warranty,
  furniture,
  onClose,
}: {
  warranty: Warranty
  furniture: Furniture
  onClose: () => void
}) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [prepared, setPrepared] = useState(false)

  return (
    <div className="furniture-modal-backdrop" onClick={onClose}>
      <section className="warranty-modal warranty-transfer-modal" role="dialog" aria-modal="true" aria-labelledby="warranty-transfer-title" onClick={(event) => event.stopPropagation()}>
        <div className="furniture-modal-header">
          <span>TRANSFER KEPEMILIKAN</span>
          <button className="furniture-modal-close" onClick={onClose} aria-label="Tutup transfer"><Icon name="close" size={19} /></button>
        </div>
        <span className="warranty-transfer-icon"><Icon name="rotate" size={21} /></span>
        <h2 id="warranty-transfer-title">Transfer NFT garansi</h2>
        <p className="warranty-transfer-description">Masukkan email atau wallet pembeli untuk mensimulasikan pengalihan NFT {furniture.name} di pasar sekunder.</p>
        <div className="warranty-transfer-product"><span>Token ERC-721 · Nomor seri</span><strong>{warranty.tokenId} · {warranty.serialNumber}</strong></div>
        {prepared ? (
          <div className="warranty-transfer-preview" role="status">
            <strong>Simulasi transfer berhasil</strong>
            <span>NFT {warranty.tokenId} untuk {furniture.name} disiapkan untuk {recipientEmail}.</span>
            <small>Tidak ada transaksi on-chain yang dikirim.</small>
          </div>
        ) : (
          <form onSubmit={(event) => {
            event.preventDefault()
            setPrepared(true)
          }}>
            <label className="warranty-email-label" htmlFor="warranty-recipient-email">Email atau alamat wallet pembeli</label>
            <input
              className="warranty-email-input"
              id="warranty-recipient-email"
              type="text"
              autoComplete="off"
              placeholder="nama@email.com atau 0x..."
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              pattern="(^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^0x[a-fA-F0-9]{40}$)"
              required
            />
            <button className="warranty-transfer-submit" type="submit">Simulasikan transfer</button>
          </form>
        )}
      </section>
    </div>
  )
}
