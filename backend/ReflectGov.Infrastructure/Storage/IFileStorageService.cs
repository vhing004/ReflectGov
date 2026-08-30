using Microsoft.AspNetCore.Http;

namespace ReflectGov.Infrastructure.Storage;

public interface IFileStorageService
{
    Task<(string filePath, string fileName, long fileSize, string fileType)> SaveFileAsync(IFormFile file, string folder = "uploads");
    void DeleteFile(string filePath);
}