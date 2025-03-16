import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { Task as TaskType } from './types';

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: TaskType[];
  timeSlot: string;
  onResize: (taskId: string, change: number) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  columnWidth: number;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, timeSlot, onResize, onDelete, onEdit, columnWidth }) => {
  const droppableId = `${column.id}-${timeSlot}`;

  const getColumnSpan = (task: TaskType) => {
    const durationInSlots = Math.ceil(task.duration / 30);
    return durationInSlots;
  };

  const shouldRenderTask = (task: TaskType) => {
    return timeSlot === task.time;
  };

  const tasksToRender = tasks.filter(shouldRenderTask);

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[4rem] flex flex-col gap-1 p-1 transition-all duration-300 ease-in-out ${
            snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
          }`}
          style={{
            height: `${Math.max(64, tasksToRender.length * 40)}px`
          }}
        >
          {tasksToRender.map((task, index) => (
            <Task 
              key={task.id} 
              task={task} 
              index={index} 
              columnSpan={getColumnSpan(task)}
              onResize={onResize}
              onDelete={onDelete}
              onEdit={onEdit}
              columnWidth={columnWidth}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Column;