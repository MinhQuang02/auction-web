const Panel = ({ children, className = "" }) => {
  return (
    <div className={`bg-lightGray rounded-2xl shadow-lg flex flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default Panel;