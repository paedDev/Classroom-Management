import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm"
import express from "express"
import { departments, subjects } from "../db/schema.js"
import { db } from "../db/db.js"

const router = express.Router()


//Get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department } = req.query;

        // 1. Sanitize with a safety cap (Max 100 per page)
        const currentPage = Math.max(1, parseInt(page as string) || 1);
        const limitPerPage = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }
        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // 2. Count with proper integer casting
        const countResult = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        // 3. Select with explicit Join for reliable cross-table filtering
        const subjectList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error(`Get /subjects error: ${error}`);
        res.status(500).json({ message: "Error fetching subjects" });
    }
});


export default router