using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanDocuments
{
    public class CreateLoanDocumentDto
    {

        [Required]
        public int LoanApplicationId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string DocumentType { get; set; } = string.Empty;

        [Required]
        public IFormFile File { get; set; } =  null;
    }
}


