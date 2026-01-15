import React, { forwardRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

import { ChevronDown, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    rightIcon?: React.ReactNode;
    isRequired?: boolean;
}

const countryPrefixes: Record<string, { prefix: string; code: string; placeholder: string }> = {
    FR: { prefix: '+33', code: 'FR', placeholder: '6 12 34 56 78' },
};

/**
 * Composant pour le dropdown de sélection de pays
 */
interface CountryDropdownProps {
    selectedCountry: string;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (country: string) => void;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
    selectedCountry,
    isOpen,
    onToggle,
    onSelect,
}) => {
    const selectedCountryData = countryPrefixes[selectedCountry];

    return (
        <>
            <div
                className="absolute left-0 top-0 z-10 flex h-full cursor-pointer items-center border-r border-gray-300 pl-4 pr-2 text-sm"
                onClick={onToggle}
            >
                <span className="mr-1 overflow-hidden rounded-md">
                    <ReactCountryFlag
                        countryCode={selectedCountryData?.code || 'FR'}
                        svg
                        style={{
                            width: '1.7em',
                            height: '1.7em',
                        }}
                        title={selectedCountry}
                    />
                </span>
                <span className="text-gray-500">{selectedCountryData?.prefix}</span>
                <ChevronDown
                    className={`ml-1 h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>
            {isOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {Object.entries(countryPrefixes).map(([country, { prefix, code }]) => (
                            <div
                                key={country}
                                className="flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => onSelect(country)}
                            >
                                <span className="mr-2 overflow-hidden rounded-md">
                                    <ReactCountryFlag
                                        countryCode={code}
                                        svg
                                        style={{
                                            width: '1.7em',
                                            height: '1.7em',
                                        }}
                                    />
                                </span>
                                <span>{country}</span>
                                <span className="ml-auto text-gray-500">{prefix}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

/**
 * Composant pour le toggle de visibilité du mot de passe
 */
interface PasswordToggleProps {
    showPassword: boolean;
    onToggle: () => void;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({ showPassword, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
        tabIndex={-1}
    >
        {showPassword ? (
            <EyeOff size={20} className="h-5 w-5" />
        ) : (
            <Eye size={20} className="h-5 w-5" />
        )}
    </button>
);

/**
 * Hook personnalisé pour gérer la logique du composant Input
 */
const useInputLogic = (type: string) => {
    const [selectedCountry, setSelectedCountry] = useState('FR');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const showPhonePrefix = type === 'tel';
    const isPasswordField = type === 'password';

    const handleCountrySelect = (country: string) => {
        setSelectedCountry(country);
        setIsCountryDropdownOpen(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleCountryDropdown = () => {
        setIsCountryDropdownOpen(!isCountryDropdownOpen);
    };

    return {
        selectedCountry,
        isCountryDropdownOpen,
        showPassword,
        showPhonePrefix,
        isPasswordField,
        handleCountrySelect,
        togglePasswordVisibility,
        toggleCountryDropdown,
    };
};

/**
 * Fonction utilitaire pour générer le placeholder
 */
const getPlaceholder = (
    showPhonePrefix: boolean,
    selectedCountry: string,
    userProvidedPlaceholder?: string
): string => {
    if (showPhonePrefix) {
        return countryPrefixes[selectedCountry]?.placeholder || '';
    }
    return userProvidedPlaceholder || '';
};

/**
 * Fonction utilitaire pour générer les classes CSS de l'input
 */
const getInputClasses = (
    error?: string,
    rightIcon?: React.ReactNode,
    isPasswordField?: boolean,
    showPhonePrefix?: boolean,
    className?: string
): string => {
    const baseClasses =
        'focus:border-primary relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:outline-none sm:text-sm';
    const errorClasses = error ? 'border-red-500' : '';
    const rightPaddingClasses = rightIcon || isPasswordField ? 'pr-10' : '';
    const leftPaddingClasses = showPhonePrefix ? 'pl-[6.75rem]' : '';

    return `${baseClasses} ${errorClasses} ${rightPaddingClasses} ${leftPaddingClasses} ${className || ''}`.trim();
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            name,
            type = 'text',
            error,
            rightIcon,
            className = '',
            placeholder: userProvidedPlaceholder,
            isRequired = false,
            ...props
        },
        ref
    ) => {
        const {
            selectedCountry,
            isCountryDropdownOpen,
            showPassword,
            showPhonePrefix,
            isPasswordField,
            handleCountrySelect,
            togglePasswordVisibility,
            toggleCountryDropdown,
        } = useInputLogic(type);

        const placeholder = getPlaceholder(
            showPhonePrefix,
            selectedCountry,
            userProvidedPlaceholder
        );
        const inputClasses = getInputClasses(
            error,
            rightIcon,
            isPasswordField,
            showPhonePrefix,
            className
        );
        const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="relative">
                {label && (
                    <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
                        {label} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    {showPhonePrefix && (
                        <CountryDropdown
                            selectedCountry={selectedCountry}
                            isOpen={isCountryDropdownOpen}
                            onToggle={toggleCountryDropdown}
                            onSelect={handleCountrySelect}
                        />
                    )}
                    <input
                        id={name}
                        name={name}
                        type={inputType}
                        ref={ref}
                        placeholder={placeholder}
                        className={inputClasses}
                        {...props}
                    />
                    {isPasswordField && (
                        <PasswordToggle
                            showPassword={showPassword}
                            onToggle={togglePasswordVisibility}
                        />
                    )}
                    {rightIcon && !isPasswordField && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
