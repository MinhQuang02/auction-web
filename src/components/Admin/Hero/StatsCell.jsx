import Panel from "components/Shared/Panel";
import HBox from "components/Shared/HBox";
import ArrowIcon from "assets/images/_arrowIcon.svg";

const StatsCell = ({ number=1306, label="items", className="" }) => {
    return (
      <Panel className={`p-4 flex-1 justify-center ${className}`}>
        {/* HBox */}
        <HBox className="justify-center">
          <span className="text-4xl font-bold">{number}</span>
          <img src={ArrowIcon} alt="trend" className="w-6 h-6" />
        </HBox>
        {/* Label */} 
        <div className="mt-2 text-center text-black">{label}</div>
      </Panel>
    )
}

export default StatsCell;