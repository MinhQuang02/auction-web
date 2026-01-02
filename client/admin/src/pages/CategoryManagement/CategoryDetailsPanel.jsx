import Panel from "@components/Panel";
import VBox from "@components/VBox";
import HBox from "@components/HBox";

const CategoryDetailsPanel = ({ category }) => {
  if (!category) return null;

  const { id, label, path, product_count } = category;

  return (
    <Panel className="p-4 rounded-md">
      <VBox className="flex-1 w-full gap-4">
        <span className="text-3xl font-semibold text-primary">{label}</span>

        <hr className="h-1 bg-primary border-none" />

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
      </VBox>
    </Panel>
  );
};

export default CategoryDetailsPanel;
