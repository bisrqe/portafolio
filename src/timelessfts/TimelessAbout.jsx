export default function TimelessAbout({ navigate }) {
  return (
    <>
      <header className="page-hero">
        <h1>About</h1>
      </header>

      <main className="about-wrapper">
        <section className="about-profile" aria-label="Profile photo">
          <img
            src="https://res.cloudinary.com/dobiuvljw/image/upload/v1776904888/personal_portrait_bc2p1y_7e0f4f.jpg"
            alt="Bismarck — portrait photographer"
            width="280"
            height="280"
          />
        </section>

        <section className="about-bio" aria-label="Biography">
          <h2>Hi!, I'm Bis.</h2>
          <p>
            I'm a photographer drawn to the intersection of curiosity and intentional observation.
            My work stems from a desire to express ideas and emotions through forms, colors, and 
            compositions—to immortalize moments and discover new ways of representing what I observe 
            and what others feel. I call this practice timeless photography.
          </p>
          <p>
            I'm based wherever the light is best. My artistic approach balances documentary instinct 
            with deliberate composition: I'm captured by the unguarded moment, the texture in shadow,
            the quiet that exists just before a scene changes. Photography, for me, is both a way to
            slow down and a practice I genuinely can't not pursue. Growing up moving frequently across
            Monterrey and beyond, the camera became my one constant tool for making sense of new places
            and faces—that restlessness never left, it just evolved into a systematic practice.
          </p>
          <p>
            I experiment with different techniques and visual approaches, working across landscapes, 
            portraiture, street, and travel photography. My work reflects varying cameras, moods, and 
            ways of seeing: deliberate and considered compositions alongside more immediate, intuitive
            captures. Each piece seeks to communicate something true about a moment—whether through 
            careful planning or spontaneous observation. Photography, at its core, is how I process the
            world and connect with the people and places in it.
          </p>
          <p>
            If you'd like to work together, commission a shoot, or just talk cameras:{' '}
            <a href="/timelessfts/contact" onClick={e => { e.preventDefault(); navigate('/timelessfts/contact') }}>
              reach out
            </a>.
          </p>
        </section>

        <section className="about-cv" aria-label="Experience and education">
          <h2>Experience &amp; Education</h2>

          <div className="cv-timeline">
            <div className="cv-item">
              <span className="cv-year">2024 – now</span>
              <div className="cv-detail">
                <strong>Freelance Photographer</strong>
                <span>Independent - portraits, travel, editorial</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2024</span>
              <div className="cv-detail">
                <strong>Photography Workshop</strong>
                <span>Basic features &amp; composition techniques</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2023</span>
              <div className="cv-detail">
                <strong>First Camera</strong>
                <span>It all started here.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
