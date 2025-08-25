using System;
using System.Collections.Generic;

namespace be.Models;

public partial class Student
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? TruongHoc { get; set; }

    public string? Nganh { get; set; }

    public string? Avatar { get; set; }

    public int? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Cv> Cvs { get; set; } = new List<Cv>();

    public virtual ICollection<DonUngTuyen> DonUngTuyens { get; set; } = new List<DonUngTuyen>();

    public virtual User User { get; set; } = null!;
}
