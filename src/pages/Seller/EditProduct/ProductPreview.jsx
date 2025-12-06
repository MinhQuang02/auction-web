import Panel from "components/Shared/Panel";
import VBox from "components/Shared/VBox";
import HBox from "components/Shared/HBox";

const ProductPreview = ({ product, className="" }) => (
  <Panel className={`flex-2 ${className}`}>
    <VBox>
      <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
      <div className="flex justify-between p-4 items-center">
        <HBox className="flex-1">
          <VBox className="flex-1">
            <span className="font-semibold">{product.name}</span>
            <span className="text-sm font-semibold text-gray-500">{product.status}</span>
          </VBox>
          <div className="flex-1"/>
          <VBox className="flex-1 items-end">
            <div className="px-2 rounded font-semibold bg-primary/30">{product.price}</div>
            <div className="text-sm text-gray-500 font-semibold">{product.seller}</div>
          </VBox>
        </HBox>
      </div>
    </VBox>
  </Panel>
);

export default ProductPreview;