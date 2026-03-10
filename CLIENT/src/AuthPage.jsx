// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
  FaTwitter,
  FaRocket,
  FaShieldAlt,
  FaLightbulb,
  FaCheckCircle,
} from "react-icons/fa";
import axios from "axios";
import api from "./axiosInstance";
import { useNavigate } from "react-router-dom";

// Uses the same base URL from axiosInstance (configurable via VITE_API_BASE env var)
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v7";
const REGISTER_URL = `${API_BASE}/register/`;
const LOGIN_URL = `${API_BASE}/login/`;

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // ---------- LOGIN: Only username + password ----------
        const payload = {
          username: formData.username,
          password: formData.password,
        };

        const { data } = await axios.post(LOGIN_URL, payload);

        console.log("Login success:", data);
        if (data.access) localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        navigate("/dashboard");
      } else {
        // ---------- REGISTER ----------
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        const { data } = await axios.post(REGISTER_URL, payload);
        console.log("Register success:", data);

        // Auto-login after register
        const loginRes = await axios.post(LOGIN_URL, {
          username: payload.username,
          password: payload.password
        });

        localStorage.setItem("access_token", loginRes.data.access);
        localStorage.setItem("refresh_token", loginRes.data.refresh);

        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.email?.[0] ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  const loginFeatures = [
    { icon: FaRocket, title: "Fast Access", description: "Get instant access to your AI prompt workspace" },
    { icon: FaShieldAlt, title: "Secure & Private", description: "Your data is encrypted and protected" },
    { icon: FaLightbulb, title: "Smart Features", description: "Access advanced prompt engineering tools" },
  ];

  const registerFeatures = [
    { icon: FaCheckCircle, title: "Start Free", description: "14-day free trial with all features included" },
    { icon: FaRocket, title: "Premium Templates", description: "Access 100+ professional prompt templates" },
    { icon: FaShieldAlt, title: "Team Collaboration", description: "Share and collaborate with your team" },
  ];

  const features = isLogin ? loginFeatures : registerFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaRocket className="h-8 w-8 text-black mr-2" />
            <span className="text-2xl font-bold text-black">PromptCraft</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? "Welcome Back" : "Join PromptCraft"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Sign in to your account to continue your AI journey"
              : "Create your account and start mastering AI prompts"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ---------- FORM SIDE ---------- */}
            <div className="p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                {/* Social buttons */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:border-black transition duration-300">
                    <FaGoogle className="text-gray-600" />
                  </button>
                  <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:border-black transition duration-300">
                    <FaGithub className="text-gray-600" />
                  </button>
                  <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:border-black transition duration-300">
                    <FaTwitter className="text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center mb-8">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* ---------- FORM ---------- */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* ========== LOGIN: ONLY USERNAME + PASSWORD ========== */}
                  {isLogin && (
                    <>
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="johndoe"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me + Forgot Password */}
                      <div className="flex items-center justify-between mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-black hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    </>
                  )}

                  {/* ========== REGISTER: ALL FIELDS ========== */}
                  {!isLogin && (
                    <>
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="John"
                            required
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="johndoe"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition duration-300"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I agree to the{" "}
                          <a href="#" className="text-black hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-black hover:underline">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                    </>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-300 disabled:opacity-60"
                  >
                    {loading ? "Processing…" : isLogin ? "Sign In" : "Create Account"}
                  </button>
                </form>

                {/* Toggle Form */}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="text-black font-semibold hover:underline focus:outline-none"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- CONTENT SIDE ---------- */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 lg:p-12 flex items-center">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    {isLogin ? "Welcome Back!" : "Join Our Community"}
                  </h2>
                  <p className="text-gray-300 text-lg">
                    {isLogin
                      ? "Continue your journey in AI prompt engineering"
                      : "Start creating amazing AI prompts today"}
                  </p>
                </div>

                <div className="space-y-6">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                        <f.icon className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                        <p className="text-gray-300">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-gray-300 text-sm">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-gray-300 text-sm">Prompts Created</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">99%</div>
                      <div className="text-gray-300 text-sm">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            © 2025 PromptCraft. All rights reserved.{" "}
            <a href="#" className="text-black hover:underline ml-2">
              Need help?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;