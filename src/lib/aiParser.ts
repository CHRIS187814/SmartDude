import type { AiAction, AiActionType, Priority } from '@/types';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayIndex: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function nextDay(target: number, from = new Date()): Date {
  const d = new Date(from);
  const cur = d.getDay();
  let diff = (target - cur + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseTime(text: string): { hour: number; minute: number } | null {
  const lower = text.toLowerCase();
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) return { hour, minute };
  }
  if (/\bmorning\b/.test(lower)) return { hour: 8, minute: 0 };
  if (/\bnoon\b/.test(lower)) return { hour: 12, minute: 0 };
  if (/\bafternoon\b/.test(lower)) return { hour: 14, minute: 0 };
  if (/\bevening\b/.test(lower)) return { hour: 19, minute: 0 };
  if (/\bnight\b/.test(lower)) return { hour: 21, minute: 0 };
  if (/\blunch\b/.test(lower)) return { hour: 12, minute: 30 };
  return null;
}

function resolveDate(text: string): Date | null {
  const lower = text.toLowerCase();
  const now = new Date();
  if (/\btoday\b/.test(lower)) {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
  }
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d;
  }
  const inMatch = lower.match(/in\s+(\d+)\s+(day|days|week|weeks|hour|hours)/);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    const unit = inMatch[2];
    const d = new Date(now);
    if (unit.startsWith('hour')) d.setHours(d.getHours() + n);
    else if (unit.startsWith('day')) d.setDate(d.getDate() + n);
    else if (unit.startsWith('week')) d.setDate(d.getDate() + n * 7);
    return d;
  }
  for (const day of daysOfWeek) {
    if (new RegExp(`\\b${day}\\b`).test(lower) || new RegExp(`\\b${day.slice(0, 3)}\\b`).test(lower)) {
      return nextDay(dayIndex[day.slice(0, 3)]);
    }
  }
  const dateMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    let year = dateMatch[3] ? parseInt(dateMatch[3], 10) : now.getFullYear();
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }
  return null;
}

function parsePriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (/\burgent\b|\bcritical\b|\basap\b/.test(lower)) return 'urgent';
  if (/\bhigh\b|\bimportant\b/.test(lower)) return 'high';
  if (/\blow\b|\bminor\b|\bsomeday\b/.test(lower)) return 'low';
  return 'medium';
}

function toCron(date: Date, time: { hour: number; minute: number }): string {
  return `${time.minute} ${time.hour} ${date.getDate()} ${date.getMonth() + 1} *`;
}

function recurrenceToCron(text: string): string | null {
  const lower = text.toLowerCase();
  const time = parseTime(lower) ?? { hour: 8, minute: 0 };
  if (/every\s+weekday|every\s+week\s*day|weekdays/.test(lower)) {
    return `${time.minute} ${time.hour} * * 1-5`;
  }
  if (/every\s+day|daily/.test(lower)) {
    return `${time.minute} ${time.hour} * * *`;
  }
  for (let i = 0; i < 7; i++) {
    const day = daysOfWeek[i];
    const abbr = day.slice(0, 3);
    if (new RegExp(`every\\s+${day}|every\\s+${abbr}`).test(lower)) {
      return `${time.minute} ${time.hour} * * ${i}`;
    }
  }
  if (/every\s+week/.test(lower)) {
    return `${time.minute} ${time.hour} * * 1`;
  }
  if (/every\s+month/.test(lower)) {
    return `${time.minute} ${time.hour} 1 * *`;
  }
  return null;
}

export interface ParseResult {
  action: AiAction;
  summary: string;
  needsTimeClarification?: boolean;
}

export function parseIntent(input: string): ParseResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // CREATE_REMINDER / CREATE_TASK with reminder
  const reminderMatch = text.match(/remind\s+me\s+(?:to\s+)?(.+)/i);
  if (reminderMatch) {
    const rest = reminderMatch[1];
    const date = resolveDate(lower);
    const time = parseTime(lower);
    const title = rest.replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/i, '').replace(/today|tomorrow|morning|afternoon|evening|night|noon|lunch/gi, '').replace(/in\s+\d+\s+(day|days|week|weeks|hour|hours)/gi, '').trim();
    const cleanTitle = title.replace(/^(to\s+)/i, '').trim() || 'Reminder';
    const reminderDate = date ?? new Date();
    if (time) {
      reminderDate.setHours(time.hour, time.minute, 0, 0);
    }
    const needsClarification = !time && !date;
    return {
      action: {
        type: 'CREATE_REMINDER',
        taskTitle: cleanTitle,
        date: reminderDate.toISOString().split('T')[0],
        time: time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : null,
        reminderAt: reminderDate.toISOString(),
      },
      summary: needsClarification
        ? `I can create a reminder for "${cleanTitle}" but I need a specific time. When should I remind you?`
        : `Create reminder: "${cleanTitle}" on ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`,
      needsTimeClarification: needsClarification,
    };
  }

  // CREATE_AUTOMATION / CREATE_RECURRING_TASK
  const recurringMatch = text.match(/every\s+(.+?)\s+(?:remind|create|make|set)\s+(?:me\s+)?(?:to\s+)?(.+)/i);
  if (recurringMatch || /\bevery\b/.test(lower) && /\bremind|create|task|review|plan\b/.test(lower)) {
    const cron = recurrenceToCron(lower);
    if (cron) {
      const actionMatch = text.match(/(?:remind|create|make|set)\s+(?:me\s+)?(?:to\s+)?(.+)/i);
      const actionText = actionMatch ? actionMatch[1].trim() : text;
      const title = actionText.replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/i, '').replace(/every\s+\w+/gi, '').trim() || 'Recurring task';
      return {
        action: {
          type: 'CREATE_AUTOMATION',
          name: title.charAt(0).toUpperCase() + title.slice(1),
          schedule_cron: cron,
          action_type: 'CREATE_TASK',
          action_params: { title, priority: parsePriority(lower) },
        },
        summary: `Create automation: "${title}" — schedule: ${cron}`,
      };
    }
  }

  // CREATE_TASK
  const createMatch = text.match(/(?:create|add|make|set\s+up)\s+(?:a\s+)?(?:task|to-?do)\s+(?:to\s+)?(.+)/i);
  if (createMatch) {
    const rest = createMatch[1];
    const date = resolveDate(lower);
    const time = parseTime(lower);
    const title = rest.replace(/tomorrow|today/gi, '').replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/i, '').replace(/in\s+\d+\s+(day|days|week|weeks)/gi, '').trim();
    return {
      action: {
        type: 'CREATE_TASK',
        taskTitle: title || 'New task',
        priority: parsePriority(lower),
        dueDate: date ? date.toISOString().split('T')[0] : null,
        dueTime: time ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}` : null,
      },
      summary: `Create task: "${title || 'New task'}"${date ? ` due ${date.toLocaleDateString()}` : ''}${time ? ` at ${time.hour}:${String(time.minute).padStart(2, '0')}` : ''}`,
    };
  }

  // COMPLETE_TASK
  if (/\bcomplete|finish|done|mark\s+(?:as\s+)?done\b/.test(lower) && /\btask\b/.test(lower)) {
    return {
      action: { type: 'COMPLETE_TASK', query: text.replace(/.*(?:complete|finish|mark|done)\s+/i, '') },
      summary: 'I can mark a task as complete. Which task would you like to finish?',
    };
  }

  // DISABLE_AUTOMATION
  if (/\bdisable|turn\s+off|stop\b/.test(lower) && /\bautomation|reminder|routine\b/.test(lower)) {
    return {
      action: { type: 'DISABLE_AUTOMATION', query: text },
      summary: 'I can disable an automation for you. Which one?',
    };
  }

  // ENABLE_AUTOMATION
  if (/\benable|turn\s+on|start\b/.test(lower) && /\bautomation|reminder|routine\b/.test(lower)) {
    return {
      action: { type: 'ENABLE_AUTOMATION', query: text },
      summary: 'I can enable an automation for you. Which one?',
    };
  }

  // PRIORITIZE / FOCUS PLAN
  if (/\bprioriti[sz]e|focus\s+plan|plan\s+my|what\s+should\s+i\s+(focus|work|do)|focus\s+on/.test(lower)) {
    if (/\bthree\s+hours|next\s+3\s*hours|focus\s+plan\b/.test(lower)) {
      return {
        action: { type: 'CREATE_FOCUS_PLAN', hours: 3 },
        summary: 'I can create a focus plan from your tasks for the next 3 hours.',
      };
    }
    return {
      action: { type: 'RECOMMEND_PRIORITIES' },
      summary: 'I can analyze your tasks and recommend priorities for today.',
    };
  }

  // List automations
  if (/\bwhat\s+automations|list\s+automations|my\s+automations\b/.test(lower)) {
    return {
      action: { type: 'CREATE_FOCUS_PLAN' as AiActionType, _list: 'automations' },
      summary: 'Here are your current automations.',
    };
  }

  // Default: informational
  return {
    action: { type: 'CREATE_TASK', taskTitle: text, priority: 'medium' as Priority },
    summary: `I can help with that. Want me to create a task for "${text}"?`,
  };
}
