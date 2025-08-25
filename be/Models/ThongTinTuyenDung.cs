using System;
using System.Collections.Generic;

namespace be.Models;

public partial class ThongTinTuyenDung
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string TieuDe { get; set; } = null!;

    public string MoTa { get; set; } = null!;

    public string? YeuCau { get; set; }

    public string? Benefits { get; set; }

    public int? IdLocation { get; set; }

    public decimal? Salary { get; set; }

    public DateOnly? HanNop { get; set; }

    public int? SoLuong { get; set; }

    public int? SoLuongXem { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Thoigian { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<DonUngTuyen> DonUngTuyens { get; set; } = new List<DonUngTuyen>();

    public virtual Vitri? IdLocationNavigation { get; set; }

    public virtual ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();
}
