export default function TimelessAbout({ navigate }) {
  return (
    <>
      <header className="page-hero">
        <h1>About</h1>
        <p>The person behind the lens</p>
      </header>

      <main className="about-wrapper">
        <section className="about-profile" aria-label="Profile photo">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop&crop=face"
            alt="Bismarck — portrait photographer"
            width="280"
            height="280"
          />
        </section>

        <section className="about-bio" aria-label="Biography">
          <h2>Hello, I'm Bismarck.</h2>
          <p>
            I'm a photographer based wherever the light is best. My work lives at the intersection
            of documentary instinct and deliberate composition — I'm drawn to the unguarded moment,
            the texture in shadow, the quiet that exists just before a scene changes.
          </p>
          <p>
            Photography, for me, started as a way to slow down. Growing up I moved frequently, and
            the camera became the one constant tool for making sense of new places and faces. That
            restlessness never left; it just turned into a practice. I shoot because I genuinely can't not.
          </p>
          <p>
            My work spans landscapes, portraiture, street, and travel — organized here into sections
            that reflect different cameras, moods, and ways of seeing. The Canon pages are deliberate
            and considered. The Digicam pages are messier, more immediate. The Day2Day section gets
            everything in between.
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
                <span>Independent — portraits, travel, editorial</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2022 – 2024</span>
              <div className="cv-detail">
                <strong>Staff Photographer</strong>
                <span>Local editorial outlet — event and documentary coverage</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2021</span>
              <div className="cv-detail">
                <strong>Photography Workshop</strong>
                <span>Advanced analog printing &amp; darkroom techniques</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2019 – 2023</span>
              <div className="cv-detail">
                <strong>B.A. Visual Arts</strong>
                <span>University — concentration in photography &amp; media</span>
              </div>
            </div>
            <div className="cv-item">
              <span className="cv-year">2018</span>
              <div className="cv-detail">
                <strong>First Camera</strong>
                <span>It all started here.</span>
              </div>
            </div>
          </div>

          <a href="#" className="btn-download" aria-label="Download CV as PDF">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CV
          </a>
        </section>
      </main>
    </>
  )
}
