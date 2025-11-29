import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Product } from '../types';

interface OrderModalProps {
  onClose: (shouldRefresh: boolean) => void;
}

interface OrderInput {
  productId: number;
  quantity: string; // Keep as string for input handling
}

interface OrderOutput {
  productId: number;
  quantity: string; // Keep as string for input handling
}

export default function OrderModal({ onClose }: OrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderType, setOrderType] = useState<'purchase' | 'production' | 'fulfillment' | 'r&d' | 'maintenance' | 'sales' | 'shipping'>('production');
  const [inputs, setInputs] = useState<OrderInput[]>([{ productId: 0, quantity: '' }]);
  const [outputs, setOutputs] = useState<OrderOutput[]>([{ productId: 0, quantity: '' }]);
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

    // Validate based on order type
    const needsInputs = orderType === 'production' || orderType === 'fulfillment' ||
                        orderType === 'r&d' || orderType === 'maintenance' ||
                        orderType === 'sales' || orderType === 'shipping';
    const needsOutputs = orderType === 'production' || orderType === 'purchase';

    // Check inputs for production and fulfillment orders
    if (needsInputs) {
      if (inputs.length === 0) {
        newErrors.inputs = 'At least one input item is required';
      }
      inputs.forEach((input, index) => {
        if (!input.productId || input.productId === 0) {
          newErrors[`input_${index}_product`] = 'Please select a product';
        }
        const qty = parseFloat(input.quantity);
        if (!input.quantity || isNaN(qty) || qty <= 0) {
          newErrors[`input_${index}_quantity`] = 'Quantity must be greater than 0';
        }
      });
    }

    // Check outputs for production and purchase orders
    if (needsOutputs) {
      if (outputs.length === 0) {
        newErrors.outputs = 'At least one output item is required';
      }
      outputs.forEach((output, index) => {
        if (!output.productId || output.productId === 0) {
          newErrors[`output_${index}_product`] = 'Please select a product';
        }
        const qty = parseFloat(output.quantity);
        if (!output.quantity || isNaN(qty) || qty <= 0) {
          newErrors[`output_${index}_quantity`] = 'Quantity must be greater than 0';
        }
      });
    }

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

      // Determine which inputs/outputs to send based on order type
      const needsInputs = orderType === 'production' || orderType === 'fulfillment' ||
                          orderType === 'r&d' || orderType === 'maintenance' ||
                          orderType === 'sales' || orderType === 'shipping';
      const needsOutputs = orderType === 'production' || orderType === 'purchase';

      await orderAPI.create({
        orderType: orderType,
        inputs: needsInputs
          ? inputs.filter(i => i.productId !== 0).map(i => ({ ...i, quantity: parseFloat(i.quantity) }))
          : [],
        outputs: needsOutputs
          ? outputs.filter(o => o.productId !== 0).map(o => ({ ...o, quantity: parseFloat(o.quantity) }))
          : [],
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
    setInputs([...inputs, { productId: 0, quantity: '' }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const updateInput = (index: number, field: 'productId' | 'quantity', value: number | string) => {
    const newInputs = [...inputs];
    if (field === 'quantity') {
      newInputs[index][field] = value as string;
    } else {
      newInputs[index][field] = value as number;
    }
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

  const addOutput = () => {
    setOutputs([...outputs, { productId: 0, quantity: '' }]);
  };

  const removeOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const updateOutput = (index: number, field: 'productId' | 'quantity', value: number | string) => {
    const newOutputs = [...outputs];
    if (field === 'quantity') {
      newOutputs[index][field] = value as string;
    } else {
      newOutputs[index][field] = value as number;
    }
    setOutputs(newOutputs);
    // Clear errors for this field
    if (errors[`output_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`output_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const getAvailableOutputProducts = (currentIndex: number) => {
    const selectedIds = outputs
      .map((o, idx) => (idx !== currentIndex ? o.productId : null))
      .filter(id => id !== null && id !== 0);
    return products.filter(p => !selectedIds.includes(p.id));
  };

  // Calculate footage from MSI: feet = MSI / (width × 0.012)
  const calculateFootage = (msi: number, width?: number): number | null => {
    if (!width || width <= 0) return null;
    return msi / (width * 0.012);
  };

  // Format footage display
  const formatFootage = (msi: number, width?: number): string => {
    const feet = calculateFootage(msi, width);
    if (feet === null) return '';
    return ` (${feet.toFixed(2)} ft)`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select order type and specify materials (all quantities in MSI)
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
            <div className="grid grid-cols-4 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="purchase"
                  checked={orderType === 'purchase'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Purchase</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="production"
                  checked={orderType === 'production'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Production</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fulfillment"
                  checked={orderType === 'fulfillment'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Fulfillment</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="r&d"
                  checked={orderType === 'r&d'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">R&D</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="maintenance"
                  checked={orderType === 'maintenance'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Maintenance</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sales"
                  checked={orderType === 'sales'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Sales</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="shipping"
                  checked={orderType === 'shipping'}
                  onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                  className="mr-2"
                />
                <span className="text-sm">Shipping</span>
              </label>
            </div>
          </div>

          {/* Input Items - Show for all except Purchase */}
          {(orderType === 'production' || orderType === 'fulfillment' || orderType === 'r&d' || orderType === 'maintenance' || orderType === 'sales' || orderType === 'shipping') && (
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
                              {product.name} ({product.lot}) - Available: {product.quantity.toFixed(4)} MSI{formatFootage(product.quantity, product.width)}
                            </option>
                          ))}
                        </select>
                        {errors[`input_${index}_product`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`input_${index}_product`]}</p>
                        )}
                      </div>

                      {/* Quantity Input */}
                      <div className="w-40">
                        <input
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          value={input.quantity}
                          onChange={(e) => updateInput(index, 'quantity', e.target.value)}
                          placeholder="MSI"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`input_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {parseFloat(input.quantity) > 0 && input.productId > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            {calculateFootage(parseFloat(input.quantity), products.find(p => p.id === input.productId)?.width)?.toFixed(2)} feet
                          </p>
                        )}
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
          )}

          {/* Output Items - Show for Purchase and Production */}
          {(orderType === 'purchase' || orderType === 'production') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Output Items <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addOutput}
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
                  {outputs.map((output, index) => {
                    const availableProducts = getAvailableOutputProducts(index);
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        {/* Product Select */}
                        <div className="flex-1">
                          <select
                            value={output.productId}
                            onChange={(e) => updateOutput(index, 'productId', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`output_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value={0}>Select a product...</option>
                            {availableProducts.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.lot}) - Current: {product.quantity.toFixed(4)} MSI{formatFootage(product.quantity, product.width)}
                              </option>
                            ))}
                          </select>
                          {errors[`output_${index}_product`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`output_${index}_product`]}</p>
                          )}
                        </div>

                        {/* Quantity Input */}
                        <div className="w-40">
                          <input
                            type="number"
                            min="0.0001"
                            step="0.0001"
                            value={output.quantity}
                            onChange={(e) => updateOutput(index, 'quantity', e.target.value)}
                            placeholder="MSI"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`output_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {parseFloat(output.quantity) > 0 && output.productId > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              {calculateFootage(parseFloat(output.quantity), products.find(p => p.id === output.productId)?.width)?.toFixed(2)} feet
                            </p>
                          )}
                          {errors[`output_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`output_${index}_quantity`]}</p>
                          )}
                        </div>

                        {/* Remove Button */}
                        {outputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOutput(index)}
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
                  {errors.outputs && (
                    <p className="text-sm text-red-600">{errors.outputs}</p>
                  )}
                </div>
              )}
            </div>
          )}

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
