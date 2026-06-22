let currentRegisteringUserId = null;
module.exports = {
    setSession: (userId)=>{currentRegisteringUserId = userId;   },
    getSession: ()=> currentRegisteringUserId,
    clearSession: ()=>{currentRegisteringUserId= null;}
};