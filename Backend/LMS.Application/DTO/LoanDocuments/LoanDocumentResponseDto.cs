namespace LMS.Application.DTO.LoanDocuments;

public class LoanDocumentResponseDto
{
    public int Id { get; set; }

    public int LoanApplicationId { get; set; }

    public string DocumentType { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public int UploadedByUserId { get; set; }

    public bool IsVerified { get; set; }

    public DateTime CreatedAt { get; set; }
}