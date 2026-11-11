import { useEffect, useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { furnitureCatalog, userWarranties } from '../../data/dashboardData'

type ClaimStatus = 'submitted' | 'inReview' | 'approved' | 'rejected' | 'repaired'

type WarrantyClaim = {
  id: string
  warrantyId: string
  description: string
  submittedAt: string
  status: ClaimStatus
  photoName: string
}

const claimStageLabels = ['Submitted', 'In Review', 'Approved / Rejected', 'Repaired']

function getClaimStageIndex(status: ClaimStatus) {
  if (status === 'submitted') return 0
  if (status === 'inReview') return 1
  if (status === 'approved' || status === 'rejected') return 2
  return 3
}

export function WarrantyClaims() {
  const [claims, setClaims] = useState<WarrantyClaim[]>([
    {
      id: 'CL-2026-014',
      warrantyId: 'warranty-rona',
      description: 'Lapisan finishing meja mengelupas pada bagian tepi.',
      submittedAt: '05 Nov 2026',
      status: 'inReview',
      photoName: 'bukti-finishing.jpg',
    },
    {
      id: 'CL-2025-001',
      warrantyId: 'warranty-nara',
      description: 'Sambungan rak perlu diperkuat.',
      submittedAt: '14 Feb 2025',
      status: 'repaired',
      photoName: 'bukti-sambungan.jpg',
    },
  ])
  const [selectedWarrantyId, setSelectedWarrantyId] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(null)
  const [submissionError, setSubmissionError] = useState('')
  const [submissionNotice, setSubmissionNotice] = useState('')
  const claimableWarranties = userWarranties.filter((warranty) => warranty.status === 'active' || warranty.status === 'expiringSoon')

  useEffect(() => {
    if (!photo) return
    return () => URL.revokeObjectURL(photo.previewUrl)
  }, [photo])

  const submitClaim = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmissionError('')
    setSubmissionNotice('')
    if (!selectedWarrantyId || !photo || !description.trim()) {
      setSubmissionError('Pilih NFT garansi, unggah foto, dan jelaskan kendala sebelum mengirim.')
      return
    }

    const newClaim: WarrantyClaim = {
      id: `CL-2026-${String(claims.length + 15).padStart(3, '0')}`,
      warrantyId: selectedWarrantyId,
      description: description.trim(),
      submittedAt: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date()),
      status: 'submitted',
      photoName: photo.file.name,
    }
    setClaims((existingClaims) => [newClaim, ...existingClaims])
    setDescription('')
    setPhoto(null)
    setSelectedWarrantyId('')
    setSubmissionNotice(`Klaim ${newClaim.id} tersimpan sebagai simulasi pengajuan.`)
    event.currentTarget.reset()
  }

  return (
    <>
      <section className="claims-intro">
        <span className="claims-intro-icon"><Icon name="shield" size={21} /></span>
        <div><strong>Ajukan klaim dari NFT garansi Anda</strong><p>Unggah bukti kerusakan dan pantau proses penanganan dalam satu halaman.</p></div>
      </section>

      <div className="claims-layout">
        <section className="panel claim-form-panel">
          <div className="panel-heading"><div><h2>Formulir pengajuan klaim</h2><p>Lengkapi detail kendala produk</p></div></div>
          <form className="claim-form" onSubmit={submitClaim}>
            <label htmlFor="claim-warranty">NFT garansi yang dimiliki</label>
            <select id="claim-warranty" value={selectedWarrantyId} onChange={(event) => setSelectedWarrantyId(event.target.value)} required>
              <option value="">Pilih NFT garansi</option>
              {claimableWarranties.map((warranty) => {
                const furniture = furnitureCatalog.find((item) => item.id === warranty.furnitureId)
                return <option key={warranty.id} value={warranty.id}>{furniture?.name} · {warranty.tokenId} · {warranty.serialNumber}</option>
              })}
            </select>

            <label htmlFor="claim-photo">Foto bukti kerusakan</label>
            <input
              id="claim-photo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file && !file.type.startsWith('image/')) {
                  event.currentTarget.value = ''
                  setPhoto(null)
                  setSubmissionError('Bukti kerusakan harus berupa file gambar.')
                  return
                }
                setPhoto(file ? { file, previewUrl: URL.createObjectURL(file) } : null)
                setSubmissionError('')
              }}
              required
            />
            {photo && <img className="claim-photo-preview" src={photo.previewUrl} alt={`Pratinjau bukti kerusakan ${photo.file.name}`} />}

            <label htmlFor="claim-description">Deskripsi kendala</label>
            <textarea id="claim-description" rows={4} placeholder="Ceritakan bagian yang rusak dan sejak kapan kendala terjadi..." value={description} onChange={(event) => setDescription(event.target.value)} required />
            {submissionError && <p className="claim-form-message claim-form-message--error" role="alert">{submissionError}</p>}
            {submissionNotice && <p className="claim-form-message" role="status">{submissionNotice}</p>}
            <button type="submit" className="warranty-transfer-submit">Kirim pengajuan klaim</button>
            <small>Simulasi frontend: data klaim belum dikirim ke backend.</small>
          </form>
        </section>

        <section className="panel claim-tracking-panel">
          <div className="panel-heading"><div><h2>Tracking timeline klaim</h2><p>Status pengajuan garansi Anda</p></div></div>
          <div className="claim-list">
            {claims.map((claim) => {
              const warranty = userWarranties.find((item) => item.id === claim.warrantyId)
              const furniture = warranty && furnitureCatalog.find((item) => item.id === warranty.furnitureId)
              if (!warranty || !furniture) return null

              return (
                <article className="claim-item" key={claim.id}>
                  <div className="claim-item-heading">
                    <div><strong>{claim.id} · {furniture.name}</strong><span>{warranty.tokenId} · Diajukan {claim.submittedAt}</span></div>
                    <span className={`claim-status-pill claim-status-pill--${claim.status}`}>{claim.status === 'inReview' ? 'In Review' : claim.status[0].toUpperCase() + claim.status.slice(1)}</span>
                  </div>
                  <p>{claim.description}</p>
                  <span className="claim-photo-name"><Icon name="orders" size={13} /> {claim.photoName}</span>
                  <div className="claim-timeline">
                    {claimStageLabels.map((stage, index) => {
                      const completed = index < getClaimStageIndex(claim.status) || (claim.status === 'repaired' && index === 3)
                      const current = index === getClaimStageIndex(claim.status)
                      const rejected = claim.status === 'rejected' && index === 2
                      return (
                        <div className={`claim-timeline-step${completed ? ' claim-timeline-step--done' : ''}${current ? ' claim-timeline-step--current' : ''}${rejected ? ' claim-timeline-step--rejected' : ''}`} key={stage}>
                          <span>{completed ? '✓' : rejected ? '!' : index + 1}</span><small>{rejected ? 'Rejected' : stage}</small>
                        </div>
                      )
                    })}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
