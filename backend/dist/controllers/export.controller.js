"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportJobsCsv = exports.exportCompaniesCsv = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const exportCompaniesCsv = async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const headers = [
            'ID',
            'Company Name',
            'Industry',
            'Website',
            'License No',
            'ICP Match',
            'Pipeline Stage',
            'Company Size',
            'Headquarters',
            'Country',
            'City',
            'Phone',
            'Email',
            'Created At'
        ];
        const csvRows = [headers.join(',')];
        for (const comp of companies) {
            const row = [
                `"${comp.id}"`,
                `"${(comp.companyName || '').replace(/"/g, '""')}"`,
                `"${(comp.industry || '').replace(/"/g, '""')}"`,
                `"${(comp.website || '').replace(/"/g, '""')}"`,
                `"${(comp.licenseNo || '').replace(/"/g, '""')}"`,
                `"${(comp.icpMatch || '').replace(/"/g, '""')}"`,
                `"${(comp.pipelineStage || '').replace(/"/g, '""')}"`,
                `"${(comp.companySize || '').replace(/"/g, '""')}"`,
                `"${(comp.headquarters || '').replace(/"/g, '""')}"`,
                `"${(comp.country || '').replace(/"/g, '""')}"`,
                `"${(comp.city || '').replace(/"/g, '""')}"`,
                `"${(comp.phone || '').replace(/"/g, '""')}"`,
                `"${(comp.email || '').replace(/"/g, '""')}"`,
                `"${comp.createdAt.toISOString()}"`
            ];
            csvRows.push(row.join(','));
        }
        const csvContent = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leadbond_companies_export.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Error exporting companies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.exportCompaniesCsv = exportCompaniesCsv;
const exportJobsCsv = async (req, res) => {
    try {
        const jobs = await prisma.jobApplication.findMany({
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });
        const headers = [
            'ID',
            'Company Name',
            'Job Title',
            'Position',
            'Department',
            'Experience',
            'Salary',
            'Location',
            'Work Mode',
            'Job Type',
            'Status',
            'Deadline',
            'Created At'
        ];
        const csvRows = [headers.join(',')];
        for (const job of jobs) {
            const row = [
                `"${job.id}"`,
                `"${(job.company?.companyName || '').replace(/"/g, '""')}"`,
                `"${(job.jobTitle || '').replace(/"/g, '""')}"`,
                `"${(job.position || '').replace(/"/g, '""')}"`,
                `"${(job.department || '').replace(/"/g, '""')}"`,
                `"${(job.experience || '').replace(/"/g, '""')}"`,
                `"${(job.salary || '').replace(/"/g, '""')}"`,
                `"${(job.location || '').replace(/"/g, '""')}"`,
                `"${(job.workMode || '').replace(/"/g, '""')}"`,
                `"${(job.jobType || '').replace(/"/g, '""')}"`,
                `"${(job.status || '').replace(/"/g, '""')}"`,
                `"${job.deadline ? job.deadline.toISOString() : ''}"`,
                `"${job.createdAt.toISOString()}"`
            ];
            csvRows.push(row.join(','));
        }
        const csvContent = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leadbond_jobs_export.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        console.error('Error exporting jobs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.exportJobsCsv = exportJobsCsv;
