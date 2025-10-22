
import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';

const ProductLandingPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const bloggerId = searchParams.get('bloggerId');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!productId) {
      setError('Product ID is missing.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get product details and track visit if blogger ID is present
        const productResponse = await api.getProduct(
          parseInt(productId),
          bloggerId ? parseInt(bloggerId) : undefined
        );
        setProduct(productResponse);
      } catch (err) {
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, bloggerId]);

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId || !bloggerId || !phoneNumber || quantity < 1) {
      alert('Please fill in all fields correctly.');
      return;
    }
    setIsOrdering(true);
    try {
      await api.createOrder({
        product_id: parseInt(productId),
        blogger_id: parseInt(bloggerId),
        client_phone: phoneNumber,
        quantity: quantity,
        price_per_item: product.price,
      });
      setOrderSuccess(true);
    } catch (err) {
      alert('Failed to place order.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="large" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl">{error}</div>;
  }

  if (!product) {
    return <div className="text-center text-gray-500 text-xl">Product not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="grid md:grid-cols-2 gap-8">
        <div>
          {/* Image will be added later */}
        </div>
        <div className="p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-4xl font-extrabold text-indigo-600 mb-6">${product.price.toFixed(2)}</p>
          
          {orderSuccess ? (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Order Placed!</p>
              <p>Thank you! Your order has been received and will be processed shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 555-123-4567"
                required
              />
              <Input
                id="quantity"
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
              />
              <Button type="submit" isLoading={isOrdering} className="w-full">
                Place Order
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductLandingPage;
