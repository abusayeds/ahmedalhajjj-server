"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalMarketHours = void 0;
const MARKET_SESSIONS = [
    {
        id: "sydney",
        name: "Sydney",
        timezone: "Australia/Sydney",
        openUtcHour: 22,
        closeUtcHour: 7,
        sessionUtc: "22:00-07:00 UTC",
    },
    {
        id: "tokyo",
        name: "Tokyo",
        timezone: "Asia/Tokyo",
        openUtcHour: 0,
        closeUtcHour: 9,
        sessionUtc: "00:00-09:00 UTC",
    },
    {
        id: "london",
        name: "London",
        timezone: "Europe/London",
        openUtcHour: 8,
        closeUtcHour: 17,
        sessionUtc: "08:00-17:00 UTC",
    },
    {
        id: "new_york",
        name: "New York",
        timezone: "America/New_York",
        openUtcHour: 13,
        closeUtcHour: 22,
        sessionUtc: "13:00-22:00 UTC",
    },
];
const isSessionOpen = (openHour, closeHour, utcHour, utcMinute) => {
    const nowMinutes = utcHour * 60 + utcMinute;
    const openMinutes = openHour * 60;
    const closeMinutes = closeHour * 60;
    if (openHour < closeHour) {
        return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
    }
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
};
const formatLocalTime = (timezone) => new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
}).format(new Date());
const getGlobalMarketHours = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    return MARKET_SESSIONS.map((session) => {
        const isOpen = isSessionOpen(session.openUtcHour, session.closeUtcHour, utcHour, utcMinute);
        return {
            id: session.id,
            name: session.name,
            timezone: session.timezone,
            status: isOpen ? "OPEN" : "CLOSED",
            isOpen,
            localTime: formatLocalTime(session.timezone),
            sessionUtc: session.sessionUtc,
        };
    });
};
exports.getGlobalMarketHours = getGlobalMarketHours;
