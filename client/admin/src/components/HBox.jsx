const HBox = ({ children, className = "" }) => (
  <div className={`flex flex-row gap-4 ${className}`}>
    {children}
  </div>
);

export default HBox;