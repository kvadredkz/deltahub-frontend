
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Input from '../components/Input';

const ShopDashboardPage: React.FC = () => {
  const { shop } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    if (shop?.id) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const data = await api.getProducts();
          setProducts(data);
        } catch (err) {
          setError('Failed to load products.');
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [shop]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="large" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;

    setIsCreating(true);
    try {
      const createdProduct = await api.createProduct({
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        shop_id: shop.id
      });
      setProducts(prev => [createdProduct, ...prev]);
      setNewProduct({ name: '', description: '', price: '' });
    } catch (err) {
      setError('Failed to create product.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Your Products</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Product</h2>
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            id="name"
            label="Name"
            type="text"
            required
            value={newProduct.name}
            onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newProduct.description}
              onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
            />
          </div>
          <Input
            id="price"
            label="Price"
            type="number"
            step="0.01"
            required
            value={newProduct.price}
            onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
          />
          <Button type="submit" isLoading={isCreating}>
            Add Product
          </Button>
        </form>
      </Card>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">You have not added any products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link key={product.id} to={`/shop/products/${product.id}`}>
              <Card className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-gray-600 mt-2 flex-grow">{product.description}</p>
                  <p className="mt-4 text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboardPage;
