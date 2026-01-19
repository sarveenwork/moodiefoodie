'use client';

import { useEffect, useState } from 'react';
import { getAllItems, createItem, updateItem, deleteItem } from '@/app/actions/items';
import Navbar from '@/components/layout/Navbar';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Item {
    id: string;
    name: string;
    price: number;
    category: 'food' | 'drink';
    is_active: boolean;
}

export default function ItemsPage() {
    const { showSuccess, showError } = useToast();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<'food' | 'drink' | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'drink'>('all');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (showDropdown && !target.closest('.relative')) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDropdown]);

    async function loadItems() {
        setLoading(true);
        const result = await getAllItems();
        if (result.success && result.data) {
            setItems(result.data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submitting) return; // Prevent spam clicks
        
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const result = editingItem
            ? await updateItem(formData)
            : await createItem(formData);

        if (result.success) {
            setShowModal(false);
            setEditingItem(null);
            setSelectedCategory(null);
            showSuccess(editingItem ? 'Item updated successfully' : 'Item created successfully');
            loadItems();
        } else {
            showError(result.error || `Failed to ${editingItem ? 'update' : 'create'} item`);
        }
        setSubmitting(false);
    }

    function handleDeleteClick(itemId: string) {
        setItemToDelete(itemId);
        setShowDeleteConfirm(true);
    }

    async function handleDeleteConfirm() {
        if (!itemToDelete || deleting === itemToDelete) return; // Prevent spam clicks

        setShowDeleteConfirm(false);
        setDeleting(itemToDelete);
        const formData = new FormData();
        formData.append('id', itemToDelete);
        const result = await deleteItem(formData);

        if (result.success) {
            showSuccess('Item deleted successfully');
            loadItems();
        } else {
            showError(result.error || 'Failed to delete item');
        }
        setItemToDelete(null);
        setDeleting(null);
    }

    // Filter items based on search term and category
    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#333333' }}>Items</h1>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="text-white px-4 py-2 rounded-md transition-colors flex items-center"
                            style={{ backgroundColor: '#FF6F3C', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF8F5C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6F3C'}
                        >
                            Create Item
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style={{ backgroundColor: '#ffffff' }}>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('food');
                                            setEditingItem(null);
                                            setShowModal(true);
                                            setShowDropdown(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm transition-colors"
                                        style={{ color: '#333333', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                    >
                                        Add Food
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('drink');
                                            setEditingItem(null);
                                            setShowModal(true);
                                            setShowDropdown(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm transition-colors"
                                        style={{ color: '#333333', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                    >
                                        Add Drink
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                                Search Items
                            </label>
                            <input
                                type="text"
                                placeholder="Search by item name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                style={{ color: '#333333' }}
                            />
                        </div>
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                                Filter by Category
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCategoryFilter('all')}
                                    className="px-4 py-2 rounded-md font-medium transition-colors"
                                    style={categoryFilter === 'all' ? {
                                        backgroundColor: '#FF6F3C',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                    } : {
                                        backgroundColor: '#F5F5F5',
                                        color: '#777777',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (categoryFilter !== 'all') {
                                            e.currentTarget.style.backgroundColor = '#E5E5E5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (categoryFilter !== 'all') {
                                            e.currentTarget.style.backgroundColor = '#F5F5F5';
                                        }
                                    }}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('food')}
                                    className="px-4 py-2 rounded-md font-medium transition-colors"
                                    style={categoryFilter === 'food' ? {
                                        backgroundColor: '#FF6F3C',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                    } : {
                                        backgroundColor: '#F5F5F5',
                                        color: '#777777',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (categoryFilter !== 'food') {
                                            e.currentTarget.style.backgroundColor = '#E5E5E5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (categoryFilter !== 'food') {
                                            e.currentTarget.style.backgroundColor = '#F5F5F5';
                                        }
                                    }}
                                >
                                    Food
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('drink')}
                                    className="px-4 py-2 rounded-md font-medium transition-colors"
                                    style={categoryFilter === 'drink' ? {
                                        backgroundColor: '#FF6F3C',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                    } : {
                                        backgroundColor: '#F5F5F5',
                                        color: '#777777',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (categoryFilter !== 'drink') {
                                            e.currentTarget.style.backgroundColor = '#E5E5E5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (categoryFilter !== 'drink') {
                                            e.currentTarget.style.backgroundColor = '#F5F5F5';
                                        }
                                    }}
                                >
                                    Drinks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-8 text-center" style={{ color: '#777777' }}>
                        {searchTerm || categoryFilter !== 'all' 
                            ? 'No items found matching your search criteria.' 
                            : 'No items available'}
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                                                style={item.category === 'food' ? {
                                                    backgroundColor: '#FFF4E6',
                                                    color: '#FF6F3C'
                                                } : {
                                                    backgroundColor: '#E6F3FF',
                                                    color: '#0066CC'
                                                }}
                                            >
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            RM {item.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={item.is_active ? {
                                                    backgroundColor: '#4CAF50',
                                                    color: '#ffffff'
                                                } : {
                                                    backgroundColor: '#FF4C4C',
                                                    color: '#ffffff'
                                                }}
                                            >
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setShowModal(true);
                                                }}
                                                className="transition-colors"
                                                style={{ color: '#FF6F3C' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#FF8F5C'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#FF6F3C'}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item.id)}
                                                disabled={deleting === item.id}
                                                className="transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ 
                                                    color: deleting === item.id ? '#999999' : '#FF4C4C', 
                                                    cursor: deleting === item.id ? 'not-allowed' : 'pointer' 
                                                }}
                                                onMouseEnter={(e) => deleting !== item.id && (e.currentTarget.style.color = '#CC0000')}
                                                onMouseLeave={(e) => deleting !== item.id && (e.currentTarget.style.color = '#FF4C4C')}
                                            >
                                                {deleting === item.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">
                                {editingItem ? 'Edit Item' : 'Create Item'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                {editingItem && (
                                    <input type="hidden" name="id" value={editingItem.id} />
                                )}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        required
                                        defaultValue={editingItem?.category || selectedCategory || ''}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        <option value="">Select category</option>
                                        <option value="food">Food</option>
                                        <option value="drink">Drink</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        defaultValue={editingItem?.name || ''}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (RM)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        step="0.01"
                                        min="0"
                                        defaultValue={editingItem?.price || ''}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            defaultChecked={editingItem ? editingItem.is_active !== false : true}
                                            value="on"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingItem(null);
                                            setSelectedCategory(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ 
                                            backgroundColor: submitting ? '#ccc' : '#FF6F3C', 
                                            cursor: submitting ? 'not-allowed' : 'pointer' 
                                        }}
                                        onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#FF8F5C')}
                                        onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#FF6F3C')}
                                    >
                                        {submitting ? (editingItem ? 'Updating...' : 'Creating...') : (editingItem ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    title="Delete Item"
                    message="Are you sure you want to delete this item? This will soft delete the item and cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="danger"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setItemToDelete(null);
                    }}
                />
            </div>
        </div>
    );
}
