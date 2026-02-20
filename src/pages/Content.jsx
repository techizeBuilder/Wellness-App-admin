import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import {
    FileText, Video, Headphones, Plus, Eye, Edit, Trash2,
    Search, Filter, X, Image as ImageIcon, Star, Calendar
} from 'lucide-react';

const Content = () => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalContent: 0,
        articles: 0,
        videos: 0,
        audios: 0,
        featured: 0
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContent, setTotalContent] = useState(0);
    const contentsPerPage = 10;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [featuredFilter, setFeaturedFilter] = useState('All');

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Yoga',
        type: 'article',
        duration: '',
        image: '',
        fullContent: '',
        videoUrl: '',
        audioUrl: '',
        featured: false,
        contentType: 'All Content'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'file'
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = ['Yoga', 'Ayurveda', 'Diet', 'Meditation'];
    const types = ['article', 'video', 'audio'];
    const contentTypes = ['All Content', 'Featured Content'];

    // Fetch contents from API
    const fetchContents = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: contentsPerPage
            });

            if (searchTerm) queryParams.append('search', searchTerm);
            if (categoryFilter !== 'All') queryParams.append('category', categoryFilter);
            if (typeFilter !== 'All') queryParams.append('type', typeFilter);
            if (featuredFilter !== 'All') queryParams.append('featured', featuredFilter === 'Featured');

            const response = await apiGet(`/api/admin/contents?${queryParams}`);

            if (response.success) {
                const contentData = response.data?.contents || response.data || [];
                const pagination = response.data?.pagination || {};

                setContents(contentData);
                setTotalPages(pagination.pages || 1);
                setTotalContent(pagination.total || contentData.length);
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
            toast.error('Failed to fetch content: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch content statistics
    const fetchStats = async () => {
        try {
            const response = await apiGet('/api/admin/contents/stats');

            if (response.success && response.data?.stats) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, typeFilter, featuredFilter]);

    useEffect(() => {
        fetchContents();
    }, [currentPage, searchTerm, categoryFilter, typeFilter, featuredFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Auto-sync: When contentType is "Featured Content", set featured to true
            if (name === 'contentType' && value === 'Featured Content') {
                updated.featured = true;
            }
            // When contentType changes from "Featured Content" to "All Content", don't auto-uncheck
            // Let user decide if they want to keep it featured

            return updated;
        });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, JPG, PNG, GIF)');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Add Content
    const handleAddContent = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.description || !formData.duration) {
            toast.error('Please fill all required fields');
            return;
        }

        // Check if image is provided
        if (imageUploadType === 'url' && !formData.image) {
            toast.error('Please provide an image URL');
            return;
        }

        if (imageUploadType === 'file' && !imageFile) {
            toast.error('Please select an image file');
            return;
        }

        try {
            setFormLoading(true);

            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('type', formData.type);
            submitData.append('duration', formData.duration);
            submitData.append('featured', formData.featured);
            submitData.append('contentType', formData.contentType);

            // Add full content and media URLs
            if (formData.fullContent) {
                submitData.append('fullContent', formData.fullContent);
                console.log('📝 Adding fullContent:', formData.fullContent.substring(0, 100) + '...');
            }
            if (formData.videoUrl) {
                submitData.append('videoUrl', formData.videoUrl);
                console.log('🎥 Adding videoUrl:', formData.videoUrl);
            }
            if (formData.audioUrl) {
                submitData.append('audioUrl', formData.audioUrl);
                console.log('🎧 Adding audioUrl:', formData.audioUrl);
            }

            if (imageUploadType === 'file' && imageFile) {
                submitData.append('image', imageFile);
                console.log('📸 Uploading image file:', imageFile.name);
            } else if (imageUploadType === 'url') {
                submitData.append('image', formData.image);
                console.log('🔗 Using image URL:', formData.image);
            }

            // Use fetch directly for FormData
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.REACT_APP_API_URL || 'https://apiwellness.shrawantravels.com';

            const response = await fetch(`${baseUrl}/api/admin/contents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Content added successfully');
                setShowAddModal(false);
                resetForm();
                fetchContents();
                fetchStats();
            } else {
                throw new Error(result.message || 'Failed to add content');
            }
        } catch (error) {
            console.error('Error adding content:', error);
            toast.error(error.message || 'Failed to add content');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle Edit Content
    const handleEditContent = async (e) => {
        e.preventDefault();

        if (!selectedContent) return;

        try {
            setFormLoading(true);

            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('type', formData.type);
            submitData.append('duration', formData.duration);
            submitData.append('featured', formData.featured);
            submitData.append('contentType', formData.contentType);

            // Add full content and media URLs
            if (formData.fullContent) {
                submitData.append('fullContent', formData.fullContent);
            }
            if (formData.videoUrl) {
                submitData.append('videoUrl', formData.videoUrl);
            }
            if (formData.audioUrl) {
                submitData.append('audioUrl', formData.audioUrl);
            }

            if (imageUploadType === 'file' && imageFile) {
                submitData.append('image', imageFile);
            } else if (imageUploadType === 'url' && formData.image) {
                submitData.append('image', formData.image);
            }

            // Use fetch directly for FormData
            const token = localStorage.getItem('adminToken');
            const baseUrl = process.env.REACT_APP_API_URL || 'https://apiwellness.shrawantravels.com';

            const response = await fetch(`${baseUrl}/api/admin/contents/${selectedContent._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Content updated successfully');
                setShowEditModal(false);
                resetForm();
                fetchContents();
                fetchStats();
            } else {
                throw new Error(result.message || 'Failed to update content');
            }
        } catch (error) {
            console.error('Error updating content:', error);
            toast.error(error.message || 'Failed to update content');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle Delete Content
    const handleDeleteContent = async () => {
        if (!selectedContent) return;

        try {
            setFormLoading(true);
            const response = await apiDelete(`/api/admin/contents/${selectedContent._id}`);

            if (response.success) {
                toast.success('Content deleted successfully');
                setShowDeleteModal(false);
                setSelectedContent(null);
                fetchContents();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            toast.error(error.message || 'Failed to delete content');
        } finally {
            setFormLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'Yoga',
            type: 'article',
            duration: '',
            image: '',
            fullContent: '',
            videoUrl: '',
            audioUrl: '',
            featured: false,
            contentType: 'All Content'
        });
        setSelectedContent(null);
        setImageUploadType('url');
        setImageFile(null);
        setImagePreview(null);
    };

    // Open modals
    const openViewModal = (content) => {
        setSelectedContent(content);
        setShowViewModal(true);
    };

    const openEditModal = (content) => {
        setSelectedContent(content);
        setFormData({
            title: content.title || '',
            description: content.description || '',
            category: content.category || 'Yoga',
            type: content.type || 'article',
            duration: content.duration || '',
            image: content.image || '',
            fullContent: content.fullContent || '',
            videoUrl: content.videoUrl || '',
            audioUrl: content.audioUrl || '',
            featured: content.featured || false,
            contentType: content.contentType || 'All Content'
        });
        setImageUploadType('url');
        setImageFile(null);
        setImagePreview(content.image || null);
        setShowEditModal(true);
    };

    const openDeleteModal = (content) => {
        setSelectedContent(content);
        setShowDeleteModal(true);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // Get type icon
    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'audio': return <Headphones className="w-4 h-4" />;
            case 'article':
            default: return <FileText className="w-4 h-4" />;
        }
    };

    // Get type color
    const getTypeColor = (type) => {
        switch (type) {
            case 'video': return 'bg-red-100 text-red-600';
            case 'audio': return 'bg-purple-100 text-purple-600';
            case 'article':
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    // Get category color
    const getCategoryColor = (category) => {
        switch (category) {
            case 'Yoga': return 'bg-teal-100 text-teal-700';
            case 'Ayurveda': return 'bg-green-100 text-green-700';
            case 'Diet': return 'bg-orange-100 text-orange-700';
            case 'Meditation': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('All');
        setTypeFilter('All');
        setFeaturedFilter('All');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-600 mt-1">Manage wellness content for the app</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Content
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-teal-100 text-sm">Total Content</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalContent}</p>
                        </div>
                        <FileText className="w-10 h-10 text-teal-200" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Articles</p>
                            <p className="text-3xl font-bold mt-1">{stats.articles}</p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-200" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Videos</p>
                            <p className="text-3xl font-bold mt-1">{stats.videos}</p>
                        </div>
                        <Video className="w-10 h-10 text-red-200" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Audios</p>
                            <p className="text-3xl font-bold mt-1">{stats.audios}</p>
                        </div>
                        <Headphones className="w-10 h-10 text-purple-200" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm">Featured</p>
                            <p className="text-3xl font-bold mt-1">{stats.featured}</p>
                        </div>
                        <Star className="w-10 h-10 text-amber-200" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        {(searchTerm || categoryFilter !== 'All' || typeFilter !== 'All' || featuredFilter !== 'All') && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="All">All Types</option>
                            {types.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>

                        <select
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="All">All Content</option>
                            <option value="Featured">Featured Only</option>
                            <option value="Not Featured">Not Featured</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Content Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Content Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        Loading contents...
                                    </td>
                                </tr>
                            ) : contents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No content found. Add your first content item!
                                    </td>
                                </tr>
                            ) : (
                                contents.map((content) => (
                                    <tr key={content._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={content.image}
                                                alt={content.title}
                                                className="w-16 h-10 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{content.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{content.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(content.category)}`}>
                                                {content.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getTypeColor(content.type)}`}>
                                                {getTypeIcon(content.type)}
                                                <span className="ml-1">{content.type}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {content.duration}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 font-medium">
                                                {content.contentType || 'All Content'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {content.featured ? (
                                                <span className="flex items-center text-amber-600">
                                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                                    <span className="text-xs font-semibold">Featured</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openViewModal(content)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(content)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(content)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Showing page {currentPage} of {totalPages} ({totalContent} total items)
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Add New Content</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleAddContent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Enter content title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="Enter content description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {types.map(type => (
                                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="e.g., 10 min, 5 min read"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Content Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="contentType"
                                        value={formData.contentType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {contentTypes.map(ct => (
                                            <option key={ct} value={ct}>{ct}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image <span className="text-red-500">*</span>
                                </label>

                                {/* Toggle between URL and File upload */}
                                <div className="flex space-x-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageUploadType('url');
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageUploadType === 'url'
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        Image URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageUploadType('file');
                                            setFormData(prev => ({ ...prev, image: '' }));
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageUploadType === 'file'
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        Upload File
                                    </button>
                                </div>

                                {imageUploadType === 'url' ? (
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                        {imagePreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supported formats: JPEG, JPG, PNG, GIF (Max size: 5MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Content <span className="text-gray-500">(Detailed article/description)</span>
                                </label>
                                <textarea
                                    name="fullContent"
                                    value={formData.fullContent}
                                    onChange={handleInputChange}
                                    rows="10"
                                    placeholder="Enter the complete detailed content here. Include introduction, key points, tips, benefits, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This will be displayed as the main content in the detail screen
                                </p>
                            </div>

                            {formData.type === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Video URL <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {formData.type === 'audio' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Audio URL <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="audioUrl"
                                        value={formData.audioUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://soundcloud.com/..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Mark as Featured
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? 'Adding...' : 'Add Content'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Edit Content</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleEditContent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {types.map(type => (
                                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Content Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="contentType"
                                        value={formData.contentType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    >
                                        {contentTypes.map(ct => (
                                            <option key={ct} value={ct}>{ct}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image <span className="text-red-500">*</span>
                                </label>

                                {/* Image Upload Type Toggle */}
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageUploadType('url')}
                                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${imageUploadType === 'url'
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Image URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageUploadType('file')}
                                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${imageUploadType === 'file'
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        Upload File
                                    </button>
                                </div>

                                {/* Current Image Preview (Edit Mode) */}
                                {formData.image && imageUploadType === 'url' && !imagePreview && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 mb-2">Current Image:</p>
                                        <img
                                            src={formData.image}
                                            alt="Current"
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}

                                {/* Conditional Input Based on Upload Type */}
                                {imageUploadType === 'url' ? (
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        required={!imageFile}
                                        placeholder="Enter image URL"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Content <span className="text-gray-500">(Detailed article/description)</span>
                                </label>
                                <textarea
                                    name="fullContent"
                                    value={formData.fullContent}
                                    onChange={handleInputChange}
                                    rows="10"
                                    placeholder="Enter the complete detailed content here. Include introduction, key points, tips, benefits, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This will be displayed as the main content in the detail screen
                                </p>
                            </div>

                            {formData.type === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Video URL <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {formData.type === 'audio' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Audio URL <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="audioUrl"
                                        value={formData.audioUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://soundcloud.com/..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Mark as Featured
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? 'Updating...' : 'Update Content'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Content Details</h2>
                                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="aspect-video w-full overflow-hidden rounded-lg">
                                <img
                                    src={selectedContent.image}
                                    alt={selectedContent.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                    }}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedContent.title}</h3>
                                <p className="text-gray-600">{selectedContent.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(selectedContent.category)}`}>
                                        {selectedContent.category}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <span className={`inline-flex items-center mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(selectedContent.type)}`}>
                                        {getTypeIcon(selectedContent.type)}
                                        <span className="ml-1">{selectedContent.type}</span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedContent.duration}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Content Type</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedContent.contentType || 'All Content'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Featured</p>
                                    <p className="text-gray-900 font-medium mt-1">
                                        {selectedContent.featured ? (
                                            <span className="flex items-center text-amber-600">
                                                <Star className="w-4 h-4 mr-1 fill-current" />
                                                Yes
                                            </span>
                                        ) : 'No'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(selectedContent);
                                    }}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Edit Content
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Delete Content
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete "<strong>{selectedContent.title}</strong>"? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteContent}
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Content;
