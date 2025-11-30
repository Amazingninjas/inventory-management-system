import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api';
import { Order } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function ProductionDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductionOrders: 0,
    completedProductionOrders: 0,
    totalOutputMSI: 0,
    totalProductionCost: 0,
    avgCostPerMSI: 0,
    rdOrdersCount: 0,
    rdTotalCost: 0,
  });

  useEffect(() => {
    fetchProductionData();
  }, []);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const ordersRes = await orderAPI.getAll();
      const ordersData = ordersRes.data;

      setOrders(ordersData);

      // Calculate production statistics
      const productionOrders = ordersData.filter((o) => o.orderType === 'production');
      const completedProduction = productionOrders.filter((o) => o.status === 'completed');

      const totalOutputMSI = completedProduction.reduce((sum, o) => {
        return sum + o.outputs.reduce((oSum, output) => oSum + output.quantity, 0);
      }, 0);

      const totalProductionCost = completedProduction.reduce(
        (sum, o) => sum + (o.costs?.totalCost || 0),
        0
      );

      const avgCostPerMSI = totalOutputMSI > 0 ? totalProductionCost / totalOutputMSI : 0;

      // R&D statistics
      const rdOrders = ordersData.filter((o) => o.orderType === 'r&d' && o.status === 'completed');
      const rdTotalCost = rdOrders.reduce((sum, o) => sum + (o.costs?.totalCost || 0), 0);

      setStats({
        totalProductionOrders: productionOrders.length,
        completedProductionOrders: completedProduction.length,
        totalOutputMSI,
        totalProductionCost,
        avgCostPerMSI,
        rdOrdersCount: rdOrders.length,
        rdTotalCost,
      });
    } catch (error) {
      console.error('Failed to fetch production data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Production Output Over Time
  const getProductionOutputData = () => {
    return orders
      .filter((o) => o.orderType === 'production' && o.status === 'completed')
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map((o) => {
        const totalOutput = o.outputs.reduce((sum, item) => sum + item.quantity, 0);
        return {
          order: o.orderNumber,
          output: totalOutput,
          cost: o.costs?.totalCost || 0,
          costPerUnit: o.costs?.costPerUnit || 0,
          date: new Date(o.completedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      });
  };

  // Production by Stage (4 stages)
  const getProductionByStageData = () => {
    const stages = [
      { name: 'Stage 1: Coating', pattern: /Coated Film \d+-/ },
      { name: 'Stage 2: Adhesive', pattern: /w\/ Adhesive/ },
      { name: 'Stage 3: Liner', pattern: /Master Roll/ },
      { name: 'Stage 4: Cutting', pattern: /^(581-215|582-22)$/ },
    ];

    return stages.map((stage) => {
      const stageOrders = orders.filter((o) => {
        if (o.orderType !== 'production' || o.status !== 'completed') return false;
        return o.outputs.some((output) => stage.pattern.test(output.productName));
      });

      const totalOutput = stageOrders.reduce((sum, o) => {
        return sum + o.outputs.reduce((oSum, output) => oSum + output.quantity, 0);
      }, 0);

      const totalCost = stageOrders.reduce((sum, o) => sum + (o.costs?.totalCost || 0), 0);
      const materialCost = stageOrders.reduce((sum, o) => sum + (o.costs?.materialCost || 0), 0);
      const laborCost = stageOrders.reduce((sum, o) => sum + (o.costs?.laborCost || 0), 0);

      return {
        name: stage.name,
        orders: stageOrders.length,
        output: totalOutput,
        totalCost,
        materialCost,
        laborCost,
        avgCost: totalOutput > 0 ? totalCost / totalOutput : 0,
      };
    }).filter((s) => s.orders > 0);
  };

  // Production vs R&D Cost Comparison
  const getProductionVsRDData = () => {
    const productionOrders = orders.filter(
      (o) => o.orderType === 'production' && o.status === 'completed'
    );
    const rdOrders = orders.filter(
      (o) => o.orderType === 'r&d' && o.status === 'completed'
    );

    const productionMaterial = productionOrders.reduce((sum, o) => sum + (o.costs?.materialCost || 0), 0);
    const productionLabor = productionOrders.reduce((sum, o) => sum + (o.costs?.laborCost || 0), 0);
    const rdMaterial = rdOrders.reduce((sum, o) => sum + (o.costs?.materialCost || 0), 0);
    const rdLabor = rdOrders.reduce((sum, o) => sum + (o.costs?.laborCost || 0), 0);

    return [
      {
        name: 'Production',
        material: productionMaterial,
        labor: productionLabor,
        total: productionMaterial + productionLabor,
      },
      {
        name: 'R&D',
        material: rdMaterial,
        labor: rdLabor,
        total: rdMaterial + rdLabor,
      },
    ];
  };

  // Production by Product Line
  const getProductionByProductLine = () => {
    const productLines = [
      { name: '581-215', pattern: /581-215/ },
      { name: '582-22', pattern: /582-22/ },
    ];

    return productLines.map((line) => {
      const lineOrders = orders.filter((o) => {
        if (o.orderType !== 'production' || o.status !== 'completed') return false;
        return o.outputs.some((output) => line.pattern.test(output.productName));
      });

      const totalOutput = lineOrders.reduce((sum, o) => {
        return sum + o.outputs.reduce((oSum, output) => {
          if (line.pattern.test(output.productName)) return oSum + output.quantity;
          return oSum;
        }, 0);
      }, 0);

      const totalCost = lineOrders.reduce((sum, o) => sum + (o.costs?.totalCost || 0), 0);

      return {
        name: line.name,
        output: totalOutput,
        cost: totalCost,
        costPerUnit: totalOutput > 0 ? totalCost / totalOutput : 0,
        orders: lineOrders.length,
      };
    }).filter((l) => l.orders > 0);
  };

  // Cost Efficiency Trend
  const getCostEfficiencyData = () => {
    return orders
      .filter((o) => o.orderType === 'production' && o.status === 'completed')
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map((o) => ({
        order: o.orderNumber,
        costPerUnit: o.costs?.costPerUnit || 0,
        materialCost: o.costs?.materialCost || 0,
        laborCost: o.costs?.laborCost || 0,
        date: new Date(o.completedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  };

  // Recent Production Orders
  const getRecentProductionOrders = () => {
    return orders
      .filter((o) => o.orderType === 'production')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  // Production Efficiency Metrics
  const getEfficiencyMetrics = () => {
    const completedProduction = orders.filter(
      (o) => o.orderType === 'production' && o.status === 'completed'
    );

    const totalMaterial = completedProduction.reduce((sum, o) => sum + (o.costs?.materialCost || 0), 0);
    const totalLabor = completedProduction.reduce((sum, o) => sum + (o.costs?.laborCost || 0), 0);
    const total = totalMaterial + totalLabor;

    return [
      {
        name: 'Material',
        value: totalMaterial,
        percentage: total > 0 ? (totalMaterial / total) * 100 : 0,
        color: '#3b82f6',
      },
      {
        name: 'Labor',
        value: totalLabor,
        percentage: total > 0 ? (totalLabor / total) * 100 : 0,
        color: '#10b981',
      },
    ];
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMSI = (value: number) => {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MSI`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading production data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Link
            to="/orders?filter=production"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Production Orders
          </Link>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{stats.totalProductionOrders}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Completed</p>
              <p className="text-3xl font-bold mt-2">{stats.completedProductionOrders}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Output</p>
              <p className="text-2xl font-bold mt-2">{stats.totalOutputMSI.toFixed(0)} MSI</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Cost</p>
              <p className="text-xl font-bold mt-2">{formatCurrency(stats.totalProductionCost)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Avg Cost/MSI</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.avgCostPerMSI)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">R&D Orders</p>
              <p className="text-3xl font-bold mt-2">{stats.rdOrdersCount}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">R&D Cost</p>
              <p className="text-xl font-bold mt-2">{formatCurrency(stats.rdTotalCost)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Production Output Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Output Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={getProductionOutputData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'output') return formatMSI(Number(value));
                  return formatCurrency(Number(value));
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="output" fill="#3b82f6" name="Output (MSI)" />
              <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} name="Total Cost" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Production by Stage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production by Manufacturing Stage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProductionByStageData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="materialCost" stackId="a" fill="#3b82f6" name="Material" />
              <Bar dataKey="laborCost" stackId="a" fill="#10b981" name="Labor" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Production vs R&D */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production vs R&D Cost Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProductionVsRDData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="material" fill="#3b82f6" name="Material" />
              <Bar dataKey="labor" fill="#10b981" name="Labor (Note: R&D is 2x)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> R&D labor costs are 2x production labor costs due to intensive testing and analysis requirements.
            </p>
          </div>
        </div>

        {/* Production Efficiency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Structure Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEfficiencyMetrics()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getEfficiencyMetrics().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            {getEfficiencyMetrics().map((metric) => (
              <div key={metric.name} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{metric.name}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(metric.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Production by Product Line */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Output by Product Line</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getProductionByProductLine()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'output') return formatMSI(Number(value));
                  return formatCurrency(Number(value));
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="output" fill="#3b82f6" name="Output (MSI)" />
              <Bar yAxisId="right" dataKey="cost" fill="#10b981" name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Efficiency Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost per Unit Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getCostEfficiencyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="costPerUnit" stroke="#8b5cf6" strokeWidth={3} name="Cost per Unit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Production Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Production Orders</h2>
          <Link
            to="/orders?filter=production"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {getRecentProductionOrders().length === 0 ? (
            <div className="p-6 text-center text-gray-500">No production orders yet</div>
          ) : (
            getRecentProductionOrders().map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Inputs: {order.inputs.length}</span>
                      <span>Outputs: {order.outputs.length}</span>
                      {order.costs && (
                        <>
                          <span>Cost: {formatCurrency(order.costs.totalCost)}</span>
                          <span>Material: {formatCurrency(order.costs.materialCost)}</span>
                          <span>Labor: {formatCurrency(order.costs.laborCost)}</span>
                        </>
                      )}
                    </div>
                    {order.notes && (
                      <p className="text-sm text-gray-500 mt-1">{order.notes}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
