using System;
using System.Collections.Generic;

namespace be.Models;

public partial class KhieuNai
{
    public int Id { get; set; }

    public int? ReportedUserId { get; set; }

    public int? ReportedIdTuyenDung { get; set; }

    public string Reason { get; set; } = null!;

    public string? Status { get; set; }

    public string? AdminNote { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ThongTinTuyenDung? ReportedIdTuyenDungNavigation { get; set; }

    public virtual User? ReportedUser { get; set; }
}
