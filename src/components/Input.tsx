import React from "react";

const Input: React.FC<React.HTMLProps<HTMLInputElement>> = (props) => {
    return (
        <input
            type="text"
            className="w-full bg-gray-100 p-2 rounded-lg border-2 border-indigo-500 shadow-md focus:outline-none focus:border-indigo-600"
            
            {...props}
        />
    );
};

export default Input;
