using System;
using System.Collections.Generic;

namespace be.Models;

public partial class User
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int RoleId { get; set; }

    public int? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenCreate { get; set; }

    public DateTime? RefreshTokenExpires { get; set; }

    public virtual ICollection<Company> Companies { get; set; } = new List<Company>();

    public virtual ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();

    public virtual Quyen Role { get; set; } = null!;

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
