using Microsoft.AspNetCore.Mvc;
using ReflectGov.Application.DTOs;
using ReflectGov.Application.Services;

namespace ReflectGov.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryDepartmentService _service;

    public CategoriesController(ICategoryDepartmentService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách các lĩnh vực phản ánh kiến nghị (Hạ tầng, Môi trường, An ninh, Giao thông,...)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetCategoriesAsync();
        return Ok(categories);
    }
}