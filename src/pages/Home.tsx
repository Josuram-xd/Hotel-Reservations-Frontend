import AmenitiesAccordion from '../components/landing/AmenitiesAccordion'
import FinalCta from '../components/landing/FinalCta'
import Hero from '../components/landing/Hero'
import RoomsBento from '../components/landing/RoomsBento'
import StoryReveal from '../components/landing/StoryReveal'

export default function Home() {
  return (
    <>
      <Hero />
      <RoomsBento />
      <AmenitiesAccordion />
      <StoryReveal />
      <FinalCta />
    </>
  )
}
