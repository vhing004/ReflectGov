using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ReflectGov.Application.Services;
using ReflectGov.Infrastructure.Data;
using ReflectGov.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// 2. Configure Swagger with JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ReflectGov API - Hệ Thống Tiếp Nhận & Trả Lời Phản Ánh Công Dân",
        Version = "v1",
        Description = "Nền tảng quản lý phản ánh kiến nghị công dân, luân chuyển hồ sơ, xử lý hiện trường và thống kê KPI SLA."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token theo cú pháp: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Database Configuration (PostgreSQL with SQLite fallback)
var postgresConn = builder.Configuration.GetConnectionString("PostgreSql");
var sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=reflectgov_local.db";
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "Auto";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    bool usePostgres = false;

    if (dbProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
    {
        usePostgres = true;
    }
    else if (dbProvider.Equals("Auto", StringComparison.OrdinalIgnoreCase))
    {
        // Try postgres if configured and reachable
        try
        {
            using var tcpClient = new System.Net.Sockets.TcpClient();
            var connectTask = tcpClient.ConnectAsync("localhost", 5432);
            if (connectTask.Wait(500) && tcpClient.Connected)
            {
                usePostgres = true;
            }
        }
        catch
        {
            usePostgres = false;
        }
    }

    if (usePostgres && !string.IsNullOrEmpty(postgresConn))
    {
        Console.WriteLine("[Database] Sử dụng PostgreSQL Database Provider.");
        options.UseNpgsql(postgresConn);
    }
    else
    {
        Console.WriteLine("[Database] Sử dụng SQLite Database Provider (Standalone / Local Mode).");
        options.UseSqlite(sqliteConn);
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// 4. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ReflectGov_SuperSecret_Security_Key_2026_Enterprise_Secure_Citizen_Platform!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ReflectGov";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ReflectGovUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Dependency Injection
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IEmailNotificationService, EmailNotificationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryDepartmentService, CategoryDepartmentService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IStatsService, StatsService>();

// 6. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 7. Auto Migrate & Seed Data on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        await DbInitializer.SeedAsync(context);
        Console.WriteLine("[Database] Khởi tạo CSDL và nạp dữ liệu mẫu thành công.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Database Error] Lỗi khởi tạo CSDL: {ex.Message}");
    }
}

// 8. Configure HTTP Request Pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReflectGov API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Serve uploaded media files
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine("=================================================");
Console.WriteLine(" ReflectGov API Server đang chạy trên cổng 5000 / 5001");
Console.WriteLine(" Swagger UI: http://localhost:5000/swagger");
Console.WriteLine("=================================================");

app.Run();
