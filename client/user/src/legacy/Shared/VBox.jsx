const VBox = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-4 ${className}`}>
    {children}
  </div>
);

export default VBox;