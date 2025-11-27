import Sidebar from '../Sidebar';
import Overview from './Overview';
import OngoingAuctions from './OngoingAuctions';
import ClosingSoon from './ClosingSoon';
import HottestAuctions from './HottestAuctions';
import CompetitiveAuctions from './CompetitiveAuctions';
import Categories from './Categories';
import Services from './Services';

function HomePage() {
  return (
    <>
      <section id="hero" className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10">
        <Sidebar />
        <Overview />
      </section>
      <OngoingAuctions />
      <ClosingSoon />
      <HottestAuctions />
      <CompetitiveAuctions />
      <Categories />
      <Services />
    </>
  )
}

export default HomePage;
