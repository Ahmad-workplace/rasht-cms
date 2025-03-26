import React, { useEffect, useState } from "react";
import { X, Globe, BarChart as ChartIcon } from "lucide-react";
import { QuestionSerialzer, ResponseReport } from "@/types/poll.type";
import { reportAnswers } from "@/lib/api/endpoints/polls";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [reportData, setReportData] = useState<ResponseReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!poll.id) return;
      
      setIsLoading(true);
      try {
        const data = await reportAnswers(poll.id);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, poll.id]);

  const transformReportData = () => {
    if (!reportData) return [];

    return [
      { name: '😠 خیلی بد', value: parseInt(reportData.worst) },
      { name: '😞 بد', value: parseInt(reportData.bad) },
      { name: '😐 متوسط', value: parseInt(reportData.middle) },
      { name: '🙂 خوب', value: parseInt(reportData.good) },
      { name: '🥰 عالی', value: parseInt(reportData.perfect) },
    ];
  };

  const getTotalResponses = () => {
    if (!reportData) return 0;
    return Object.values(reportData).reduce((sum, val) => sum + parseInt(val), 0);
  };

  if (!isOpen) return null;

  const faTranslation = poll.translations.find(t => t.language_code === 'fa');
  const enTranslation = poll.translations.find(t => t.language_code === 'en');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">مشاهده نظرسنجی</h3>
          </div>

          <div className="space-y-6">
            {/* Persian Translation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-700">فارسی</h4>
              </div>
              <p className="text-gray-900">{faTranslation?.text}</p>
            </div>

            {/* English Translation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-700">English</h4>
              </div>
              <p className="text-gray-900">{enTranslation?.text}</p>
            </div>

            {/* Statistics Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <ChartIcon className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-700">آمار پاسخ‌ها</h4>
                <span className="text-sm text-gray-500">
                  (مجموع: {getTotalResponses()} پاسخ)
                </span>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : reportData ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transformReportData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          return (
                            <div className="bg-white p-2 border border-gray-200 rounded shadow">
                              <p className="text-sm">
                                {payload[0].payload.name}: {payload[0].value} پاسخ
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  خطا در دریافت آمار
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPollModal;