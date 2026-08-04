import { tokens } from "../../theme";

export const notificationsData = [
  {
    id: 1,

    event: "FAILED_FINGERPRINT",

    severity: "critical",

    entityType: "lock",

    entityName: "Main Door",

    timestamp: "2026-07-06T10:35:20",
  },

  {
    id: 2,

    event: "LOCK_TAMPER",

    severity: "critical",

    entityType: "lock",

    entityName: "Main Door",

    timestamp: "2026-07-06T10:20:00",
  },

  {
    id: 3,

    event: "LOCK_OFFLINE",

    severity: "warning",

    entityType: "lock",

    entityName: "Main Door",

    timestamp: "2026-07-06T09:55:00",
  },

  {
    id: 4,

    event: "USER_ADDED",

    lockName: "Main Door",

    severity: "info",

    entityType: "user",

    entityName: "Sambeg Sherestha",

    timestamp: "2026-07-06T08:30:00",
  },

  {
    id: 5,

    event: "DOOR_OPENED",

    lockName: "Main Door",

    severity: "info",

    entityType: "user",

    entityName: "Sambeg Sherestha",

    timestamp: "2026-07-06T09:50:00",
  },
];

export default notificationsData;

export const lockUsageData = [
  {
    date: "2026-07-19",
    unlocks: 8,
  },
  {
    date: "2026-07-20",
    unlocks: 12,
  },
  {
    date: "2026-07-21",
    unlocks: 6,
  },
  {
    date: "2026-07-22",
    unlocks: 15,
  },
  {
    date: "2026-07-23",
    unlocks: 10,
  },
  {
    date: "2026-07-24",
    unlocks: 18,
  },
  {
    date: "2026-07-25",
    unlocks: 14,
  },
  {
    date: "2026-07-26",
    unlocks: 11,
  },
];

export const dashboardStats = [
  {
    id: 1,
    title: "Total Locks",
    value: 1,
    subtitle: "Registered locks",
    icon: "lock",
    color: "#3b82f6",
  },
  {
    id: 2,
    title: "Active Users",
    value: 35,
    subtitle: "Registered users",
    icon: "users",
    color: "#10b981",
  },
  {
    id: 3,
    title: "Unlocks Today",
    value: 84,
    subtitle: "Successful unlocks",
    icon: "unlock",
    color: "#8b5cf6",
  },
  {
    id: 4,
    title: "Failed Attempts",
    value: 3,
    subtitle: "Failed authentications",
    icon: "warning",
    color: "#ef4444",
  },
];

export const fingerprintData = [
  {
    id: 1,
    userName: "Sambeg Sheresths",
    role: "Admin",
    fingerprintId: "FP-001",
    enrolled: true,
    locks: ["Main Entrance", "Server Room"],
  },
  {
    id: 2,
    userName: "Karan RB",
    role: "Employee",
    fingerprintId: "FP-002",
    enrolled: true,
    locks: ["Garage"],
  },
  {
    id: 3,
    userName: "ChongBang Bigyan",
    role: "Security",
    fingerprintId: null,
    enrolled: false,
    locks: ["Office"],
  },
  {
    id: 4,
    userName: "Binay Bista",
    role: "Admin",
    fingerprintId: null,
    enrolled: false,
    locks: ["Office", "Main Entrance", "Server Room"],
  },
  {
    id: 5,
    userName: "Rajab Bal",
    role: "Security",
    fingerprintId: null,
    enrolled: false,
    locks: ["Main Entrance"],
  },
];

export const mockDataUsers = [
  {
    id: 1,
    name: "Jon Snow",
    email: "jonsnow@gmail.com",
    phone: "(665)121-5454",
    access: "admin",
  },
  {
    id: 2,
    name: "Cersei Lannister",
    email: "cerseilannister@gmail.com",
    age: 42,
    phone: "(421)314-2288",
    access: "manager",
  },
  {
    id: 3,
    name: "Jaime Lannister",
    email: "jaimelannister@gmail.com",
    age: 45,
    phone: "(422)982-6739",
    access: "user",
  },
  {
    id: 4,
    name: "Anya Stark",
    email: "anyastark@gmail.com",
    age: 16,
    phone: "(921)425-6742",
    access: "admin",
  },
  {
    id: 5,
    name: "Daenerys Targaryen",
    email: "daenerystargaryen@gmail.com",
    age: 31,
    phone: "(421)445-1189",
    access: "user",
  },
  {
    id: 6,
    name: "Ever Melisandre",
    email: "evermelisandre@gmail.com",
    age: 150,
    phone: "(232)545-6483",
    access: "manager",
  },
  {
    id: 7,
    name: "Ferrara Clifford",
    email: "ferraraclifford@gmail.com",
    age: 44,
    phone: "(543)124-0123",
    access: "user",
  },
  {
    id: 8,
    name: "Rossini Frances",
    email: "rossinifrances@gmail.com",
    age: 36,
    phone: "(222)444-5555",
    access: "user",
  },
  {
    id: 9,
    name: "Harvey Roxie",
    email: "harveyroxie@gmail.com",
    age: 65,
    phone: "(444)555-6239",
    access: "admin",
  },
];

export const mockDataLocks = [
  {
    _id: "6854d9d2c77f9f0e3a7d1a4c",
    deviceId: "FRONT_DOOR_01",
    location: "Library-Main Entranve",
    isOnline: true,
    lastAction: {
      action: "unlock",
      by: "user1",
      time: "2026-06-20T11:47:00Z",
    },
    status: "open",
  },
  {
    _id: "6854d9d2c77f9f0e3a7d1a4d",
    deviceId: "SIDE_DOOR_02",
    location: "Library-Side Entrance",
    isOnline: true,
    lastAction: {
      action: "unlock",
      by: "user2",
      time: "2026-06-20T12:15:34Z",
    },
    status: "open",
  },
  {
    _id: "6854d9d2c77f9f0e3a7d1a4e",
    deviceId: "LAB_DOOR_03",
    location: "Block 9: 310",
    isOnline: true,
    status: "closed",
    lastAction: {
      action: "unlock_failed",
      by: "Unknown",
      time: "2026-06-20T12:20:11Z",
    },
  },
  {
    _id: "6854d9d2c77f9f0e3a7d1a4f",
    deviceId: "OFFICE_04",
    location: "Administration Office",
    isOnline: false,
    status: "closed",
    lastAction: {
      action: "unlock_failed",
      by: "admin",
      time: "2026-06-20T11:55:42Z",
    },
  },
  {
    _id: "6854d9d2c77f9f0e3a7d1a50",
    deviceId: "Graduate_Room_1",
    location: "Graduage Room Block 9",
    isOnline: true,
    status: "open",
    lastAction: {
      action: "unlock",
      by: "system",
      time: "2026-06-20T12:30:07Z",
    },
  },
  {
    _id: "6854d9d2c77f9f0e3a7d1a51",
    deviceId: "B9_404",
    location: "Block 9 404",
    isOnline: true,
    status: "closed",
    lastAction: {
      action: "unlock",
      by: "user5",
      time: "2026-06-20T12:42:58Z",
    },
  },
];

export const mockAccessLogs = [
  {
    _id: "log_001",
    deviceId: "FRONT_DOOR_01",
    location: "Library-Main Entrance",
    timestamp: "2026-06-20T11:47:00Z",
    user: {
      id: "user1",
      name: "Aarav Sharma",
      role: "Admin",
    },
    action: "UNLOCK",
    status: "SUCCESS",
    method: "FINGERPRINT",
  },
  {
    _id: "log_002",
    deviceId: "SIDE_DOOR_02",
    location: "Library-Side Entrance",
    timestamp: "2026-06-20T12:15:34Z",
    user: {
      id: "user2",
      name: "Sita Rai",
      role: "User",
    },
    action: "UNLOCK",
    status: "SUCCESS",
    method: "FINGERPRINT",
  },
  {
    _id: "log_003",
    deviceId: "LAB_DOOR_03",
    location: "Block 9: 310",
    timestamp: "2026-06-20T12:20:11Z",
    user: {
      id: "unknown",
      name: "Unknown",
      role: "Unknown",
    },
    action: "UNLOCK",
    status: "FAILED",
    method: "FINGERPRINT",
    reason: "Fingerprint mismatch",
  },
  {
    _id: "log_004",
    deviceId: "OFFICE_04",
    location: "Administration Office",
    timestamp: "2026-06-20T11:55:42Z",
    user: {
      id: "admin",
      name: "System Admin",
      role: "Admin",
    },
    action: "UNLOCK",
    status: "FAILED",
    method: "WEB_CONTROL",
    reason: "Device offline",
  },
  {
    _id: "log_005",
    deviceId: "Graduate_Room_1",
    location: "Graduage Room Block 9",
    timestamp: "2026-06-20T12:30:07Z",
    user: {
      id: "system",
      name: "Sambeg",
      role: "User",
    },
    action: "UNLOCK",
    status: "SUCCESS",
    method: "FINGERPRINT",
  },
  {
    _id: "log_006",
    deviceId: "B9_404",
    location: "Block 9 404",
    timestamp: "2026-06-20T12:42:58Z",
    user: {
      id: "user5",
      name: "Bibek Lama",
      role: "User",
    },
    action: "UNLOCK",
    status: "SUCCESS",
    method: "FINGERPRINT",
  },
  {
    _id: "log_007",
    deviceId: "FRONT_DOOR_01",
    location: "Library-Main Entrance",
    timestamp: "2026-06-20T13:10:21Z",
    user: {
      id: "user3",
      name: "Rohan KC",
      role: "User",
    },
    action: "LOCK",
    status: "SUCCESS",
    method: "WEB_CONTROL",
  },
  {
    _id: "log_008",
    deviceId: "LAB_DOOR_03",
    location: "Block 9: 310",
    timestamp: "2026-06-20T13:25:44Z",
    user: {
      id: "user6",
      name: "Anjali Thapa",
      role: "User",
    },
    action: "UNLOCK",
    status: "FAILED",
    method: "FINGERPRINT",
    reason: "Sensor timeout",
  },
];
