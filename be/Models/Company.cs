using System;
using System.Collections.Generic;

namespace be.Models;

public partial class Company
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Ten { get; set; } = null!;

    public string? MaSoThue { get; set; }

    public string? NguoiChiuTrachNhiemPhapLy { get; set; }

    public string? Website { get; set; }

    public string? DiaChi { get; set; }

    public string? Phone { get; set; }

    public string? MoTa { get; set; }

    public string? Logo { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ThongTinTuyenDung> ThongTinTuyenDungs { get; set; } = new List<ThongTinTuyenDung>();

    public virtual User? User { get; set; }
}
