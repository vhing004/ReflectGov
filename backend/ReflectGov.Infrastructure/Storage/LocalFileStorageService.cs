using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using ReflectGov.Domain.Enums;

namespace ReflectGov.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<(string filePath, string fileName, long fileSize, string fileType)> SaveFileAsync(IFormFile file, string folder = "uploads")
    {
        var uploadRoot = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", folder);
        Directory.CreateDirectory(uploadRoot);

        var ext = Path.GetExtension(file.FileName);
        var uniqueName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadRoot, uniqueName);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        var relativePath = $"/uploads/{folder}/{uniqueName}";
        return (relativePath, file.FileName, file.Length, file.ContentType);
    }

    public void DeleteFile(string filePath)
    {
        try
        {
            var root = _env.WebRootPath ?? "wwwroot";
            var fullPath = Path.Combine(root, filePath.TrimStart('/'));
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
        catch { }
    }
}
