using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanDocumentRepository : ILoanDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public LoanDocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get loan application by ID
    public async Task<LoanApplication?> GetApplicationByIdAsync(
        int applicationId)
    {
        return await _context.LoanApplications
            .AsNoTracking()
            .Include(a => a.ApplicantUser)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted);
    }

    // Check whether document type already exists
    public async Task<bool> DocumentExistsAsync(
        int applicationId,
        int userId,
        string documentType)
    {
        return await _context.LoanDocuments
            .AnyAsync(d =>
                d.LoanApplicationId == applicationId &&
                d.UploadedByUserId == userId &&
                d.DocumentType == documentType &&
                !d.IsDeleted);
    }

    // Get status using category and key
    public async Task<Status?> GetStatusByCategoryAndKeyAsync(
        string category,
        string key)
    {
        return await _context.Statuses
            .FirstOrDefaultAsync(s =>
                s.Category == category &&
                s.Key == key &&
                s.IsActive &&
                !s.IsDeleted);
    }

    // Get documents by application ID, including status
    public async Task<List<LoanDocument>> GetDocumentsByApplicationIdAsync(
        int applicationId)
    {
        return await _context.LoanDocuments
            .AsNoTracking()
            .Include(d => d.Status)
            .Where(d =>
                d.LoanApplicationId == applicationId &&
                !d.IsDeleted)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    // Get document by ID
    public async Task<LoanDocument?> GetDocumentByIdAsync(int documentId)
    {
        return await _context.LoanDocuments
            .Include(d => d.Status)
            .FirstOrDefaultAsync(d =>
                d.Id == documentId &&
                !d.IsDeleted);
    }

    // Add document
    public async Task AddAsync(LoanDocument document)
    {
        await _context.LoanDocuments.AddAsync(document);
    }

    // Save changes
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}