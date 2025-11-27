import Sidebar from '../Sidebar.jsx';
import ProductReview from './ProductReview.jsx';

function Review() {
  return (
    <section id="profile" class="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]">
      <div class="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <Sidebar />
        <ProductReview />
      </div>
    </section>
  )
}

export default Review;
