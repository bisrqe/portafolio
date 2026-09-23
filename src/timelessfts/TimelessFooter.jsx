export default function TimelessFooter({ navigate }) {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} Timeless FTS &mdash;{' '}
        <a href="/timelessfts/contact" onClick={e => { e.preventDefault(); navigate('/timelessfts/contact') }}>
          bismarck@bisrqe.com
        </a>
      </p>
    </footer>
  )
}
