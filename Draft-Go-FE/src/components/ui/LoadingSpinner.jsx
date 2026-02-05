import PropTypes from "prop-types";

const LoadingSpinner = ({
    size = "medium",
    color = "primary",
    centered = false,
    className = ""
}) => {
    const sizeClasses = {
        small: "w-4 h-4 border-2",
        medium: "w-8 h-8 border-3",
        large: "w-12 h-12 border-4"
    };

    const colorClasses = {
        primary: "border-gray-700 border-t-[var(--color-primary)]",
        white: "border-gray-300 border-t-white",
        gold: "border-gray-700 border-t-[#c8aa6e]"
    };

    const spinnerElement = (
        <div
            className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        rounded-full 
        animate-spin
        ${className}
      `}
            role="status"
            aria-label="로딩 중"
        />
    );

    if (centered) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(["small", "medium", "large"]),
    color: PropTypes.oneOf(["primary", "white", "gold"]),
    centered: PropTypes.bool,
    className: PropTypes.string
};

export default LoadingSpinner;
