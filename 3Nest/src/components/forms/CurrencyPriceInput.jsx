import React from 'react';
import { Controller } from 'react-hook-form';

const CurrencyPriceInput = ({
  priceType, 


  control,
  errors,
  index,
  field,

  // Props cho logic tiền tệ
  isVndDisplay,
  usdToVndRate,
  formatCurrency,

  // Props cho validation - tên chung chung để linh động
  upperLimitUSD,
  lowerLimitUSD,
}) => {
  const isChannel = priceType === 'channel';
    console.log('isChannel', isChannel)
  const fieldName = isChannel 
    ? `details.${index}.channel_cost` 
    : `details.${index}.price_for_customer`;

  const labelText = isChannel 
    ? 'Channel Cost' 
    : 'Price (Customer)';

  const defaultValue = isChannel 
    ? field.channel_cost 
    : field.price_for_customer;

  const errorObject = errors.details?.[index]?.[isChannel ? 'channel_cost' : 'price_for_customer'];

  const displayCurrencySymbol = isVndDisplay ? 'VND' : 'USD';

  // Hàm validation sử dụng giới hạn được truyền vào
  const validatePriceRange = (value_in_usd) => {
    const numericValue = parseFloat(value_in_usd);
    if (isNaN(numericValue)) return 'Invalid price value';

    if (numericValue > upperLimitUSD) {
      return `Price cannot exceed ${formatCurrency(upperLimitUSD, false, usdToVndRate)}`;
    }
    if (numericValue < lowerLimitUSD) {
      return `Price must be at least ${formatCurrency(lowerLimitUSD, false, usdToVndRate)}`;
    }
    return true;
  };

  return (
    <div>
      <label className="block text-sm font-medium">{labelText} ({displayCurrencySymbol})</label>
      <Controller
        name={fieldName} // <-- Tên trường động
        control={control}
        defaultValue={defaultValue} // <-- Giá trị mặc định động
        rules={{
          required: 'Price is required',
          min: { value: 0, message: 'Price cannot be negative' },
          validate: { range: validatePriceRange },
        }}
        render={({ field: { onChange, value, ...restField } }) => {
          const displayValue = isVndDisplay ? (value * usdToVndRate) : value;
          return (
            <input
              {...restField}
              type="number"
              step="any"
              className={`border rounded px-2 py-1 w-full ${errorObject ? 'border-red-500' : 'border-gray-300'}`}
              value={Number(displayValue || 0).toFixed(isVndDisplay ? 0 : 2)}
              onChange={(e) => {
                const enteredValue = parseFloat(e.target.value) || 0;
                const valueInUsd = isVndDisplay ? enteredValue / usdToVndRate : enteredValue;
                onChange(valueInUsd);
              }}
            />
          );
        }}
      />
      {errorObject && (
        <p className="text-red-600 text-sm mt-1">{errorObject.message}</p>
      )}
    </div>
  );
};

export default CurrencyPriceInput;