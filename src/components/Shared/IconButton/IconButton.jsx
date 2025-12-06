import Panel from "../Panel";

const IconButton = ({ icon, alt, onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`min-w-14 min-h-14 flex items-center justify-center bg-lightGray rounded-lg shadow-lg ${className}`}
        >
            <div>
                <img src={icon} alt={alt} />
            </div>
        </button>
    )
}

export default IconButton;