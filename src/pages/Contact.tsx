// ContactPage.jsx
import React, { useState } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { Helmet } from "react-helmet-async";
import emailjs from "@emailjs/browser";

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

  // ✅ Form validation: all required fields must be filled + agreeToTerms checked
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.category.trim() !== "" &&
    formData.message.trim() !== "" &&
    formData.agreeToTerms;

  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>Contact Us - TemplaMart</title>
        <meta
          name="description"
          content="Get in touch with TemplaMart – the B2B marketplace for website templates. Contact us for support, seller inquiries, or partnership opportunities."
        />
        <link rel="canonical" href="https://www.templamart.com/contact" />
      </Helmet>

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6 text-center shadow-lg mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col-reverse md:flex-row gap-10 md:gap-0">
          {/* Contact Info */}
          <div className="space-y-6 px-4 md:px-0 flex flex-col justify-center mx-auto w-[100%]">
            <div>
              <h2 className="text-xl font-semibold mb-1">Address</h2>
              <p>
                Sh N B1/A Grd Flr Mahavir,
                <br />
                Ngr, Deepak Hospital, Mira Road,
                <br />
                Thane, Maharashtra - 401107
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Phone</h2>
              <p>
                <a
                  href="tel:9136914963"
                  className="text-blue-600 hover:underline"
                >
                  +91 91 369 14 963
                </a>
              </p>
              <p>
                <a
                  href="tel:2235039927"
                  className="text-blue-600 hover:underline"
                >
                  +91 22 350 399 27
                </a>
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Email</h2>
              <p>contact@templamart.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full md:w-auto md:w-[100%]">
            <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
              Contact Our Support Team
            </h2>

            {/* Success / Error messages */}
            {successMessage && (
              <p className="text-green-600 mb-2">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-600 mb-2">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Category</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Order Support">Order Support</option>
                <option value="Become a Seller">Become a Seller</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="Payment Issues">Payment Issues</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                name="message"
                rows={4}
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg"
              ></textarea>

              {/* Checkbox */}
              <div className="flex items-center space-x-2">
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
                />
                <label htmlFor="terms" className="text-sm font-medium">
                  I Agree to Receive Updates, Offers, and Promotions via SMS, RCS, and WhatsApp.
                </label>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href="/terms"
                  className="text-blue-600 hover:underline"
                >
                  T & C
                </a>{" "}
                |{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </a>
              </div>

              {/* ✅ Disabled until valid */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-2 rounded-lg text-white transition ${
                  isFormValid && !loading
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
