"use client";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Bell,
  MessageCircle,
  Users,
  Globe,
  Shield,
  Smartphone,
  Calendar,
  Building2,
} from "lucide-react";

const Overview = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Hero Section with Islamic Pattern */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20 overflow-hidden">
          {/* Islamic Pattern Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                Eqariah
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-green-100">
                Connecting Communities, Strengthening Faith
              </p>
              <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto">
                A modern platform designed to bridge the gap between mosques and
                their communities through seamless communication and engagement
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="text-center mb-12">
                <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                  <Building2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Our Mission
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-600 mx-auto mb-6"></div>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center max-w-4xl mx-auto">
                Eqariah was created with a simple yet powerful vision: to
                empower mosques in managing their communities more effectively
                while providing congregants with easy access to important
                announcements, events, and community interactions.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                In today&apos;s digital age, we believe that Islamic
                institutions should have access to modern tools that help them
                serve their communities better. Eqariah bridges this gap by
                providing an intuitive, user-friendly platform that brings the
                mosque experience into the digital realm.
              </p>
            </div>

            {/* Features Grid */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                Key Features
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border-t-4 border-green-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-green-100 rounded-full mb-4">
                      <Bell className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Real-time Announcements
                    </h3>
                    <p className="text-gray-600">
                      Stay updated with instant notifications about prayer
                      times, events, and important community news
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border-t-4 border-blue-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Community Chat
                    </h3>
                    <p className="text-gray-600">
                      Connect with fellow community members, ask questions, and
                      engage in meaningful discussions
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border-t-4 border-purple-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-purple-100 rounded-full mb-4">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Event Management
                    </h3>
                    <p className="text-gray-600">
                      Easily manage and discover upcoming Islamic events,
                      programs, and activities
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 border-t-4 border-amber-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-amber-100 rounded-full mb-4">
                      <Users className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Community Building
                    </h3>
                    <p className="text-gray-600">
                      Foster stronger bonds within your mosque community through
                      shared experiences and interactions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* For Mosques */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">For Mosque Admins</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Secure and easy-to-use admin dashboard for managing
                      announcements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Reach your entire community instantly with a single post
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Better engagement and communication with congregants
                    </span>
                  </li>
                </ul>
              </div>

              {/* For Community Members */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">For Community Members</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Smartphone className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Access mosque updates anytime, anywhere from your device
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Bell className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Never miss important announcements or event updates
                    </span>
                  </li>
                  <li className="flex items-start">
                    <MessageCircle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Connect with fellow community members and build
                      relationships
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-2xl p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-green-50">
                Join hundreds of mosques and thousands of community members
                already using Eqariah
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                  Create Account
                </a>
                <a
                  href="/instructions"
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-300">
                  Learn How It Works
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Overview;
