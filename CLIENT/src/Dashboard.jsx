// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    FaUser, FaHistory, FaTags, FaPlus, FaRobot, FaPaperPlane,
    FaSignOutAlt, FaTimes, FaEdit, FaTrash, FaSearch, FaBars,
    FaGraduationCap, FaGamepad, FaUtensils, FaCode, FaMusic,
    FaBusinessTime, FaPalette, FaReply
} from 'react-icons/fa';
import api from './axiosInstance';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [categoryItems, setCategoryItems] = useState([]);
    const [loadingCategoryItems, setLoadingCategoryItems] = useState(false);

    const [profile, setProfile] = useState({
        name: 'Loading...',
        email: '',
        username: '',
        dateJoined: '',
        promptsUsed: 0
    });

    // Fetch User Profile
    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/');
            setProfile({
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
                email: data.email || '',
                username: data.username,
                dateJoined: new Date(data.date_joined).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                }),
                promptsUsed: 0
            });
        } catch (err) {
            console.error('Profile fetch failed:', err);
        }
    };

    // Fetch Chat History
    const fetchChatHistory = async () => {
        try {
            const { data } = await api.get('/chat-history/user/');
            setChatHistory(data);
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        }
    };

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/get_categories/');
            const formatted = data.map(cat => ({
                id: cat.id,
                name: cat.category_name,
                icon: mapIcon(cat.category_name),
                color: mapColor(cat.category_name)
            }));
            setCategories(formatted);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    // Fetch Category Items
    const fetchCategoryItems = async (categoryName) => {
        if (!categoryName) return;

        setLoadingCategoryItems(true);
        try {
            const { data } = await api.get(`/category/user/${categoryName.toLowerCase()}/`);
            setCategoryItems(data);
        } catch (err) {
            console.error('Failed to fetch category items:', err);
            setCategoryItems([]);
        } finally {
            setLoadingCategoryItems(false);
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        fetchProfile();
        fetchChatHistory();
        fetchCategories();
    }, []);

    // Fetch category items when category is selected and we're on categories tab
    useEffect(() => {
        if (activeTab === 'categories' && selectedCategory) {
            fetchCategoryItems(selectedCategory.name);
        } else {
            setCategoryItems([]);
        }
    }, [selectedCategory, activeTab]);

    // Icon & Color Mapping
    const mapIcon = (name) => {
        const map = {
            education: FaGraduationCap,
            gaming: FaGamepad,
            cooking: FaUtensils,
            programming: FaCode,
            music: FaMusic,
            business: FaBusinessTime,
            creative: FaPalette
        };
        return map[name.toLowerCase()] || FaTags;
    };

    const mapColor = (name) => {
        const map = {
            education: 'bg-blue-500',
            gaming: 'bg-green-500',
            cooking: 'bg-red-500',
            programming: 'bg-purple-500',
            music: 'bg-yellow-500',
            business: 'bg-indigo-500',
            creative: 'bg-pink-500'
        };
        return map[name.toLowerCase()] || 'bg-gray-500';
    };

    // Gemini API Call with retry on rate limit
    const generateContentWithGemini = async (userPrompt, retryCount = 0) => {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userPrompt }] }]
                    })
                }
            );

            // Retry once on rate limit (429)
            if (res.status === 429 && retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return generateContentWithGemini(userPrompt, retryCount + 1);
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 429) {
                    throw new Error('API quota exceeded. Please wait a few minutes and try again.');
                }
                throw new Error(errData?.error?.message || `Gemini error: ${res.status}`);
            }

            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    };

    // Save Chat History to Backend
    const saveChatHistory = async (promptText, responseText) => {
        try {
            await api.post('/chat-history/', {
                prompt: promptText,
                response: responseText
            });
        } catch (err) {
            console.error('Failed to save chat history:', err);
        }
    };

    // Save to Category
    const saveToCategory = async (promptText, responseText, categoryName) => {
        try {
            await api.post('/category/', {
                category: categoryName,
                prompt: promptText,
                response: responseText
            });
            // Refresh category items if we're viewing that category
            if (selectedCategory && selectedCategory.name.toLowerCase() === categoryName.toLowerCase()) {
                fetchCategoryItems(categoryName);
            }
        } catch (err) {
            console.error('Failed to save to category:', err);
        }
    };

    // Load history item into chat
    const loadHistoryToChat = (historyItem) => {
        setPrompt(historyItem.prompt);
        setResponse(historyItem.response);
        setActiveTab('chat');
        setSelectedHistoryItem(historyItem);

        // Scroll to top of chat area
        setTimeout(() => {
            const chatArea = document.querySelector('.overflow-y-auto');
            if (chatArea) {
                chatArea.scrollTop = 0;
            }
        }, 100);
    };

    // Load category item into chat
    const loadCategoryItemToChat = (categoryItem) => {
        setPrompt(categoryItem.prompt);
        setResponse(categoryItem.response);
        setActiveTab('chat');
        setSelectedHistoryItem(categoryItem);

        // Scroll to top of chat area
        setTimeout(() => {
            const chatArea = document.querySelector('.overflow-y-auto');
            if (chatArea) {
                chatArea.scrollTop = 0;
            }
        }, 100);
    };

    // Send Prompt
    const handleSendPrompt = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);

        try {
            const aiResponse = await generateContentWithGemini(prompt);
            setResponse(aiResponse);

            // Save to chat history
            await saveChatHistory(prompt, aiResponse);

            // If category is selected, also save to category
            if (selectedCategory) {
                await saveToCategory(prompt, aiResponse, selectedCategory.name);
            }

            // Refresh data
            fetchChatHistory();

            // Clear history item selection after sending new prompt
            setSelectedHistoryItem(null);

            setPrompt('');
        } catch (error) {
            console.error('Error in handleSendPrompt:', error);
            setResponse(error.message || 'Error generating response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPrompt();
        }
    };

    const clearChat = () => {
        setPrompt('');
        setResponse('');
        setSelectedHistoryItem(null);
    };

    const deleteHistoryItem = async (id) => {
        try {
            await api.delete(`/chat-history/${id}/`);
            setChatHistory(chatHistory.filter(h => h.id !== id));
            // If the deleted item was currently loaded, clear it
            if (selectedHistoryItem && selectedHistoryItem.id === id) {
                setSelectedHistoryItem(null);
            }
        } catch (err) {
            console.error('Failed to delete history item:', err);
        }
    };

    // Delete category item
    const deleteCategoryItem = async (id) => {
        try {
            await api.delete(`/category/${id}/`);
            setCategoryItems(categoryItems.filter(item => item.id !== id));
            // If the deleted item was currently loaded, clear it
            if (selectedHistoryItem && selectedHistoryItem.id === id) {
                setSelectedHistoryItem(null);
            }
        } catch (err) {
            console.error('Failed to delete category item:', err);
        }
    };

    // Add Category via Backend
    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;

        setIsLoading(true);
        try {
            await api.post('/Add-category/', {
                category_name: newCategory.trim()
            });

            setNewCategory('');
            setShowAddCategory(false);
            fetchCategories();
        } catch (err) {
            console.error('Add category failed:', err);
            alert(err.response?.data?.detail || 'Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle adding response to category
    const handleAddToCategory = async () => {
        if (!selectedCategory || !prompt || !response) return;

        try {
            await saveToCategory(prompt, response, selectedCategory.name);
            alert(`Added to ${selectedCategory.name} category!`);
        } catch (err) {
            console.error('Failed to add to category:', err);
            alert('Failed to add to category');
        }
    };

    // Default categories for initial setup
    const defaultCategories = [
        { id: 1, name: "Education", icon: FaGraduationCap, color: "bg-blue-500" },
        { id: 2, name: "Gaming", icon: FaGamepad, color: "bg-green-500" },
        { id: 3, name: "Cooking", icon: FaUtensils, color: "bg-red-500" },
        { id: 4, name: "Programming", icon: FaCode, color: "bg-purple-500" },
        { id: 5, name: "Music", icon: FaMusic, color: "bg-yellow-500" },
        { id: 6, name: "Business", icon: FaBusinessTime, color: "bg-indigo-500" },
        { id: 7, name: "Creative", icon: FaPalette, color: "bg-pink-500" }
    ];

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <FaRobot className={`h-8 w-8 text-black ${!sidebarOpen && 'mx-auto'}`} />
                        {sidebarOpen && <span className="text-xl font-bold text-black">PromptCraft</span>}
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <nav className="space-y-2">
                        {['chat', 'history', 'categories'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    if (tab !== 'categories') {
                                        setSelectedCategory(null);
                                    }
                                }}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${activeTab === tab ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab === 'chat' && <FaRobot className="h-5 w-5" />}
                                {tab === 'history' && <FaHistory className="h-5 w-5" />}
                                {tab === 'categories' && <FaTags className="h-5 w-5" />}
                                {sidebarOpen && <span className="capitalize">{tab}</span>}
                            </button>
                        ))}
                    </nav>

                    {sidebarOpen && (
                        <div className="mt-8">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">Categories</h3>
                                <button onClick={() => setShowAddCategory(true)} className="text-gray-400 hover:text-black">
                                    <FaPlus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {categories.slice(0, 5).map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setActiveTab('categories');
                                        }}
                                        className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm ${selectedCategory?.id === cat.id ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <cat.icon className="h-4 w-4" />
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                                {categories.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-2">No categories</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <button onClick={() => setProfileOpen(true)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 w-full">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <FaUser className="h-4 w-4 text-gray-600" />
                        </div>
                        {sidebarOpen && (
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                                <p className="text-xs text-gray-500">Free Plan</p>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                                <FaBars className="h-5 w-5 text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'chat' && 'AI Prompt Assistant'}
                                {activeTab === 'history' && 'Prompt History'}
                                {activeTab === 'categories' && (selectedCategory ? `${selectedCategory.name} Category` : 'Categories')}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {selectedCategory && (
                                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                                    <selectedCategory.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{selectedCategory.name}</span>
                                    <button onClick={() => setSelectedCategory(null)} className="text-gray-400 hover:text-gray-600">
                                        <FaTimes className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                            <button onClick={() => setProfileOpen(true)} className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <FaUser className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden">
                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* History Loaded Indicator */}
                                {selectedHistoryItem && (
                                    <div className="max-w-4xl mx-auto mb-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <FaHistory className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-blue-700">
                                                        Loaded from {selectedHistoryItem.category ? 'category' : 'history'} • {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedHistoryItem(null);
                                                        clearChat();
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {response ? (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                            <div className="flex justify-between mb-4">
                                                <h3 className="text-lg font-semibold">AI Response</h3>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleAddToCategory}
                                                        disabled={!selectedCategory}
                                                        className={`px-4 py-2 rounded-lg text-sm ${selectedCategory ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
                                                    >
                                                        Add to {selectedCategory?.name}
                                                    </button>
                                                    <button onClick={clearChat} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="prose text-gray-700 whitespace-pre-wrap">{response}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-center">
                                        <div>
                                            <FaRobot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-500 mb-2">No response yet</h3>
                                            <p className="text-gray-400">Send a prompt to get started</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t bg-white p-6">
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex space-x-4">
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => {
                                                setPrompt(e.target.value);
                                                // Clear the history item indicator if user starts typing
                                                if (selectedHistoryItem && e.target.value !== selectedHistoryItem.prompt) {
                                                    setSelectedHistoryItem(null);
                                                }
                                            }}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Enter your prompt here... (Press Enter to send, Shift+Enter for new line)"
                                            className="flex-1 h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-black"
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={handleSendPrompt}
                                            disabled={isLoading || !prompt.trim()}
                                            className={`px-6 py-3 rounded-lg font-semibold ${isLoading || !prompt.trim() ? 'bg-gray-300 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
                                        >
                                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaPaperPlane />}
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center space-x-2 overflow-x-auto">
                                        <span className="text-sm text-gray-500">Quick Categories:</span>
                                        {categories.slice(0, 4).map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${selectedCategory?.id === cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                <cat.icon className="h-3 w-3" />
                                                <span>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="p-6 overflow-y-auto">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Prompt History</h2>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search history..."
                                            className="pl-10 pr-4 py-2 border rounded-lg w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {chatHistory
                                        .filter(item =>
                                            item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.response.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                                onClick={() => loadHistoryToChat(item)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(item.timestamp).toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                                <FaReply className="h-3 w-3" />
                                                                <span>Click to load in chat</span>
                                                            </span>
                                                        </div>
                                                        <p className="font-medium text-gray-900 mb-2">{item.prompt}</p>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {item.response}
                                                        </p>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                loadHistoryToChat(item);
                                                            }}
                                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Load in chat"
                                                        >
                                                            <FaReply className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteHistoryItem(item.id);
                                                            }}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {chatHistory.length === 0 && (
                                        <div className="text-center py-12">
                                            <FaHistory className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-400">No history yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="p-6">
                            <div className="max-w-6xl mx-auto">
                                <div className="flex justify-between mb-6">
                                    <h2 className="text-2xl font-bold">
                                        {selectedCategory ? `${selectedCategory.name} Category` : 'Categories'}
                                    </h2>
                                    <div className="flex space-x-3">
                                        {selectedCategory && (
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                <FaTimes className="h-4 w-4" />
                                                <span>Back to All Categories</span>
                                            </button>
                                        )}
                                        <button onClick={() => setShowAddCategory(true)} className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg">
                                            <FaPlus /> <span>Add</span>
                                        </button>
                                    </div>
                                </div>

                                {!selectedCategory ? (
                                    // All Categories View
                                    categories.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FaTags className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-400 mb-6">Add categories to organize prompts</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                                {defaultCategories.slice(0, 4).map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setNewCategory(cat.name);
                                                            setShowAddCategory(true);
                                                        }}
                                                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                                    >
                                                        <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                                            <cat.icon className="h-6 w-6 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium">{cat.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {categories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => setSelectedCategory(cat)}
                                                >
                                                    <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                                                        <cat.icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <h3 className="font-semibold mb-2">{cat.name}</h3>
                                                    <span className="text-sm text-blue-600 hover:text-blue-800">
                                                        View items
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    // Selected Category Items View
                                    <div>
                                        <div className="bg-white border rounded-lg p-6 mb-6">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-16 h-16 ${selectedCategory.color} rounded-lg flex items-center justify-center`}>
                                                    <selectedCategory.icon className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                                                    <p className="text-gray-600">
                                                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''} in this category
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {loadingCategoryItems ? (
                                            <div className="text-center py-12">
                                                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-gray-500">Loading items...</p>
                                            </div>
                                        ) : categoryItems.length > 0 ? (
                                            <div className="space-y-4">
                                                {categoryItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                                        onClick={() => loadCategoryItemToChat(item)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-sm text-gray-500">
                                                                        {new Date(item.timestamp).toLocaleString()}
                                                                    </span>
                                                                    <span className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                                        <FaReply className="h-3 w-3" />
                                                                        <span>Click to load in chat</span>
                                                                    </span>
                                                                </div>
                                                                <p className="font-medium text-gray-900 mb-2">{item.prompt}</p>
                                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                                    {item.response}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        loadCategoryItemToChat(item);
                                                                    }}
                                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Load in chat"
                                                                >
                                                                    <FaReply className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteCategoryItem(item.id);
                                                                    }}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-white border rounded-lg">
                                                <FaTags className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-400 mb-4">No items in this category yet</p>
                                                <p className="text-gray-500 text-sm">
                                                    Use the "Add to {selectedCategory.name}" button in the chat to add items to this category
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-semibold">Add Category</h3>
                            <button onClick={() => { setShowAddCategory(false); setNewCategory(''); }}>
                                <FaTimes />
                            </button>
                        </div>
                        <input
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddCategory()}
                            placeholder="Category name"
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddCategory}
                                disabled={isLoading || !newCategory.trim()}
                                className="flex-1 bg-black text-white py-2 rounded-lg disabled:opacity-50"
                            >
                                {isLoading ? 'Adding...' : 'Add'}
                            </button>
                            <button
                                onClick={() => { setShowAddCategory(false); setNewCategory(''); }}
                                className="flex-1 border py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {profileOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-xl font-semibold">Profile</h3>
                            <button onClick={() => setProfileOpen(false)}><FaTimes /></button>
                        </div>
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <FaUser className="h-8 w-8 text-gray-600" />
                            </div>
                            <h4 className="text-lg font-semibold">{profile.name}</h4>
                            <p className="text-gray-500">{profile.email}</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span>Username</span> <span className="font-semibold">{profile.username}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span>Member Since</span> <span className="font-semibold">{profile.dateJoined}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span>Chat History</span> <span className="font-semibold">{chatHistory.length} items</span>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            {/* <button className="flex-1 flex items-center justify-center space-x-2 border py-2 rounded-lg">
                                <FaEdit /> <span>Edit</span>
                            </button> */}
                            <button
                                onClick={handleLogout}
                                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-2 rounded-lg"
                            >
                                <FaSignOutAlt /> <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;