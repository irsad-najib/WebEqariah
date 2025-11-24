"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  Building2,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const Instructions = () => {
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "How do I register for an account?",
      answer:
        'Click on the "Register" button in the top right corner, fill in your details including username, email, and password, then submit the form.',
    },
    {
      question:
        "What's the difference between a user and mosque admin account?",
      answer:
        "Regular users can view announcements and participate in community chats. Mosque admins can also create and manage announcements for their mosque.",
    },
    {
      question: "How do I register my mosque?",
      answer:
        'Navigate to "Register Mosque" from the menu, fill in all required information about your mosque, and submit for approval by the system administrator.',
    },
    {
      question: "Can I follow multiple mosques?",
      answer:
        "Yes! You can follow any number of mosques to receive their announcements and stay connected with multiple communities.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use industry-standard encryption and security practices to protect your personal information and ensure data privacy.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full mb-6">
                <Info className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                How to Use Eqariah
              </h1>
              <p className="text-xl text-blue-100">
                A comprehensive guide to get you started with our platform
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Tab Selector */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("user")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                <User className="w-5 h-5" />
                For Users
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                <Building2 className="w-5 h-5" />
                For Mosque Admins
              </button>
            </div>
          </div>

          {/* User Instructions */}
          {activeTab === "user" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Create Your Account
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by registering for a free account. You&apos;ll need
                      to provide:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>A unique username</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Your email address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>A secure password</span>
                      </li>
                    </ul>
                    <a
                      href="/register"
                      className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                      Register Now →
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-blue-600" />
                      View Announcements
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Once logged in, you&apos;ll see your dashboard with
                      announcements from mosques you follow. Each announcement
                      includes:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Title and detailed content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Images or media attachments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Date and time of posting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Mosque information</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      Join Community Chats
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect with other community members through the chat
                      feature:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access the chat sidebar on your dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Send messages to your mosque community</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Participate in discussions and ask questions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Build meaningful connections</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Discover Mosques
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Browse and connect with mosques in your area:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Visit the mosque list page to see all registered
                          mosques
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>View detailed information about each mosque</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Follow mosques to receive their updates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mosque Admin Instructions */}
          {activeTab === "admin" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Register Your Mosque
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Before creating announcements, you need to register your
                      mosque:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Navigate to &quot;Register Mosque&quot; in the menu
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Fill in all required information (name, address,
                          contact details)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Upload a clear image of your mosque</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Wait for admin approval (usually within 24-48 hours)
                        </span>
                      </li>
                    </ul>
                    <a
                      href="/register-mosque"
                      className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold">
                      Register Mosque →
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Access Admin Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Once your mosque is approved and you&apos;re set as an
                      admin:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Log in with your mosque admin account credentials
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          You&apos;ll be automatically redirected to your admin
                          dashboard
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          View your mosque&apos;s profile and community
                          statistics
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-green-600" />
                      Create Announcements
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Share important updates with your community:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Click &quot;Create New Announcement&quot; on your
                          dashboard
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Add a clear, descriptive title</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Write your message using the rich text editor
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Optionally add images or media</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Preview and publish to all your followers instantly
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Manage Your Community
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Keep your community engaged and informed:
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>
                          Monitor community chat and participate in discussions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>View announcement engagement and reach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Update mosque information as needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Respond to community questions and feedback</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-600 mx-auto"></div>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200">
                    <span className="font-semibold text-gray-800">
                      {faq.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Need Help Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Our support team is here to assist you with any questions
              </p>
              <a
                href="mailto:support@eqariah.com"
                className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Instructions;
