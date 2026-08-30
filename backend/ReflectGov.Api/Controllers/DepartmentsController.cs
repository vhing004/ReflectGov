using Microsoft.AspNetCore.Mvc;
using ReflectGov.Application.DTOs;
using ReflectGov.Application.Services;

namespace ReflectGov.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly ICategoryDepartmentService _service;

    public DepartmentsController(ICategoryDepartmentService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách các đơn vị/phòng ban xử lý phản ánh (UBND, Môi trường, Trật tự đô thị, Giao thông,...)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<DepartmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _service.GetDepartmentsAsync();
        return Ok(departments);
    }
}