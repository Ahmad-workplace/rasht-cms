import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ChevronLeft, ChevronRight, Image, Play, X, Edit } from 'lucide-react';
import { Task as TaskType } from './types';

interface TaskProps {
  task: TaskType;
  index: number;
  columnSpan: number;
  onResize: (taskId: string, change: number) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  columnWidth: number;
}

const TASK_COLORS = [
  'bg-blue-50 hover:bg-blue-100',
  'bg-purple-50 hover:bg-purple-100',
  'bg-green-50 hover:bg-green-100',
  'bg-amber-50 hover:bg-amber-100',
  'bg-rose-50 hover:bg-rose-100',
];

const Task: React.FC<TaskProps> = ({ task, index, columnSpan, onResize, onDelete, onEdit, columnWidth }) => {
  const colorIndex = parseInt(task.id.split('-')[1]) % TASK_COLORS.length || 0;
  const baseColor = TASK_COLORS[colorIndex];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`h-8 rounded-md shadow-sm group transition-all duration-300 ease-in-out ${baseColor} ${
            snapshot.isDragging ? 'shadow-lg scale-[1.02]' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            width: `calc(${columnSpan * columnWidth}px - 2px)`,
            transform: snapshot.isDragging 
              ? provided.draggableProps.style?.transform
              : 'none',
            zIndex: snapshot.isDragging ? 50 : 10,
          }}
        >
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between h-full px-1 relative"
          >
            <button
              onClick={() => onResize(task.id, -30)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-20"
              title="کاهش مدت"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <div className="flex items-center flex-1 min-w-0 px-3">
              {task.mediaType && (
                <div className="ml-2">
                  {task.mediaType === 'mp4' ? (
                    <Play className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Image className="w-3 h-3 text-gray-500" />
                  )}
                </div>
              )}
              {task.thumbnail && (
                <img 
                  src={task.thumbnail} 
                  alt="" 
                  className="w-6 h-6 object-cover rounded ml-2"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{task.content}</div>
                <div className="text-[10px] text-gray-500">
                  {task.duration} دقیقه
                </div>
              </div>
              {task.day && task.time && (
                <div className="flex items-center space-x-1 space-x-reverse">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(task.id)}
                      className="ml-2 text-gray-400 hover:text-indigo-500 transition-colors"
                      title="ویرایش"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(task.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="حذف از برنامه"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => onResize(task.id, 30)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-20"
              title="افزایش مدت"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;