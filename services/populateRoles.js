const root = require('app-root-path');
const roles = require(`${root}/config/roles.json`);
const { populateId } = require(`${root}/services/utilities`);

module.exports = {
    async populateRoles(orgId) {
        const populatedRoles = roles.map(obj => {
            const createdAt = Date.now();
            const uid = populateId();
            const role = {
                uid,
                orgId,
                ...obj,
                createdAt
            }
            return role;
        })
        return populatedRoles;
    }
};