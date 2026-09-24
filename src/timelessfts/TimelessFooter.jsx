import { Link } from '../router'
export default function TimelessFooter() {
  return (
    <footer className="footer">
      <p>
        &copy; {__BUILD_YEAR__} Timeless FTS &mdash;{' '}
        <Link to="/timelessfts/contact">
          bismarck@bisrqe.com
        </Link>
      </p>
    </footer>
  )
}
