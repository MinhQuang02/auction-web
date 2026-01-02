const VBox = ({ children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>{children}</div>
);

export default VBox;
