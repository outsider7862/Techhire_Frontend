"use client";

import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
    DateSelectArg,
    EventClickArg,
    EventDropArg,
    EventInput,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import EventModal from "./EventModal";

type ModalState =
    | { mode: "create"; start: Date; end: Date; candidateId?: string }
    | { mode: "edit"; eventId: string }
    | null;

export default function CalendarView() {
    const calendarRef = useRef<FullCalendar | null>(null);
    const searchParams = useSearchParams();
    const [duration, setDuration] = useState(30);

    // Arriving from a candidate's "+ Schedule" link opens the create modal
    // prefilled. Computed as the initial state rather than in an effect, so
    // it still happens once on mount and never reacts to later param changes.
    const [modalState, setModalState] = useState<ModalState>(() => {
        const presetCandidateId = searchParams.get("candidateId");
        if (!presetCandidateId) return null;
        const now = new Date();
        return {
            mode: "create",
            start: now,
            end: new Date(now.getTime() + 30 * 60 * 1000),
            candidateId: presetCandidateId,
        };
    });

    const fetchEvents = useCallback(
        async (info: { start: Date; end: Date }): Promise<EventInput[]> => {
            const params = new URLSearchParams({
                start: info.start.toISOString(),
                end: info.end.toISOString(),
            });
            const res = await fetch(`/api/events?${params.toString()}`);
            const events = await res.json();
            return events.map(
                (e: { id: string; title: string; startTime: string; endTime: string }) => ({
                    id: e.id,
                    title: e.title,
                    start: e.startTime,
                    end: e.endTime,
                })
            );
        },
        []
    );

    function handleSelect(info: DateSelectArg) {
        setModalState({ mode: "create", start: info.start, end: info.end });
        info.view.calendar.unselect();
    }

    function handleEventClick(info: EventClickArg) {
        setModalState({ mode: "edit", eventId: info.event.id });
    }

    async function updateEventTime(eventId: string, start: Date, end: Date, revert: () => void) {
        const res = await fetch(`/api/events/${eventId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startTime: start.toISOString(), endTime: end.toISOString() }),
        });

        if (res.status === 409) {
            const { conflicts } = await res.json();
            const names = conflicts.map((c: { title: string }) => c.title).join(", ");
            const proceed = confirm(`This overlaps with: ${names}. Move it anyway?`);
            if (proceed) {
                await fetch(`/api/events/${eventId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                        force: true,
                    }),
                });
                return;
            }
            revert();
            return;
        }

        if (!res.ok) {
            alert("Couldn't move the event — please try again.");
            revert();
        }
    }

    function handleEventDrop(info: EventDropArg) {
        updateEventTime(info.event.id, info.event.start!, info.event.end!, info.revert);
    }

    function handleEventResize(info: EventResizeDoneArg) {
        updateEventTime(info.event.id, info.event.start!, info.event.end!, info.revert);
    }

    async function handleFindSlot() {
        const res = await fetch("/api/events/suggest-slot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ durationMinutes: duration }),
        });
        if (!res.ok) {
            alert("No available slot found in the next two weeks.");
            return;
        }
        const { start, end } = await res.json();
        setModalState({ mode: "create", start: new Date(start), end: new Date(end) });
    }

    function handleModalClose(didChange: boolean) {
        setModalState(null);
        if (didChange) calendarRef.current?.getApi().refetchEvents();
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="text-sm text-muted-foreground">Find next available:</label>
                <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                >
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                </select>
                <button
                    onClick={handleFindSlot}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                    Find slot
                </button>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={fetchEvents}
                    selectable
                    editable
                    select={handleSelect}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    height="auto"
                />
            </div>

            {modalState && (
                <EventModal
                    // Remounts on a genuinely different event, so the form
                    // re-seeds from the new state instead of resyncing via an effect.
                    key={
                        modalState.mode === "edit"
                            ? modalState.eventId
                            : `create-${modalState.start.getTime()}-${modalState.end.getTime()}`
                    }
                    state={modalState}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}