type FooterProps = {
  encrypted: string
  bedId?: string
}

export default function Footer({bedId }: FooterProps) {
  return (
    <footer className="footer">
      {bedId && (
        <div className="footer-bed-id">Bed ID: {bedId}</div>
      )}
    </footer>
  )
}
