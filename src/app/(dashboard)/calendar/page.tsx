"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/hooks/use-posts";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  X,
  Check,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ScheduledPost {
  id: string;
  content: string;
  date: Date;
  time: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Draggable Post Component
function DraggablePost({
  post,
  isExpanded,
  onToggleExpand,
  onCopy,
  copiedId,
}: {
  post: ScheduledPost;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: (content: string, id: string) => void;
  copiedId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { post },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="px-2 py-1 text-[11px] font-medium rounded bg-ecco-navy text-white truncate opacity-50"
      >
        {post.content.slice(0, 30)}...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onToggleExpand();
          }
        }}
        className={cn(
          "px-2 py-1 text-[11px] font-medium rounded bg-ecco-accent-light text-ecco-navy truncate cursor-pointer hover:bg-ecco-blue-pale transition-colors",
          isExpanded && "bg-ecco-navy text-white hover:bg-ecco-navy"
        )}
      >
        {post.content.slice(0, 30)}...
      </div>

      {isExpanded && (
        <div
          className="p-3 bg-white border border-ecco rounded-lg shadow-lg text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-ecco-tertiary">{post.time}</span>
            <button
              onClick={onToggleExpand}
              className="text-ecco-muted hover:text-ecco-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-ecco-primary whitespace-pre-wrap leading-relaxed mb-3 max-h-[150px] overflow-y-auto">
            {post.content}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs w-full"
            onClick={() => onCopy(post.content, post.id)}
          >
            {copiedId === post.id ? (
              <>
                <Check className="mr-1 h-3 w-3 text-ecco-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copy for Posting
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Droppable Day Cell Component
function DroppableDay({
  date,
  isCurrentMonth,
  isToday,
  posts,
  expandedPostId,
  onToggleExpand,
  onCopy,
  copiedId,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: ScheduledPost[];
  expandedPostId: string | null;
  onToggleExpand: (postId: string) => void;
  onCopy: (content: string, id: string) => void;
  copiedId: string | null;
}) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  const { isOver, setNodeRef } = useDroppable({
    id: dateKey,
    data: { date, year: date.getFullYear(), month: date.getMonth(), day: date.getDate() },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[110px] p-2 border-r border-b border-ecco-light transition-colors",
        !isCurrentMonth && "bg-gray-50/50",
        isOver && "bg-ecco-blue-pale/50"
      )}
    >
      <div
        className={cn(
          "text-sm font-medium mb-1.5",
          !isCurrentMonth && "text-ecco-muted",
          isCurrentMonth && "text-ecco-secondary"
        )}
      >
        {isToday ? (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ecco-navy text-white text-sm">
            {date.getDate()}
          </span>
        ) : (
          date.getDate()
        )}
      </div>
      <div className="space-y-1">
        {posts.map((post) => (
          <DraggablePost
            key={post.id}
            post={post}
            isExpanded={expandedPostId === post.id}
            onToggleExpand={() => onToggleExpand(post.id)}
            onCopy={onCopy}
            copiedId={copiedId}
          />
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { posts, loading, updatePost } = usePosts();

  // Convert scheduled posts from database to calendar format
  const scheduledPosts: ScheduledPost[] = useMemo(() => {
    return posts
      .filter((p) => p.status === "scheduled" && p.scheduled_at)
      .map((p) => {
        const scheduledDate = new Date(p.scheduled_at!);
        return {
          id: p.id,
          content: p.content,
          date: scheduledDate,
          time: scheduledDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        };
      });
  }, [posts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const today = new Date();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const endDate = new Date(lastDayOfMonth);
    const daysToAdd = 6 - lastDayOfMonth.getDay();
    endDate.setDate(endDate.getDate() + daysToAdd);

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(
      (post) =>
        post.date.getFullYear() === date.getFullYear() &&
        post.date.getMonth() === date.getMonth() &&
        post.date.getDate() === date.getDate()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setExpandedPostId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const postId = active.id as string;
    const dropData = over.data.current as { year: number; month: number; day: number } | undefined;

    if (!dropData) return;

    // Find the original post to get its time
    const originalPost = scheduledPosts.find((p) => p.id === postId);
    if (!originalPost) return;

    // Create new date with the same time
    const newDate = new Date(dropData.year, dropData.month, dropData.day);
    newDate.setHours(originalPost.date.getHours());
    newDate.setMinutes(originalPost.date.getMinutes());

    // Update in database
    await updatePost(postId, { scheduled_at: newDate.toISOString() });
  };

  const handleToggleExpand = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activePost = activeId ? scheduledPosts.find((p) => p.id === activeId) : null;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
              Calendar
            </h1>
            <p className="text-sm text-ecco-tertiary">
              View and manage your scheduled posts
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ecco-tertiary" />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
              Calendar
            </h1>
            <p className="text-sm text-ecco-tertiary">
              Click posts to expand - Drag to reschedule
            </p>
          </div>
          <Link href="/create">
            <Button className="bg-ecco-navy hover:bg-ecco-navy-light">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </Link>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg border border-ecco bg-white hover:bg-ecco-off-white"
            >
              <ChevronLeft className="h-4 w-4 text-ecco-secondary" />
            </button>
            <h2 className="text-lg font-semibold text-ecco-primary">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg border border-ecco bg-white hover:bg-ecco-off-white"
            >
              <ChevronRight className="h-4 w-4 text-ecco-secondary" />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="border-ecco overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-ecco-off-white border-b border-ecco">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-ecco-tertiary uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <DroppableDay
                  key={date.toISOString()}
                  date={date}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  posts={getPostsForDate(date)}
                  expandedPostId={expandedPostId}
                  onToggleExpand={handleToggleExpand}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              );
            })}
          </div>
        </Card>

        {/* Upcoming Posts Summary */}
        <Card className="border-ecco">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-ecco-primary mb-4">
              Upcoming Posts
            </h3>
            {scheduledPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ecco-accent-light mx-auto">
                  <CalendarDays className="h-6 w-6 text-ecco-accent" />
                </div>
                <h4 className="text-sm font-medium text-ecco-primary mb-1">
                  No scheduled posts yet
                </h4>
                <p className="text-xs text-ecco-tertiary mb-4">
                  Schedule posts from your library or create new ones
                </p>
                <Link href="/library">
                  <Button variant="outline" size="sm">
                    Go to Library
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-ecco-off-white cursor-pointer hover:bg-ecco-accent-light transition-colors"
                      onClick={() => handleToggleExpand(post.id)}
                    >
                      <div className="flex flex-col items-center text-center min-w-[50px]">
                        <span className="text-lg font-bold text-ecco-primary">
                          {post.date.getDate()}
                        </span>
                        <span className="text-[10px] uppercase text-ecco-tertiary">
                          {post.date.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ecco-primary truncate">
                          {post.content}
                        </p>
                        <p className="text-xs text-ecco-tertiary">{post.time}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(post.content, post.id);
                        }}
                      >
                        {copiedId === post.id ? (
                          <Check className="h-4 w-4 text-ecco-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePost && (
          <div className="px-3 py-1.5 text-xs font-medium rounded bg-ecco-navy text-white shadow-lg">
            {activePost.content.slice(0, 40)}...
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
