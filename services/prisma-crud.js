module.exports = {
    async insertOne(prisma, payload) {
        try {
            const result = await prisma.create({
                data: payload
            });
            return result;
        } catch (err) {
            console.error(err)
            return "error"
        }
    },
    async insertMany(prisma, payload) {
        try {
            const result = await prisma.createMany({
                data: payload
            });
            return result;
        } catch (err) {
            console.error(err);
            return "error"
        }
    },
    async fetchOne(prisma, query) {
        try {
            const result = await prisma.findUnique({ where: query });
            return result;
        } catch (err) {
            console.error(err)
            return "error"
        }
    },
    async fetchMany(prisma, query, limit, pageNumber) {
        try {
            const result = await prisma.findMany({
                where: query,
                skip: pageNumber > 0 ? (pageNumber - 1) * limit : 0,
                take: limit
            });
            return result;
        } catch (err) {
            console.error(err);
            return "err"
        }
    },
    async updateOne(prisma, query, payload) {
        try {
            const result = await prisma.update({ where: query, data: payload });
            return result;
        } catch (err) {
            console.error(err);
            return "error";
        }
    },
    async updateMany(prisma, query, payload) {
        try {
            const result = await prisma.updateMany({
                where: query,
                data: payload
            });
            return result;
        } catch (err) {
            console.error(err)
            return "error";
        }
    },
    async upsert(prisma, query, payload) {
        try {
            const result = await prisma.upsert({
                where: query,
                update: payload,
                create: payload
            });
            return result;
        } catch (err) {
            console.error(err);
            return "error";
        }
    },
    async deleteOne(prisma, query) {
        try {
            const result = await prisma.delete({
                where: query
            });
            return result;
        } catch (err) {
            console.error(err);
            return "error";
        }
    },
    async deleteMany(prisma, query = {}) {
        try {
            const result = await prisma.deleteMany({
                where: query
            });
            return result;
        } catch (err) {
            console.error(err)
            return "error";
        }
    },
    async transaction(prisma,operations) {
        try {
            const result = await prisma.$transaction(operations);
            return result;
        } catch (err) {
            console.error(err);
            return "error";
        }
    }
}
