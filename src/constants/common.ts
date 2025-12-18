export const ROUTE = {
  API: "/api",
  HOME: "/",
  PROJECTS: "/projects",
  SKILLS: "/skills",
  CONTACT: "/contact",
  ABOUT: "/about",
  EXPERIENCE: "/experience",
  HEALTH: "/health",
};

export const isDateValid = (dateStr: string): boolean => {
  const match = /^([0-9]{2})-([0-9]{4})$/.exec(dateStr);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return false;

  const date = new Date(year, month - 1);
  return date.getFullYear() === year && date.getMonth() === month - 1;
};

export const isStartBeforeEnd = (
  start: string,
  end: string
): { valid: boolean; message?: string } => {
  if (!start || !end) {
    return { valid: false, message: "Invalid date format. Use MM-YYYY." };
  }

  if (start >= end) {
    return {
      valid: false,
      message: "startAt must be before endAt (MM-YYYY).",
    };
  }

  return { valid: true };
};
