import React from "react";
import { Link } from "react-router-dom";
import image from "../img/about-us-banner.jpg";
import { 
  Target, 
  Palette, 
  Shield, 
  Users, 
  TrendingUp, 
  Heart, 
  CheckCircle,
  Sparkles,
  Star,
  Zap,
  Globe,
  ThumbsUp
} from "lucide-react";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/50">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-1/4 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl"></div>
            </div>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 mb-4">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">About Templamart</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            Crafting Digital
                        </span>
                        <br />
                        <span className="text-slate-800">Experiences That Sell</span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        High-quality eCommerce templates, powered by{" "}
                        <span className="font-semibold text-blue-700">Jaikalki Technology Pvt. Ltd.</span>
                    </p>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-12">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="text-2xl font-bold text-blue-700">500+</div>
                            <div className="text-sm text-slate-600">Templates</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="text-2xl font-bold text-indigo-700">10K+</div>
                            <div className="text-sm text-slate-600">Customers</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="text-2xl font-bold text-violet-700">24/7</div>
                            <div className="text-sm text-slate-600">Support</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="text-2xl font-bold text-cyan-700">99%</div>
                            <div className="text-sm text-slate-600">Satisfaction</div>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="mt-16 relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-xl opacity-20"></div>
                    <img
                        src={image}
                        alt="eCommerce Templates"
                        className="relative w-full max-w-5xl mx-auto rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl border-8 border-white"
                    />
                </div>
            </section>

            {/* Content Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Mission Card */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 h-full border border-slate-200">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
                                <Target className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                At Templamart, we aim to simplify the way businesses build and enhance their online stores.
                                Our templates empower brands with modern, customizable designs that are both functional and beautiful.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-blue-600">
                                <Heart className="h-4 w-4" />
                                <span className="text-sm font-medium">Driven by Passion</span>
                            </div>
                        </div>
                    </div>

                    {/* What We Offer Card */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 h-full border border-slate-200">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-6">
                                <Palette className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">What We Offer</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-700">Extensive Template Library:</span>
                                        <p className="text-slate-600">Professionally crafted designs for various platforms.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-700">User-Friendly Designs:</span>
                                        <p className="text-slate-600">Easily customizable themes for diverse industries.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-slate-700">Responsive Support:</span>
                                        <p className="text-slate-600">Dedicated experts ready to assist anytime.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Why Choose Us - Full Width */}
                    <div className="md:col-span-2 group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-500"></div>
                        <div className="relative bg-white rounded-2xl shadow-xl p-8 border-l-8 border-blue-500">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                                        <Zap className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Us?</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                        We blend aesthetics with usability, keeping your business future-ready. Our templates
                                        follow the latest design trends and are updated regularly with powerful features. We
                                        stand for quality, reliability, and great user experiences.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-slate-700">Reliable</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm text-slate-700">High Quality</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-slate-700">Future-Ready</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm text-slate-700">User-Focused</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-2 mt-8">
                        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl p-8 text-center border border-slate-200">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Connect With Us</h2>
                            </div>
                            
                            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                                We're constantly improving. Your feedback helps us grow. Reach out via our{" "}
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-all group"
                                >
                                    Contact Us
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                                {" "}page.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <Link
                                    to="/contact"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    Get In Touch
                                </Link>
                                <Link
                                    to="/"
                                    className="px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-300 hover:border-slate-400 hover:shadow-md transition-all duration-300"
                                >
                                    Explore Templates
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating CTA */}
                <div className="fixed bottom-8 right-8 z-50">
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-bounce"
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Start Building</span>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;