import { Audience } from './components/Audience.tsx'
import { BeforeAfter } from './components/BeforeAfter.tsx'
import { Footer } from './components/Footer.tsx'
import { Hero } from './components/Hero.tsx'
import { HowItWorks } from './components/HowItWorks.tsx'
import { Nav } from './components/Nav.tsx'
import { Quiz } from './components/Quiz.tsx'
import { TryAttack } from './components/TryAttack.tsx'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TryAttack />
        <BeforeAfter />
        <HowItWorks />
        <Quiz />
        <Audience />
      </main>
      <Footer />
    </>
  )
}
