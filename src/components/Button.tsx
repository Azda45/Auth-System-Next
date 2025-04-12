import React from 'react';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    type = 'button',
    label,
    onClick,
    disabled = false,
}) => {
    return (
        <button
            className='w-full py-2 px-4 bg-blue-600 text-white rounded-lg border border-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
            type={type}
            onClick={onClick}
            disabled={disabled}>
            {label}
        </button>
    );
};

export default Button;
