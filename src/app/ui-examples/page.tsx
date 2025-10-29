// "use client";

// import React, { useState } from "react";
// import { useToast, ToastContainer } from "@/components/ui/toast";
// import {
//   Loading,
//   Skeleton,
//   CardSkeleton,
//   TableSkeleton,
//   ButtonLoader,
// } from "@/components/ui/loading";
// import { handleError, handleAsync } from "@/lib/utils/errorHandler";

// /**
//  * Example component demonstrating all the new UI improvements
//  * This can be used as a reference for implementing these features
//  */
// export default function UIExamplesPage() {
//   const { toasts, closeToast, success, error, info, warning } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [showSkeletons, setShowSkeletons] = useState(false);

//   // Toast Examples
//   const handleShowSuccess = () => {
//     success("Success!", "Your action was completed successfully");
//   };

//   const handleShowError = () => {
//     error("Error Occurred", "Something went wrong. Please try again.");
//   };

//   const handleShowInfo = () => {
//     info("Information", "Here's some useful information for you");
//   };

//   const handleShowWarning = () => {
//     warning("Warning", "Please be careful with this action");
//   };

//   // Simulate API call with error handling
//   const simulateApiCall = async () => {
//     setLoading(true);

//     // Simulate delay
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     // Simulate error
//     const shouldError = Math.random() > 0.5;

//     if (shouldError) {
//       const mockError = {
//         response: {
//           status: 400,
//           data: {
//             message: "Invalid input provided",
//             description: "Please check your data and try again",
//           },
//         },
//       };

//       const appError = handleError(mockError);
//       error(appError.message, appError.description);
//     } else {
//       success("API Call Successful", "Data loaded successfully");
//     }

//     setLoading(false);
//   };

//   // Using handleAsync utility
//   const handleAsyncExample = async () => {
//     setLoading(true);

//     const mockAsyncOperation = async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1500));
//       if (Math.random() > 0.5) {
//         throw new Error("Random error occurred");
//       }
//       return { data: "Success data" };
//     };

//     const [err, data] = await handleAsync(mockAsyncOperation());

//     if (err) {
//       error(err.message, err.description);
//     } else {
//       success("Success!", `Received: ${data.data}`);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
//       <ToastContainer toasts={toasts} onClose={closeToast} />

//       <div className="container mx-auto px-4 max-w-6xl">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-800 mb-4">
//             🎨 UI Components Examples
//           </h1>
//           <p className="text-gray-600 text-lg">
//             Demonstrating the new toast notifications, loading states, and error
//             handling
//           </p>
//         </div>

//         {/* Toast Notifications Section */}
//         <section className="mb-12">
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               📢 Toast Notifications
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Beautiful, animated notifications with auto-dismiss
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <button
//                 onClick={handleShowSuccess}
//                 className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
//                 Show Success
//               </button>

//               <button
//                 onClick={handleShowError}
//                 className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
//                 Show Error
//               </button>

//               <button
//                 onClick={handleShowInfo}
//                 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
//                 Show Info
//               </button>

//               <button
//                 onClick={handleShowWarning}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
//                 Show Warning
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Loading States Section */}
//         <section className="mb-12">
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               ⏳ Loading States
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Various loading indicators for different scenarios
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm font-semibold text-gray-700 mb-4">
//                   Spinner
//                 </p>
//                 <Loading variant="spinner" size="md" />
//               </div>

//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm font-semibold text-gray-700 mb-4">Dots</p>
//                 <Loading variant="dots" size="md" />
//               </div>

//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm font-semibold text-gray-700 mb-4">
//                   Pulse
//                 </p>
//                 <Loading variant="pulse" size="md" />
//               </div>
//             </div>

//             <button
//               onClick={() => setShowSkeletons(!showSkeletons)}
//               className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md">
//               {showSkeletons ? "Hide" : "Show"} Skeleton Loaders
//             </button>
//           </div>
//         </section>

//         {/* Skeleton Loaders */}
//         {showSkeletons && (
//           <section className="mb-12">
//             <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-800 mb-4">
//                 💀 Skeleton Loaders
//               </h2>

//               <div className="space-y-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                     Basic Skeleton
//                   </h3>
//                   <Skeleton count={3} className="mb-2" />
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                     Card Skeleton
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <CardSkeleton count={2} />
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                     Table Skeleton
//                   </h3>
//                   <TableSkeleton rows={3} columns={4} />
//                 </div>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Error Handling Section */}
//         <section className="mb-12">
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               🛡️ Error Handling
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Comprehensive error handling with user-friendly messages
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <button
//                 onClick={simulateApiCall}
//                 disabled={loading}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
//                 {loading ? (
//                   <>
//                     <ButtonLoader className="mr-2" />
//                     Loading...
//                   </>
//                 ) : (
//                   "Simulate API Call"
//                 )}
//               </button>

//               <button
//                 onClick={handleAsyncExample}
//                 disabled={loading}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
//                 {loading ? (
//                   <>
//                     <ButtonLoader className="mr-2" />
//                     Loading...
//                   </>
//                 ) : (
//                   "Use handleAsync"
//                 )}
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Code Example Section */}
//         <section className="mb-12">
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">
//               💻 Code Example
//             </h2>

//             <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
//               <pre className="text-sm">
//                 {`import { useToast, ToastContainer } from "@/components/ui/toast";
// import { handleError } from "@/lib/utils/errorHandler";
// import { ButtonLoader } from "@/components/ui/loading";

// function MyComponent() {
//   const { toasts, closeToast, success, error } = useToast();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       const response = await api.post("/endpoint", data);
//       success("Success!", "Data saved successfully");
//     } catch (err) {
//       const appError = handleError(err);
//       error(appError.message, appError.description);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <ToastContainer toasts={toasts} onClose={closeToast} />
//       <button onClick={handleSubmit} disabled={loading}>
//         {loading ? <ButtonLoader /> : "Submit"}
//       </button>
//     </>
//   );
// }`}
//               </pre>
//             </div>
//           </div>
//         </section>

//         {/* Documentation Link */}
//         <section className="text-center">
//           <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-8 text-white">
//             <h2 className="text-2xl font-bold mb-4">📚 Full Documentation</h2>
//             <p className="mb-6">
//               Check out IMPROVEMENTS.md for complete documentation and usage
//               examples
//             </p>
//             <a
//               href="/IMPROVEMENTS.md"
//               className="inline-block bg-white text-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
//               View Documentation
//             </a>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
