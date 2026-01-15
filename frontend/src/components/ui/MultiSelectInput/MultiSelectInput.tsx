import { useCallback, useEffect, useRef, useState } from 'react';

import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface MultiSelectInputProps {
    label?: string;
    options: Option[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    error?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    debounceTime?: number;
    onSearch?: (searchTerm: string) => void;
}

/**
 * Hook personnalisé pour gérer la logique de recherche avec debounce
 */
const useSearchLogic = (debounceTime: number, onSearch?: (searchTerm: string) => void) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (onSearch) {
                onSearch(searchTerm);
            }
        }, debounceTime);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, debounceTime, onSearch]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const resetSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return {
        searchTerm,
        debouncedSearchTerm,
        handleSearchChange,
        resetSearch,
    };
};

/**
 * Hook personnalisé pour gérer l'ouverture/fermeture du dropdown
 */
const useDropdownLogic = (disabled: boolean) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Gérer le clic à l'extérieur pour fermer le menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleDropdown = useCallback(() => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    }, [disabled, isOpen]);

    return {
        isOpen,
        setIsOpen,
        containerRef,
        handleToggleDropdown,
    };
};

/**
 * Hook personnalisé pour gérer les options sélectionnées
 */
const useSelectionLogic = (
    value: (string | number)[],
    onChange: (value: (string | number)[]) => void,
    options: Option[]
) => {
    const toggleOption = useCallback(
        (optionValue: string | number) => {
            if (!value) return onChange([optionValue]);

            const newValue = value.includes(optionValue)
                ? value.filter((val) => val !== optionValue)
                : [...value, optionValue];
            onChange(newValue);
        },
        [value, onChange]
    );

    const removeOption = useCallback(
        (optionValue: string | number, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!value) return;
            onChange(value.filter((val) => val !== optionValue));
        },
        [value, onChange]
    );

    const clearAll = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange([]);
        },
        [onChange]
    );

    const selectedLabels =
        value?.map((val) => {
            const option = options?.find((opt) => opt && opt.value === val);
            return {
                value: val,
                label: option ? option.label : val.toString(),
            };
        }) || [];

    return {
        toggleOption,
        removeOption,
        clearAll,
        selectedLabels,
    };
};

/**
 * Composant pour afficher les options sélectionnées
 */
interface SelectedOptionsProps {
    selectedLabels: Array<{ value: string | number; label: string }>;
    onRemove: (value: string | number, e: React.MouseEvent) => void;
    placeholder: string;
}

const SelectedOptions: React.FC<SelectedOptionsProps> = ({
    selectedLabels,
    onRemove,
    placeholder,
}) => {
    if (selectedLabels.length === 0) {
        return <span className="text-gray-400">{placeholder}</span>;
    }

    return (
        <>
            {selectedLabels.map(({ value, label }) => (
                <div
                    key={`selected-${value}`}
                    className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800 transition-colors hover:bg-blue-200"
                >
                    <span className="max-w-[120px] truncate" title={label}>
                        {label}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => onRemove(value, e)}
                        className="rounded-full p-0.5 transition-colors hover:bg-blue-300"
                        aria-label={`Supprimer ${label}`}
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </>
    );
};

/**
 * Composant pour la barre de recherche
 */
interface SearchBarProps {
    searchTerm: string;
    debouncedSearchTerm: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchTerm,
    debouncedSearchTerm,
    onChange,
    onClear,
}) => (
    <div className="border-b border-gray-100 p-2">
        <div className="relative">
            <input
                type="text"
                placeholder="Rechercher..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={onChange}
                onClick={(e) => e.stopPropagation()}
                autoFocus
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                    <X size={14} className="text-gray-400" />
                </button>
            )}
            {searchTerm && searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
            )}
        </div>
    </div>
);

/**
 * Composant pour la liste des options
 */
interface OptionsListProps {
    options: Option[];
    selectedValues: (string | number)[];
    onToggle: (value: string | number) => void;
    searchTerm: string;
}

const OptionsList: React.FC<OptionsListProps> = ({
    options,
    selectedValues,
    onToggle,
    searchTerm,
}) => {
    if (!options || options.length === 0) {
        return (
            <li className="px-3 py-2 text-center text-sm text-gray-500">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune option disponible'}
            </li>
        );
    }

    return (
        <>
            {options.map((option) => (
                <li
                    key={`option-${option.value}`}
                    className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-100 ${
                        selectedValues?.includes(option.value) ? 'bg-blue-50 text-blue-900' : ''
                    }`}
                    onClick={() => onToggle(option.value)}
                >
                    <span className="flex-1 truncate" title={option.label}>
                        {option.label}
                    </span>
                    {selectedValues?.includes(option.value) && (
                        <Check size={16} className="ml-2 flex-shrink-0 text-blue-600" />
                    )}
                </li>
            ))}
        </>
    );
};

/**
 * Fonction utilitaire pour filtrer les options
 */
const filterOptions = (options: Option[], searchTerm: string): Option[] => {
    return options.filter((option) =>
        option && option.label
            ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
            : false
    );
};

/**
 * Fonction utilitaire pour générer les classes CSS du container
 */
const getContainerClasses = (error?: string, disabled?: boolean): string => {
    const baseClasses =
        'flex min-h-[38px] cursor-pointer items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 hover:border-gray-400';
    const errorClasses = error ? 'border-red-500' : 'border-gray-300';
    const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';

    return `${baseClasses} ${errorClasses} ${disabledClasses}`.trim();
};

export const MultiSelectInput = ({
    label,
    options = [],
    value = [],
    onChange,
    error,
    placeholder = 'Sélectionner...',
    className = '',
    disabled = false,
    debounceTime = 300,
    onSearch,
}: MultiSelectInputProps) => {
    const { searchTerm, debouncedSearchTerm, handleSearchChange, resetSearch } = useSearchLogic(
        debounceTime,
        onSearch
    );

    const { isOpen, containerRef, handleToggleDropdown } = useDropdownLogic(disabled);

    const { toggleOption, removeOption, clearAll, selectedLabels } = useSelectionLogic(
        value,
        onChange,
        options
    );

    const filteredOptions = filterOptions(options, debouncedSearchTerm);
    const containerClasses = getContainerClasses(error, disabled);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            )}
            <div className={containerClasses} onClick={handleToggleDropdown}>
                <div className="flex flex-1 flex-wrap gap-1">
                    <SelectedOptions
                        selectedLabels={selectedLabels}
                        onRemove={removeOption}
                        placeholder={placeholder}
                    />
                </div>
                <ChevronsUpDown
                    size={16}
                    className={`ml-2 flex-shrink-0 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen && !disabled && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
                    <SearchBar
                        searchTerm={searchTerm}
                        debouncedSearchTerm={debouncedSearchTerm}
                        onChange={handleSearchChange}
                        onClear={resetSearch}
                    />
                    <ul className="max-h-60 overflow-y-auto py-1">
                        <OptionsList
                            options={filteredOptions}
                            selectedValues={value}
                            onToggle={toggleOption}
                            searchTerm={searchTerm}
                        />
                    </ul>
                    {value && value.length > 0 && (
                        <div className="border-t border-gray-100 p-2">
                            <button
                                type="button"
                                onClick={clearAll}
                                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                Tout désélectionner ({value.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
