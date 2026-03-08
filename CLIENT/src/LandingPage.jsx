import React from 'react';
import { FaRobot, FaLightbulb, FaRocket, FaCode, FaShieldAlt, FaUsers, FaStar, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <FaRobot className="h-8 w-8 text-black" />
                            <span className="ml-2 text-xl font-bold text-black">PromptCraft</span>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <a href="#features" className="text-gray-600 hover:text-black px-3 py-2 text-sm font-medium">Features</a>
                                <a href="#how-it-works" className="text-gray-600 hover:text-black px-3 py-2 text-sm font-medium">How It Works</a>
                                <a href="#testimonials" className="text-gray-600 hover:text-black px-3 py-2 text-sm font-medium">Testimonials</a>
                                <button onClick={()=>navigate(`/auth`)} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition duration-300">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
                            Master the Art of
                            <span className="text-gray-600 block">AI Prompt Engineering</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Transform your AI interactions with professional prompt engineering techniques.
                            Create precise, effective prompts that unlock the full potential of AI models.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition duration-300 flex items-center justify-center">
                                Start Crafting Prompts <FaChevronRight className="ml-2" />
                            </button>
                            <button className="border-2 border-gray-300 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:border-black transition duration-300">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">Powerful Features</h2>
                        <p className="text-gray-600 text-lg">Everything you need to become a prompt engineering expert</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaLightbulb className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Smart Prompt Templates</h3>
                            <p className="text-gray-600">
                                Pre-built templates for various AI models and use cases to get you started quickly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaCode className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Advanced Syntax</h3>
                            <p className="text-gray-600">
                                Learn and implement advanced prompt syntax and techniques for better results.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaShieldAlt className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Bias Detection</h3>
                            <p className="text-gray-600">
                                Identify and mitigate biases in your prompts for more ethical AI interactions.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaRocket className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Performance Analytics</h3>
                            <p className="text-gray-600">
                                Track and analyze your prompt performance across different AI models.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaUsers className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Collaboration Tools</h3>
                            <p className="text-gray-600">
                                Share and collaborate on prompts with your team in real-time.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                                <FaRobot className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Multi-Model Support</h3>
                            <p className="text-gray-600">
                                Optimize prompts for various AI models including GPT-4, Claude, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">How It Works</h2>
                        <p className="text-gray-600 text-lg">Simple steps to master prompt engineering</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-white text-2xl font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Learn Fundamentals</h3>
                            <p className="text-gray-600">
                                Understand the core principles of effective prompt engineering and AI communication.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-white text-2xl font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Practice & Refine</h3>
                            <p className="text-gray-600">
                                Use our interactive tools to practice and refine your prompt crafting skills.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-white text-2xl font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Master Advanced Techniques</h3>
                            <p className="text-gray-600">
                                Implement advanced strategies for complex AI interactions and specialized use cases.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">What Our Users Say</h2>
                        <p className="text-gray-600 text-lg">Join thousands of successful prompt engineers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} className="text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4">
                                "This platform transformed how I interact with AI. My prompt success rate increased by 300%!"
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-semibold text-black">Sarah Chen</p>
                                    <p className="text-gray-500 text-sm">AI Researcher</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} className="text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4">
                                "The template library alone is worth it. Saved me countless hours of trial and error."
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-semibold text-black">Marcus Johnson</p>
                                    <p className="text-gray-500 text-sm">Content Creator</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} className="text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4">
                                "Finally, a comprehensive tool that makes prompt engineering accessible to everyone."
                            </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-semibold text-black">Alex Rivera</p>
                                    <p className="text-gray-500 text-sm">Developer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-black">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Master AI Prompt Engineering?
                    </h2>
                    <p className="text-gray-300 text-xl mb-8">
                        Join thousands of professionals who are already crafting better AI interactions.
                    </p>
                    <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300">
                        Start Your Journey Today
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <FaRobot className="h-6 w-6 mr-2" />
                                <span className="text-xl font-bold">PromptCraft</span>
                            </div>
                            <p className="text-gray-400">
                                Mastering the art of AI communication through professional prompt engineering.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Features</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">Templates</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Documentation</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Community</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 PromptCraft. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;