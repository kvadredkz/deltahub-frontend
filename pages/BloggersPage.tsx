import React, { useEffect, useState } from 'react';
import { Blogger, Product } from '../types';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Dialog from '../components/Dialog';

const BloggersPage: React.FC = () => {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New blogger form
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBlogger, setNewBlogger] = useState({
    name: '',
    email: '',
    bio: ''
  });

  // Affiliate link creation
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [newLinkCode, setNewLinkCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bloggersData, productsData] = await Promise.all([
          api.getBloggers(),
          api.getProducts()
        ]);
        setBloggers(bloggersData);
        setProducts(productsData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateBlogger = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const blogger = await api.createBlogger(newBlogger);
      setBloggers(prev => [...prev, blogger]);
      setNewBlogger({ name: '', email: '', bio: '' });
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to create blogger');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedBlogger || !selectedProduct) return;
    setIsCreatingLink(true);
    try {
      const link = await api.createAffiliateLink({
        blogger_id: selectedBlogger.id,
        product_id: selectedProduct.id
      });
      setLinkGenerated(true);
      setNewLinkCode(link.code);
    } catch (err) {
      setError('Failed to create affiliate link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="large" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Bloggers</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Add Blogger</Button>
      </div>

      {/* Create Blogger Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Blogger"
        onSubmit={handleCreateBlogger}
      >
        <Input
          id="name"
          label="Name"
          value={newBlogger.name}
          onChange={e => setNewBlogger(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={newBlogger.email}
          onChange={e => setNewBlogger(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          id="bio"
          label="Bio"
          multiline
          rows={3}
          value={newBlogger.bio}
          onChange={e => setNewBlogger(prev => ({ ...prev, bio: e.target.value }))}
        />
      </Dialog>

      {/* Create Affiliate Link */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Affiliate Link</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Blogger</label>
            <select
              value={selectedBlogger?.id || ''}
              onChange={e => setSelectedBlogger(bloggers.find(b => b.id === Number(e.target.value)) || null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a blogger</option>
              {bloggers.map(blogger => (
                <option key={blogger.id} value={blogger.id}>{blogger.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
            <select
              value={selectedProduct?.id || ''}
              onChange={e => setSelectedProduct(products.find(p => p.id === Number(e.target.value)) || null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleGenerateLink}
            disabled={!selectedBlogger || !selectedProduct}
          >
            Generate Link
          </Button>
          {linkGenerated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">Affiliate Link Created!</p>
              <p className="mt-1 font-mono text-sm">
                {`${window.location.origin}/#/products/${newLinkCode}`}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Bloggers List */}
      {bloggers.length === 0 ? (
        <p className="text-center text-gray-500">You have not added any bloggers yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloggers.map(blogger => (
            <Card key={blogger.id} className="p-6">
              <h3 className="text-lg font-semibold text-gray-800">{blogger.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{blogger.email}</p>
              {blogger.bio && (
                <p className="mt-2 text-gray-600">{blogger.bio}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BloggersPage;
