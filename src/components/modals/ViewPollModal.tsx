import React from "react";
import { X, Calendar, List } from "lucide-react";
import { QuestionSerialzer } from "@/types/poll.type";

interface ViewPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: QuestionSerialzer;
}

const ViewPollModal: React.FC<ViewPollModalProps> = ({
  isOpen,
  onClose,
  poll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Poll Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4">
            {/* Poll Header */}
            <div className="flex items-start">
              <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <List size={32} className="text-gray-400" />
              </div>
              <div className="ml-6 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {poll.translations[0].text}
                </h2>
                {/* <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      poll.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {poll.is_active ? "Active" : "Inactive"}
                  </span>
                </div> */}
              </div>
            </div>

            {/* Poll Details Grid */}
            {/* <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2"> */}
              {/* <div className="border rounded-lg p-4">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  Created At
                </div>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(poll.created_at).toLocaleDateString("fa-IR")}
                </div>
              </div> */}

              {/* <div className="border rounded-lg p-4">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  Updated At
                </div>
                <div className="mt-1 text-sm text-gray-900">
                  {new Date(poll.updated_at).toLocaleDateString("fa-IR")}
                </div>
              </div> */}
            {/* </div> */}

            {/* Poll Options */}
            {/* <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Options
              </h4>
              <div className="space-y-4">
                {poll.options.map((option, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Option {index + 1}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-900">
                      {option.text}
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Footer */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPollModal;
