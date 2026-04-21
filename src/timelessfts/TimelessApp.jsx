import { useState, useEffect } from 'react'
import TimelessNav from './TimelessNav'
import TimelessFooter from './TimelessFooter'
import TimelessHome from './TimelessHome'
import TimelessAbout from './TimelessAbout'
import TimelessGallery from './TimelessGallery'
import TimelessContact from './TimelessContact'
import './Timeless.css'

const GALLERIES = {
  'personal-work': {
    title: 'Personal Work',
    subtitle: 'Self-directed projects and long-form visual essays',
    images: [
      { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80&auto=format&fit=crop', alt: 'Aerial view of green valley' },
      { src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=900&q=80&auto=format&fit=crop', alt: 'Person standing on a mountain ridge' },
      { src: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=900&q=80&auto=format&fit=crop', alt: 'Wildflower field in warm light' },
      { src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=80&auto=format&fit=crop', alt: 'Misty lake at dawn' },
      { src: 'https://images.unsplash.com/photo-1455218873509-8fa2da8c5e77?w=700&q=80&auto=format&fit=crop', alt: 'Narrow alley with warm evening light' },
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format&fit=crop', alt: 'Mountain peaks above clouds' },
      { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=80&auto=format&fit=crop', alt: 'Silhouette at sunset' },
      { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&auto=format&fit=crop', alt: 'Coastal road through cliffs' },
      { src: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=900&q=80&auto=format&fit=crop', alt: 'Forest in morning mist' },
      { src: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=700&q=80&auto=format&fit=crop', alt: 'Forest path in autumn' },
    ],
  },
  'day2day': {
    title: 'Day2Day',
    subtitle: 'Everyday moments captured between places and people',
    images: [
      { src: 'https://images.unsplash.com/photo-1541695267696-c4d0f8a7e905?w=900&q=80&auto=format&fit=crop', alt: 'Coffee cup on a wooden table' },
      { src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=700&q=80&auto=format&fit=crop', alt: 'People around a table having a meeting' },
      { src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80&auto=format&fit=crop', alt: 'Street market with colourful stalls' },
      { src: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=700&q=80&auto=format&fit=crop', alt: 'Person reading by a window' },
      { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80&auto=format&fit=crop', alt: 'Laptop and notebook on a desk' },
      { src: 'https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=700&q=80&auto=format&fit=crop', alt: 'Hands holding a warm drink' },
      { src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80&auto=format&fit=crop', alt: 'Kitchen counter with morning light' },
      { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&q=80&auto=format&fit=crop', alt: 'Barber shop interior detail' },
      { src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=900&q=80&auto=format&fit=crop', alt: 'Bicycle leaning against a wall' },
      { src: 'https://images.unsplash.com/photo-1455651512895-775706c9e38a?w=700&q=80&auto=format&fit=crop', alt: 'Rainy window in a café' },
    ],
  },
  'canon': {
    title: 'Canon',
    subtitle: 'Deliberate frames from a camera I trust completely',
    images: [
      { src: 'https://images.unsplash.com/photo-1414086019778-2667d8511bb6?w=900&q=80&auto=format&fit=crop', alt: 'Dramatic mountain glacier landscape' },
      { src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80&auto=format&fit=crop', alt: 'Forest with sunlight streaming through trees' },
      { src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80&auto=format&fit=crop', alt: 'Alpine lake with perfect reflection' },
      { src: 'https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?w=700&q=80&auto=format&fit=crop', alt: 'Close-up of flower petals' },
      { src: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80&auto=format&fit=crop', alt: 'Snowy mountain range at dusk' },
      { src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=700&q=80&auto=format&fit=crop', alt: 'Redwood trees from below' },
      { src: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=900&q=80&auto=format&fit=crop', alt: 'Ocean waves crashing on rocks' },
      { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80&auto=format&fit=crop', alt: 'Autumn valley with morning fog' },
      { src: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=900&q=80&auto=format&fit=crop', alt: 'Golden hour over rolling hills' },
      { src: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=700&q=80&auto=format&fit=crop', alt: 'Snow-covered path through pines' },
    ],
  },
  'digicam': {
    title: 'Digicam',
    subtitle: 'Raw, immediate, unpolished — life as it moves',
    images: [
      { src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80&auto=format&fit=crop', alt: 'Crowded city street at night' },
      { src: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=700&q=80&auto=format&fit=crop', alt: 'Friends laughing at a table' },
      { src: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80&auto=format&fit=crop', alt: 'Train platform with blurred motion' },
      { src: 'https://images.unsplash.com/photo-1520016280345-9b9df7c0a8e8?w=700&q=80&auto=format&fit=crop', alt: 'Night market with neon lights' },
      { src: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=900&q=80&auto=format&fit=crop', alt: 'Urban rooftop view at dusk' },
      { src: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=700&q=80&auto=format&fit=crop', alt: 'Person walking in the rain' },
      { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80&auto=format&fit=crop', alt: 'Desert road under big sky' },
      { src: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=700&q=80&auto=format&fit=crop', alt: 'Close up of old camera lens' },
      { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop', alt: 'Sneakers on a colourful background' },
      { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80&auto=format&fit=crop', alt: 'Laptop open in a dark room' },
    ],
  },
}

export default function TimelessApp() {
  const [path, setPath] = useState(window.location.pathname)

  const navigate = to => {
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Derive sub-route by stripping /timelessfts prefix
  const sub = path.replace(/^\/timelessfts\/?/, '').replace(/\/$/, '') || ''

  const renderPage = () => {
    if (sub === '') return <TimelessHome navigate={navigate} />
    if (sub === 'about') return <TimelessAbout navigate={navigate} />
    if (sub === 'contact') return <TimelessContact />
    if (GALLERIES[sub]) return <TimelessGallery {...GALLERIES[sub]} />
    return <TimelessHome navigate={navigate} />
  }

  return (
    <div className="tl">
      <TimelessNav path={path} navigate={navigate} />
      {renderPage()}
      <TimelessFooter navigate={navigate} />
    </div>
  )
}
