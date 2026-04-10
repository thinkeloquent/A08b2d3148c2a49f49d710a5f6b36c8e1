import React, { useState } from "react";

export default function PolicyForm() {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    request_definition: "",
    policy_definition: "",
    role_definition: "",
    policy_effect: "",
    matchers: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    name: false,
    request_definition: false,
    policy_definition: false,
    role_definition: false,
    policy_effect: false,
    matchers: false,
  });

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = true;
        isValid = false;
      } else {
        newErrors[field] = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        show: true,
        message: "Please fill in all required fields",
        type: "error",
      });

      setTimeout(() => {
        setAlert({ show: false, message: "", type: "success" });
      }, 4000);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:3000/api/admin/policies/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setAlert({
          show: true,
          message: "Policy created successfully!",
          type: "success",
        });

        setFormData({
          name: "",
          request_definition: "",
          policy_definition: "",
          role_definition: "",
          policy_effect: "",
          matchers: "",
        });
      } else {
        setAlert({
          show: true,
          message: "Failed to create policy. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: `Error: ${error.message}`,
        type: "error",
      });
    }

    setTimeout(() => {
      setAlert({ show: false, message: "", type: "success" });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {alert.show && (
          <div
            className={`mb-6 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              alert.type === "success"
                ? "bg-green-100 border-l-4 border-green-500 text-green-700"
                : "bg-red-100 border-l-4 border-red-500 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {alert.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create New Policy</h1>
            <p className="text-indigo-100 mt-2">
              Fill in the policy details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Policy Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.name
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter policy name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="request_definition"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Request Definition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="request_definition"
                name="request_definition"
                value={formData.request_definition}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.request_definition
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter request definition"
              />
              {errors.request_definition && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="policy_definition"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Policy Definition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="policy_definition"
                name="policy_definition"
                value={formData.policy_definition}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.policy_definition
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter policy definition"
              />
              {errors.policy_definition && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role_definition"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Role Definition <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="role_definition"
                name="role_definition"
                value={formData.role_definition}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.role_definition
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter role definition"
              />
              {errors.role_definition && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="policy_effect"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Policy Effect <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="policy_effect"
                name="policy_effect"
                value={formData.policy_effect}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.policy_effect
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter policy effect"
              />
              {errors.policy_effect && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="matchers"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Matchers <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="matchers"
                name="matchers"
                value={formData.matchers}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.matchers
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Enter matchers"
              />
              {errors.matchers && (
                <p className="mt-1 text-sm text-red-600">
                  This field is required
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Create Policy
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            All fields marked with <span className="text-red-500">*</span> are
            required
          </p>
        </div>
      </div>
    </div>
  );
}
