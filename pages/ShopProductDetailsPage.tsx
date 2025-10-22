
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Product, Order, Analytics, OrderStatus } from '../types';
import api from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';

type Tab = 'orders' | 'analytics';

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const colorClasses = {
    [OrderStatus.WaitingToProcess]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Processed]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const ShopProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const [productData, ordersData, analyticsData] = await Promise.all([
        api.getProduct(parseInt(productId)),
        api.getProductOrders(parseInt(productId)),
        api.getProductAnalytics(parseInt(productId)),
      ]);
      setProduct(productData);
      setOrders(ordersData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      await fetchData(); // Refresh all data
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="large" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center text-gray-500">Product not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
      <p className="text-lg text-gray-600 mb-6">₸{product.price.toFixed(2)}</p>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`${activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Analytics
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'orders' && (
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No orders yet
                          </td>
                        </tr>
                      ) : orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.client_phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₸{(order.quantity * order.price_per_item).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={order.status} /></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {order.status === OrderStatus.WaitingToProcess && (
                              <div className="flex items-center justify-end space-x-2">
                                <Button onClick={() => handleUpdateStatus(order.id, OrderStatus.Processed)} variant="success" size="sm" isLoading={updatingOrderId === order.id}>Process</Button>
                                <Button onClick={() => handleUpdateStatus(order.id, OrderStatus.Cancelled)} variant="danger" size="sm" isLoading={updatingOrderId === order.id}>Cancel</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blogger</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Sold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No analytics data yet
                      </td>
                    </tr>
                  ) : analytics.map((analytic) => (
                    <tr key={analytic.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{analytic.blogger?.name || `Blogger ${analytic.blogger_id}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytic.visit_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytic.order_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{analytic.items_sold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">₸{analytic.money_earned.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProductDetailsPage;
