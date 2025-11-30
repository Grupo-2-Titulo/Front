type FooterProps = {
  encrypted: string
  bedId?: string
}

export default function Footer({ encrypted, bedId }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-token">ID: {encrypted}</div>
      {bedId && (
        <div className="footer-bed-id">Bed ID: {bedId}</div>
      )}
    </footer>
  )
}
