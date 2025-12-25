import Panel from "@shared/components/Panel";
import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";

const CategoryDetailsPanel = ({
  id,
  path,
  product_count,
  active,
  description,
}) => {
  return (
    <Panel className="p-4 rounded-md">
      <VBox className="flex-1 w-full">
        <span className="text-3xl font-semibold text-primary">Category</span>
        <hr className="h-1 bg-primary border-none" />
        <VBox className="flex-1 w-full">
          <HBox>
            <span className="text-lg font-semibold w-40">ID</span>
            <span className="text-lg flex-1">{id}</span>
          </HBox>
          <HBox>
            <span className="text-lg font-semibold w-40">Category Path</span>
            <span className="text-lg flex-1">{path}</span>
          </HBox>
          <HBox>
            <span className="text-lg font-semibold w-40">Product Count</span>
            <span className="text-lg flex-1">{product_count}</span>
          </HBox>
          <HBox>
            <span className="text-lg font-semibold w-40">Active</span>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={active}
              onChange={() => onSelect(item.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </HBox>
          <HBox>
            <span className="text-lg font-semibold w-40">Description</span>
            <span className="text-lg flex-1">{description}</span>
          </HBox>
        </VBox>
      </VBox>
    </Panel>
  );
};

export default CategoryDetailsPanel;
