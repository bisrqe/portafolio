import { useRouter } from '../router'
import TimelessNav from './TimelessNav'
import TimelessFooter from './TimelessFooter'
import TimelessHome from './TimelessHome'
import TimelessAbout from './TimelessAbout'
import TimelessGallery from './TimelessGallery'
import TimelessContact from './TimelessContact'
import { GALLERIES } from './galleries'
import './Timeless.css'

// Timeless FTS — photography sub-site served under /timelessfts
export default function TimelessApp() {
  const { path } = useRouter()
  const sub = path.replace(/^\/timelessfts\/?/, '').replace(/\/$/, '')

  let page
  if (sub === 'about') page = <TimelessAbout />
  else if (sub === 'contact') page = <TimelessContact />
  else if (GALLERIES[sub]) page = <TimelessGallery key={sub} gallery={sub} images={GALLERIES[sub]} />
  else page = <TimelessHome />

  return (
    <div className="tl">
      <TimelessNav path={path} />
      {page}
      <TimelessFooter />
    </div>
  )
}
