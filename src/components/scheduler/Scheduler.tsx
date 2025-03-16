import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import Task from './Task';
import TranslationDialog from './TranslationDialog';
import { Task as TaskType, WeeklyData, TaskTranslation } from './types';
import { translations } from '@/lib/constants/translations';

interface TimeRange {
  start: string; // Format: "HH:mm"
  end: string; // Format: "HH:mm"
}

interface SchedulerProps {
  initialTasks: TaskType[];
  onTaskUpdate?: (tasks: TaskType[]) => void;
  timeRange?: TimeRange;
  columnWidth?: number; // Width in pixels
  timeSlotInterval?: number; // Interval in minutes
}

// Reorder days to start from Saturday
export const DAYS_OF_WEEK = [
  translations.playlists.days.saturday,
  translations.playlists.days.sunday,
  translations.playlists.days.monday,
  translations.playlists.days.tuesday,
  translations.playlists.days.wednesday,
  translations.playlists.days.thursday,
  translations.playlists.days.friday,
];

const Scheduler: React.FC<SchedulerProps> = ({ 
  initialTasks, 
  onTaskUpdate,
  timeRange = { start: "00:00", end: "23:59" },
  columnWidth = 120,
  timeSlotInterval = 30
}) => {
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Generate time slots based on range and interval
  const TIME_SLOTS = useMemo(() => {
    const slots: string[] = [];
    const [startHour, startMinute] = timeRange.start.split(':').map(Number);
    const [endHour, endMinute] = timeRange.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time <= endTime; time += timeSlotInterval) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
    
    return slots;
  }, [timeRange, timeSlotInterval]);

  const [data, setData] = useState<WeeklyData>(() => ({
    tasks: initialTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, TaskType>),
    columns: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = {
        id: day,
        title: day,
        taskIds: initialTasks
          .filter(task => task.day === day)
          .map(task => task.id),
      };
      return acc;
    }, {} as WeeklyData['columns']),
    columnOrder: DAYS_OF_WEEK,
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const [destDay, destTime] = destination.droppableId.split('-');

    // If the task is already scheduled, just move it without opening the dialog
    if (source.droppableId !== 'task-list') {
      const newData = {
        ...data,
        tasks: {
          ...data.tasks,
          [draggableId]: {
            ...data.tasks[draggableId],
            day: destDay,
            time: destTime,
          },
        },
      };

      setData(newData);
      if (onTaskUpdate) {
        onTaskUpdate(Object.values(newData.tasks));
      }
      return;
    }

    // For new tasks from the task list, open the translation dialog
    setEditingTaskId(draggableId);
    setIsTranslationDialogOpen(true);

    // Update the task's position
    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [draggableId]: {
          ...data.tasks[draggableId],
          day: destDay,
          time: destTime,
        },
      },
    };

    setData(newData);
    if (onTaskUpdate) {
      onTaskUpdate(Object.values(newData.tasks));
    }
  };

  const handleResizeTask = (taskId: string, change: number) => {
    const task = data.tasks[taskId];
    const newDuration = Math.max(timeSlotInterval, task.duration + change);

    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: {
          ...task,
          duration: newDuration,
        },
      },
    };

    setData(newData);
    if (onTaskUpdate) {
      onTaskUpdate(Object.values(newData.tasks));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: {
          ...data.tasks[taskId],
          day: '',
          time: '',
        },
      },
    };

    setData(newData);
    if (onTaskUpdate) {
      onTaskUpdate(Object.values(newData.tasks));
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTranslationDialogOpen(true);
  };

  const handleTranslationSubmit = (translations: TaskTranslation[]) => {
    if (!editingTaskId) return;

    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [editingTaskId]: {
          ...data.tasks[editingTaskId],
          translations,
          content: translations.find(t => t.language_code === 'fa')?.title || data.tasks[editingTaskId].content,
        },
      },
    };

    setData(newData);
    if (onTaskUpdate) {
      onTaskUpdate(Object.values(newData.tasks));
    }

    setIsTranslationDialogOpen(false);
    setEditingTaskId(null);
  };

  const unscheduledTasks = Object.values(data.tasks).filter(
    task => !task.day && !task.time
  );

  const gridTemplateColumns = `100px repeat(${TIME_SLOTS.length}, ${columnWidth}px)`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8">
          {/* Task List */}
          <div className="w-64 bg-white rounded-lg p-4 self-start sticky top-8">
            <h2 className="text-lg font-semibold mb-4">برنامه‌های زمان‌بندی نشده</h2>
            <Droppable droppableId="task-list">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-2 min-h-[100px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  } rounded-md p-2`}
                >
                  {unscheduledTasks.map((task, index) => (
                    <Task
                      key={task.id}
                      task={task}
                      index={index}
                      columnSpan={1}
                      onResize={handleResizeTask}
                      columnWidth={columnWidth}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Schedule Table */}
          <div className="flex-1 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header row with time slots */}
                <div className="grid" style={{ gridTemplateColumns }}>
                  <div className="p-2 font-semibold bg-gray-100 border-b border-r border-gray-200">
                    روزها
                  </div>
                  {TIME_SLOTS.map(timeSlot => (
                    <div
                      key={timeSlot}
                      className="p-2 font-semibold bg-gray-100 border-b border-r border-gray-200 text-center whitespace-nowrap"
                    >
                      {timeSlot}
                    </div>
                  ))}
                </div>

                {/* Days and columns */}
                {DAYS_OF_WEEK.map(day => (
                  <div
                    key={day}
                    className="grid"
                    style={{ gridTemplateColumns }}
                  >
                    <div className="p-2 font-semibold border-b border-r border-gray-200 bg-gray-50">
                      {day}
                    </div>
                    {TIME_SLOTS.map(timeSlot => (
                      <div
                        key={`${day}-${timeSlot}`}
                        className="border-b border-r border-gray-200"
                      >
                        <Column
                          column={{ id: day, title: day }}
                          tasks={Object.values(data.tasks).filter(
                            task => task.day === day
                          )}
                          timeSlot={timeSlot}
                          onResize={handleResizeTask}
                          onDelete={handleDeleteTask}
                          onEdit={handleEditTask}
                          columnWidth={columnWidth}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>

      <TranslationDialog
        isOpen={isTranslationDialogOpen}
        onClose={() => {
          setIsTranslationDialogOpen(false);
          setEditingTaskId(null);
        }}
        onSubmit={handleTranslationSubmit}
        initialTranslations={
          editingTaskId
            ? data.tasks[editingTaskId].translations || [
                { title: '', description: '', language_code: 'fa' },
                { title: '', description: '', language_code: 'en' }
              ]
            : undefined
        }
      />
    </div>
  );
};

export default Scheduler;