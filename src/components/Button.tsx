interface ButtonProps {
    disabled?: boolean;

}

const Button: React.FC<{
    classes?: string;
    onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
    moreProps?: ButtonProps;
    children: React.ReactNode;
}> = ({ children, classes = "", onClick, moreProps }) => {
    return (
        <button
            onClick={onClick}
            className={`${classes} 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 
            hover:bg-gray-200 hover:border-indigo-600 hover:outline-none 
            p-2 rounded-lg border-2 border-indigo-500 shadow-md bg-gray-100  `}
            {...moreProps}
            style={{ minWidth: "7rem" }}
        >
            {children}
        </button>
    );
};
export default Button;
