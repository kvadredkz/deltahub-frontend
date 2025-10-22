import React, { useEffect, useState } from 'react';
import { Blogger, Product } from '../types';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
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
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
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
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)}>Add Blogger</Button>
          <Button onClick={() => setIsLinkDialogOpen(true)} variant="secondary">Create Affiliate Link</Button>
        </div>
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

      {/* Create Affiliate Link Dialog */}
      <Dialog
        isOpen={isLinkDialogOpen}
        onClose={() => {
          setIsLinkDialogOpen(false);
          setSelectedBlogger(null);
          setSelectedProduct(null);
          setLinkGenerated(false);
        }}
        title="Create Affiliate Link"
        onSubmit={handleGenerateLink}
      >
        <div className="space-y-4">
          <Select
            id="blogger"
            label="Select Blogger"
            value={selectedBlogger?.id?.toString() || ''}
            onChange={e => setSelectedBlogger(bloggers.find(b => b.id === Number(e.target.value)) || null)}
            options={bloggers.map(blogger => ({
              value: blogger.id.toString(),
              label: blogger.name
            }))}
          />
          <Select
            id="product"
            label="Select Product"
            value={selectedProduct?.id?.toString() || ''}
            onChange={e => setSelectedProduct(products.find(p => p.id === Number(e.target.value)) || null)}
            options={products.map(product => ({
              value: product.id.toString(),
              label: product.name
            }))}
          />
          {linkGenerated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 font-medium">Affiliate Link Created!</p>
              <p className="mt-1 font-mono text-sm break-all">
                {`${window.location.origin}/#/products/${newLinkCode}`}
              </p>
            </div>
          )}
        </div>
      </Dialog>

      {/* Bloggers List */}
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bloggers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  You have not added any bloggers yet.
                </td>
              </tr>
            ) : bloggers.map((blogger) => (
              <tr key={blogger.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blogger.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blogger.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {blogger.bio || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(blogger.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BloggersPage;
