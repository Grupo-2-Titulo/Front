type FooterProps = {
  encrypted: string
}

export default function Footer({ encrypted }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-token">ID: {encrypted}</div>
    </footer>
  )
}
