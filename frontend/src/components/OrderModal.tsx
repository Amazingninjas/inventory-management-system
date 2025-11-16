import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Product } from '../types';

interface OrderModalProps {
  onClose: (shouldRefresh: boolean) => void;
}

interface OrderInput {
  productId: number;
  quantity: number;
}

export default function OrderModal({ onClose }: OrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderType, setOrderType] = useState<'production' | 'fulfillment'>('production');
  const [inputs, setInputs] = useState<OrderInput[]>([{ productId: 0, quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Check if at least one input is provided
    if (inputs.length === 0) {
      newErrors.inputs = 'At least one input item is required';
    }

    // Validate each input
    inputs.forEach((input, index) => {
      if (!input.productId || input.productId === 0) {
        newErrors[`input_${index}_product`] = 'Please select a product';
      }
      if (!input.quantity || input.quantity <= 0) {
        newErrors[`input_${index}_quantity`] = 'Quantity must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await orderAPI.create({
        type: orderType,
        inputs: inputs.filter(i => i.productId !== 0),
        notes: notes || undefined,
      });

      onClose(true); // Close and refresh
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const addInput = () => {
    setInputs([...inputs, { productId: 0, quantity: 1 }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const updateInput = (index: number, field: 'productId' | 'quantity', value: number) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
    // Clear errors for this field
    if (errors[`input_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`input_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const getAvailableProducts = (currentIndex: number) => {
    const selectedIds = inputs
      .map((i, idx) => (idx !== currentIndex ? i.productId : null))
      .filter(id => id !== null && id !== 0);
    return products.filter(p => !selectedIds.includes(p.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select products to consume from inventory (inputs only for now)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Order Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="production"
                  checked={orderType === 'production'}
                  onChange={(e) => setOrderType(e.target.value as 'production')}
                  className="mr-2"
                />
                <span className="text-sm">Production</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fulfillment"
                  checked={orderType === 'fulfillment'}
                  onChange={(e) => setOrderType(e.target.value as 'fulfillment')}
                  className="mr-2"
                />
                <span className="text-sm">Fulfillment</span>
              </label>
            </div>
          </div>

          {/* Input Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Input Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addInput}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={loadingProducts}
              >
                + Add Item
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-4 text-gray-500">Loading products...</div>
            ) : (
              <div className="space-y-3">
                {inputs.map((input, index) => {
                  const availableProducts = getAvailableProducts(index);
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      {/* Product Select */}
                      <div className="flex-1">
                        <select
                          value={input.productId}
                          onChange={(e) => updateInput(index, 'productId', parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`input_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value={0}>Select a product...</option>
                          {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.lot}) - Available: {product.quantity}
                            </option>
                          ))}
                        </select>
                        {errors[`input_${index}_product`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`input_${index}_product`]}</p>
                        )}
                      </div>

                      {/* Quantity Input */}
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          value={input.quantity}
                          onChange={(e) => updateInput(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="Qty"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`input_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`input_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`input_${index}_quantity`]}</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      {inputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInput(index)}
                          className="p-2 text-red-600 hover:text-red-900"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
                {errors.inputs && (
                  <p className="text-sm text-red-600">{errors.inputs}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional order notes..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || loadingProducts}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
