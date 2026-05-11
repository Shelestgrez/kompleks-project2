import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { taskStatusLabel } from '../labels'
import { useI18n } from '../i18n'
import type { Task, TaskStatus } from '../types'

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

const colStyle: Record<TaskStatus, string> = {
  todo: 'border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50',
  in_progress: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30',
  review: 'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30',
  done: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30',
}

function sortInColumn(a: Task, b: Task) {
  const da = a.due_date || ''
  const db = b.due_date || ''
  if (da !== db) return da.localeCompare(db)
  return a.id - b.id
}

export function TaskKanban({
  tasks,
  onMove,
}: {
  tasks: Task[]
  onMove: (task: Task, newStatus: TaskStatus) => void
}) {
  const { lang, t } = useI18n()
  function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result
    if (!destination) return
    const newStatus = destination.droppableId as TaskStatus
    const id = Number(draggableId)
    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === newStatus) return
    onMove(task, newStatus)
  }

  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).sort(sortInColumn)

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {COLUMNS.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex w-64 shrink-0 flex-col rounded-xl border-2 p-2 min-h-[200px] transition-shadow ${
                  colStyle[status]
                } ${snapshot.isDraggingOver ? 'ring-2 ring-brand-500/40' : ''}`}
              >
                <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {taskStatusLabel(lang, status)}
                  <span className="ml-1.5 tabular-nums text-slate-400">({byStatus(status).length})</span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {byStatus(status).map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`rounded-lg bg-white dark:bg-slate-900 p-3 text-sm shadow-sm ring-1 ring-slate-200/90 dark:ring-slate-600 cursor-grab active:cursor-grabbing ${
                            dragSnapshot.isDragging ? 'shadow-lg ring-brand-400' : ''
                          }`}
                        >
                          <div className="font-medium text-slate-900 dark:text-slate-100 leading-snug">{task.title}</div>
                          {task.due_date && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              {t('kanban.duePrefix')} {task.due_date}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
