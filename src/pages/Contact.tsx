import React, { useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Helmet } from "react-helmet-async";
import emailjs from "@emailjs/browser";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  User, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building,
  HeadphonesIcon
} from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  agreeToTerms: boolean;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      setErrorMessage("Please agree to the terms.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await emailjs.send(
        "service_sly2uy9",
        "template_2xkewmc",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: formData.category,
          message: formData.message,
        },
        "YRT9ijVLkwdCCSc0o"
      );

      setSuccessMessage("✅ Thank you! Your message has been sent.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "",
        message: "",
        agreeToTerms: false,
      });
    } catch (error) {
      console.error("EmailJS Error:", error);
      setErrorMessage("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.category.trim() !== "" &&
    formData.message.trim() !== "" &&
    formData.agreeToTerms;

  return (
    <>
      <Helmet>
        <title>Contact Us - TemplaMart</title>
        <meta
          name="description"
          content="Get in touch with TemplaMart – the B2B marketplace for website templates. Contact us for support, seller inquiries, or partnership opportunities."
        />
        <link rel="canonical" href="https://templamart.com/contact" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 px-6 text-center">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Get in <span className="text-yellow-300">Touch</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're here to help! Reach out to our team for any questions, support, or partnership opportunities.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
              <Phone className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">+91 22 350 399 27</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
              <Mail className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">contact@templamart.com</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information Card */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Visit Our Office</h2>
                  <p className="text-gray-500">Come say hello at our headquarters</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sh N B2/A Grd Flr Mahavir,<br />
                      Ngr, Deepak Hospital, Mira Road,<br />
                      Thane, Maharashtra - 401107
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                    <a
                      href="tel:2235039927"
                      className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
                    >
                      +91 22 350 399 27
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <a
                      href="mailto:contact@templamart.com"
                      className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
                    >
                      contact@templamart.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We reply within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <HeadphonesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Quick Support</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Average response time: 2 hours
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  24/7 Support for urgent issues
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Dedicated account managers for sellers
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Send Message</h2>
                <p className="text-gray-500">Fill out the form below and we'll get back to you soon</p>
              </div>
            </div>

            {/* Success / Error messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">{successMessage}</span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Become a Seller">Become a Seller</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                  <option value="Payment Issues">Payment Issues</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Message *</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Please describe your inquiry in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              {/* Terms Checkbox */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeToTerms: Boolean(checked),
                      }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                      I Agree to Receive Updates, Offers, and Promotions via SMS, RCS, and WhatsApp.
                    </label>
                    <div className="flex gap-4 mt-2 text-sm">
                      <a
                        href="/terms"
                        className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Terms & Conditions
                      </a>
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Message...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </div>
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                We typically respond within 2-4 hours during business hours
              </p>
            </form>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-lg font-semibold text-gray-800">Support Available</div>
            <p className="text-gray-600 mt-2">For urgent issues and emergencies</p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100">
            <div className="text-4xl font-bold text-indigo-600 mb-2">2h</div>
            <div className="text-lg font-semibold text-gray-800">Avg. Response Time</div>
            <p className="text-gray-600 mt-2">During business hours</p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
            <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-lg font-semibold text-gray-800">Satisfaction Rate</div>
            <p className="text-gray-600 mt-2">From our customers</p>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default Contact;