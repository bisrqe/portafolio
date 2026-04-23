import { useState, useEffect } from 'react'
import TimelessNav from './TimelessNav'
import TimelessFooter from './TimelessFooter'
import TimelessHome from './TimelessHome'
import TimelessAbout from './TimelessAbout'
import TimelessGallery from './TimelessGallery'
import TimelessContact from './TimelessContact'
import './Timeless.css'

const GALLERIES = {
  'portraits': {
    title: 'Portraits',
    subtitle: 'Raw, immediate, unpolished — life as it moves through time',
    images: [
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910283/CDMX_Jan_26_Edited_lrokc3.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910274/CDMX_Jan_26_Edited_1_ka8lz3.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910271/CDMX_Jan_26_Edited_2_yiw3w4.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910157/Edited_Image_7676_from_People_bn7ymv.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910153/People_Edited_Photo_tkamwz.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910150/Edited_Image_from_People_awykgj.jpg', alt: 'Aerial view of green valley' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909980/Canon_IMG_9906_1_jg8nc9.jpg', alt: 'Person standing on a mountain ridge' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909925/Canon_IMG_0364_khf2q7.jpg', alt: 'Wildflower field in warm light' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909922/Canon_IMG_0249_xmo6gb.jpg', alt: 'Misty lake at dawn' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909919/Canon_IMG_0094_xqfpwm.jpg', alt: 'Narrow alley with warm evening light' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909912/Canon_IMG_9971_hfpqx6.jpg', alt: 'Mountain peaks above clouds' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909910/Canon_IMG_9926_a3blb6.jpg', alt: 'Silhouette at sunset' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909901/IMG_0695_from_Google_Drive_xoxl67.jpg', alt: 'Coastal road through cliffs' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909721/Entropy_IMG_0952_v35mqh.jpg', alt: 'Forest in morning mist' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909719/Image_from_Google_Drive_rfj8n7.jpg', alt: 'Forest path in autumn' },
    ],
  },
  'concept': {
    title: 'Concept Photos',
    subtitle: 'Self-directed projects and long-form visual essays',
    images: [
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776910211/Edited_Photo_from_People_nya1xb.jpg', alt: 'Coffee cup on a wooden table' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908125/Cumplean%CC%83os_Anna_Mar_21_2026_fdtxq8.jpg', alt: 'Coffee cup on a wooden table' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908128/Cumplean%CC%83os_Anna_Mar_21_2026_2_malhp8.jpg', alt: 'People around a table having a meeting' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908129/Cumplean%CC%83os_Anna_Mar_21_2026_3_ptxytr.jpg', alt: 'Street market with colourful stalls' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908212/Photography_Class_Edited_July_2025_ets8pv.jpg', alt: 'Person reading by a window' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908214/Photography_Class_Edited_July_2025_1_ddn6xl.jpg', alt: 'Laptop and notebook on a desk' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908215/Photography_Class_July_24_2025_dqbghs.jpg', alt: 'Hands holding a warm drink' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908217/Photography_Class_July_24_2025_1_llx7n9.jpg', alt: 'Kitchen counter with morning light' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908218/Photography_Class_Edited_July_2025_2_b5dlml.jpg', alt: 'Barber shop interior detail' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908220/Photography_Class_Edited_July_2025_3_j4vvst.jpg', alt: 'Bicycle leaning against a wall' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908222/Photography_Class_July_24_2025_2_tmoodk.jpg', alt: 'Rainy window in a café' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908223/Photography_Class_July_24_2025_5_bfgao1.jpg', alt: 'Hands holding a warm drink' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908225/Photography_Class_July_24_2025_3_bwawxt.jpg', alt: 'Kitchen counter with morning light' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908227/Photography_Class_July_24_2025_4_pu1pxq.jpg', alt: 'Barber shop interior detail' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908310/Photography_Class_July_24_2025_6_megv1s.jpg', alt: 'Bicycle leaning against a wall' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909344/Ethics_Concept_i3jkw8.jpg', alt: 'Rainy window in a café' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909959/Digicam_P1100699_wauuwt.jpg', alt: 'Rainy window in a café' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909954/Canon_Image_9932_z2vmy6.jpg', alt: 'Rainy window in a café' },
    ],
  },
  'travel': {
    title: 'Travel',
    subtitle: 'Everyday moments captured between places and people',
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
  'events': {
    title: 'Events',
    subtitle: 'Capturing the energy and atmosphere of gatherings, celebrations, and everyday life',
    images: [
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907462/A_Prueba_de_Chanclazos_Nov_13_2025_Edited_4_okpryn.jpg', alt: 'Speakers receiving recognitions' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907459/A_Prueba_de_Chanclazos_Nov_13_2025_Edited_2_ioi9wl.jpg', alt: 'Speakers on stage' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907457/A_Prueba_de_Chanclazos_Nov_13_2025_Edited_1_j8rmwi.jpg', alt: 'Man listening to speaker' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907456/IMG_8145_14_Edited_s685sy.jpg', alt: 'Man talking to the microphone' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907455/IMG_8122_10_Edited_ifassb.jpg', alt: 'Man answering a question' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776907454/A_Prueba_de_Chanclazos_Nov_13_2025_Edited_yj60ze.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908527/IMG_8860_mvkbk5.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908525/Day_1_Dec_11_2025_1_zrcqfn.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908521/Dia_1_Dec_11_2025_1_pc86tr.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908519/Day_1_Dec_11_2025_tvuzat.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776908515/IMG_8367_fpvmu4.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909192/Day_3_Dec_13_2025_9_s6xxa3.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909194/Day_3_Dec_13_2025_8_umqfxa.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909196/Day_3_Dec_13_2025_7_fxmvj8.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909201/Day_3_Dec_13_2025_6_kjugsd.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909203/Day_3_Dec_13_2025_5_y1ljeh.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909205/IMG_8874_mu0vth.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909207/Day_3_Dec_13_2025_4_wlw5fd.jpg', alt: 'Speakers discussing in the panel' },
      { src: 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776909209/Day_3_Dec_13_2025_2_hjntz0.jpg', alt: 'Speakers discussing in the panel' },
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
