// time utils
export const formatTime = (isoOrTime) => {
    if (!isoOrTime) return "";

    // If value looks like HH:MM (no 'T'), return as-is but normalize to 24->12h
    if (typeof isoOrTime === "string" && !isoOrTime.includes("T") && isoOrTime.match(/^\d{1,2}:\d{2}$/)) {
        // create a Date today with that time in local timezone
        const [hh, mm] = isoOrTime.split(":").map(Number);
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    }

    try {
        const date = new Date(isoOrTime);
        if (isNaN(date.getTime())) return String(isoOrTime);
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch (e) {
        return String(isoOrTime);
    }
};

export const formatDate = (iso) => {
    if (!iso) return "";
    try {
        // If iso is a date-only string like YYYY-MM-DD, construct local date to avoid timezone shifts
        if (typeof iso === 'string' && iso.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = iso.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        }

        const date = new Date(iso);
        if (isNaN(date.getTime())) return String(iso);
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
        return String(iso);
    }
};

export const minutesToTime = (m) => {
    if (m === null || m === undefined) return "";
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(min).padStart(2, "0")} ${ampm}`;
};