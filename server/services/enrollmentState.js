let currentRegisteringUserId = null;
let enrollmentTimer = null;

module.exports = {
    setSession(userId) {
        currentRegisteringUserId = userId;
    },

    getSession() {
        return currentRegisteringUserId;
    },

    clearSession() {
        currentRegisteringUserId = null;

        if (enrollmentTimer) {
            clearTimeout(enrollmentTimer);
            enrollmentTimer = null;
        }
    },

    setTimer(timer) {
        enrollmentTimer = timer;
    },

    getTimer() {
        return enrollmentTimer;
    }
};