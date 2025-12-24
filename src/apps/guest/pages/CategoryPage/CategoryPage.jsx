import Sidebar from "../../components/Sidebar";
import ProductGrid from "./ProductGrid";

function CategoryPage() {
  return (
    <>
      <section
        id="hero"
        className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10"
      >
        <Sidebar />
        <ProductGrid />
      </section>
      <div>
        <br />
        <br />
      </div>
    </>
  );
}

export default CategoryPage;
