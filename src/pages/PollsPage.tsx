import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import CreatePollModal from '@/components/modals/CreatePollModal';
import ViewPollModal from '@/components/modals/ViewPollModal';
import EditPollModal from '@/components/modals/EditPollModal';
import { QuestionSerialzer, ResponseReport } from '@/types/poll.type';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { createQuestion, deleteQuestion, getQuestionById, getQuestions, updateQuestion, reportAnswers } from '@/lib/api/endpoints/polls';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PollsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<QuestionSerialzer | null>(null);
  const [selectedPollForEdit, setSelectedPollForEdit] = useState<QuestionSerialzer | null>(null);
  const [reports, setReports] = useState<{ [key: string]: ResponseReport }>({}); // State to store reports
  const toast = useToast();

  // Fetch questions with pagination
  const { data: pollsData, isLoading: pollsLoading, error: pollsError, refetch } = useApiQuery(
    ['polls', page.toString()],
    () => getQuestions(), // Adjust this if your API supports pagination
    {
      keepPreviousData: true,
    }
  );

  // Mutation for creating a question
  const createPollMutation = useApiMutation(createQuestion, {
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      toast.success('نظرسنجی با موفقیت ایجاد شد');
    },
    onError: (error) => {
      toast.error('خطا در ایجاد نظرسنجی');
      console.error('Failed to create poll:', error);
    },
  });

  // Mutation for deleting a question
  const deletePollMutation = useApiMutation(deleteQuestion, {
    onSuccess: () => {
      refetch();
      toast.success('نظرسنجی با موفقیت حذف شد');
    },
    onError: (error) => {
      toast.error('خطا در حذف نظرسنجی');
      console.error('Failed to delete poll:', error);
    },
  });

  // Mutation for updating a question
  const updatePollMutation = useApiMutation(
    async ({ id, questionData }: { id: string; questionData: QuestionSerialzer }) => {
      return updateQuestion(id, questionData);
    },
    {
      onSuccess: () => {
        refetch();
        setSelectedPollForEdit(null); // Close the edit modal
        toast.success('نظرسنجی با موفقیت ویرایش شد');
      },
      onError: (error) => {
        toast.error('خطا در ویرایش نظرسنجی');
        console.error('Failed to update poll:', error);
      },
    }
  );

  // Fetch report data for each question
  useEffect(() => {
    const fetchReports = async () => {
      if (pollsData) {
        const reportsData: { [key: string]: ResponseReport } = {};
        for (const poll of pollsData) {
          try {
            const report = await reportAnswers(poll.id);
            reportsData[poll.id] = report;
          } catch (error) {
            console.error(`Failed to fetch report for poll ${poll.id}:`, error);
          }
        }
        setReports(reportsData);
      }
    };

    fetchReports();
  }, [pollsData]);

  // Emoji data for bar chart
  const emojiData = [
    { name: '😠 Worst', valueKey: 'worst', emoji: '😠' },
    { name: '😞 Bad', valueKey: 'bad', emoji: '😞' },
    { name: '😐 Middle', valueKey: 'middle', emoji: '😐' },
    { name: '🙂 Good', valueKey: 'good', emoji: '🙂' },
    { name: '🥰 Perfect', valueKey: 'perfect', emoji: '🥰' },
  ];

  // Transform report data for bar chart
  const transformReportData = (report: ResponseReport) => {
    return emojiData.map((item) => ({
      name: item.name,
      value: parseInt(report[item.valueKey as keyof ResponseReport]),
      emoji: item.emoji,
    }));
  };

  // Handle creating a new poll
  const handleCreatePoll = async (pollData: QuestionSerialzer) => {
    try {
      await createPollMutation.mutateAsync(pollData);
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  // Handle viewing a poll
  const handleViewPoll = async (id: string) => {
    try {
      const poll = await getQuestionById(id);
      setSelectedPoll(poll);
    } catch (error) {
      console.error('Failed to fetch poll details:', error);
    }
  };

  // Handle deleting a poll
  const handleDeletePoll = async (id: string) => {
    if (window.confirm('آیا از حذف این نظرسنجی اطمینان دارید؟')) {
      try {
        await deletePollMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete poll:', error);
      }
    }
  };

  // Handle editing a poll
  const handleEditPoll = async (id: string, updatedData: Partial<QuestionSerialzer>) => {
    try {
      await updatePollMutation.mutateAsync({ id, questionData: updatedData as QuestionSerialzer });
    } catch (error) {
      console.error('Failed to update poll:', error);
    }
  };

  // Filter polls by search term (client-side filtering)
  const filteredPolls = pollsData?.filter((poll: QuestionSerialzer) => {
    const matchesSearch = poll.translations[0].text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{translations.polls.polls}</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="ml-2" />
            {translations.polls.addPoll}
          </button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`${translations.common.search} ${translations.polls.polls}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {pollsLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">{translations.common.loading}</p>
          </div>
        ) : pollsError ? (
          <div className="mt-6 text-center">
            <p className="text-red-500">{translations.common.error}</p>
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.polls.id}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.polls.question}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPolls && filteredPolls.length > 0 ? (
                    filteredPolls.map((poll) => (
                      <tr key={poll.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {poll.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {poll.translations[0].text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleViewPoll(poll.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {translations.common.view}
                            </button>
                            <button
                              onClick={() => setSelectedPollForEdit(poll)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePoll(poll.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {translations.common.noResults}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Grid of bar charts */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolls && filteredPolls.map((poll) => (
                <div key={poll.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">{poll.translations[0].text}</h3>
                  {reports[poll.id] ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={transformReportData(reports[poll.id])}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          content={({ payload }) => (
                            <div className="bg-white p-2 border border-gray-300 rounded shadow">
                              <p className="text-sm">{payload?.[0]?.payload.name}</p>
                              <p className="text-sm font-semibold">
                                {payload?.[0]?.value} responses
                              </p>
                            </div>
                          )}
                        />
                        {/* <Legend /> */}
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No report data available</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modals */}
        <CreatePollModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePoll}
        />

        {selectedPoll && (
          <ViewPollModal
            isOpen={!!selectedPoll}
            onClose={() => setSelectedPoll(null)}
            poll={selectedPoll}
          />
        )}

        {selectedPollForEdit && (
          <EditPollModal
            isOpen={!!selectedPollForEdit}
            onClose={() => setSelectedPollForEdit(null)}
            onSubmit={handleEditPoll}
            poll={selectedPollForEdit}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PollsPage;