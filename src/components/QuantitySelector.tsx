import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Package } from "lucide-react";

interface QuantitySelectorProps {
  availableQuantity: number;
  onQuantitySelect: (quantity: number) => void;
  label?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  disabled?: boolean;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  availableQuantity,
  onQuantitySelect,
  label = "Select Quantity",
  placeholder = "Enter quantity",
  showSuggestions = true,
  disabled = false,
  className = "",
}) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  // Suggested quantities (25%, 50%, 75%, 100%)
  const suggestions = [
    { label: "25%", value: Math.floor(availableQuantity * 0.25) },
    { label: "50%", value: Math.floor(availableQuantity * 0.5) },
    { label: "75%", value: Math.floor(availableQuantity * 0.75) },
    { label: "100%", value: availableQuantity },
  ].filter((s) => s.value > 0);

  useEffect(() => {
    validateQuantity(quantity);
  }, [quantity, availableQuantity]);

  const validateQuantity = (value: number) => {
    if (!touched) return;

    if (value <= 0) {
      setError("Quantity must be greater than 0");
      return false;
    }

    if (value > availableQuantity) {
      setError(`Cannot exceed available quantity (${availableQuantity})`);
      return false;
    }

    setError("");
    return true;
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantity(numValue);
    setTouched(true);

    if (validateQuantity(numValue)) {
      onQuantitySelect(numValue);
    } else {
      onQuantitySelect(0);
    }
  };

  const handleSuggestionClick = (value: number) => {
    setQuantity(value);
    setTouched(true);
    setError("");
    onQuantitySelect(value);
  };

  const isValid = quantity > 0 && quantity <= availableQuantity;
  const remainingAfterSelection = availableQuantity - quantity;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Available Quantity */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Package className="inline h-4 w-4 mr-1" />
          {label}
        </label>
        <span className="text-sm font-semibold text-blue-600">
          Available: {availableQuantity}
        </span>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="number"
          value={quantity || ""}
          onChange={(e) => handleQuantityChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled || availableQuantity === 0}
          min="1"
          max={availableQuantity}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
            error && touched
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : isValid && touched
              ? "border-green-300 focus:ring-green-500 focus:border-green-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } ${disabled || availableQuantity === 0 ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && touched && (
        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {isValid && touched && !error && (
        <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Valid quantity selected</span>
          </div>
          <span className="font-semibold text-green-600">
            Remaining: {remainingAfterSelection}
          </span>
        </div>
      )}

      {/* Quick Suggestions */}
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Quick Select:</p>
          <div className="grid grid-cols-4 gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.value)}
                disabled={disabled}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  quantity === suggestion.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div>{suggestion.label}</div>
                <div className="text-xs">{suggestion.value}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Quantity Available */}
      {availableQuantity === 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>No quantity available for allocation</span>
        </div>
      )}

      {/* Summary */}
      {quantity > 0 && isValid && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-gray-600">Selected</div>
              <div className="text-lg font-bold text-blue-600">{quantity}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Available</div>
              <div className="text-lg font-bold text-gray-700">
                {availableQuantity}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Remaining</div>
              <div className="text-lg font-bold text-orange-600">
                {remainingAfterSelection}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantitySelector;

