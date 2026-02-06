// import PropTypes from "prop-types";
import LoadingSpinner from "./LoadingSpinner";

const PageLoader = ({ message = "로딩 중..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm">
            <LoadingSpinner size="large" color="gold" />
            {message && (
                <p className="mt-4 text-lg font-medium text-gray-300 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

// PageLoader.propTypes removed to fix build error (missing package)

export default PageLoader;
