using System;
using System.Collections.Generic;

namespace be.Models;

public partial class Vitri
{
    public int Id { get; set; }

    public string? TenVitri { get; set; }

    public virtual ICollection<ThongTinTuyenDung> ThongTinTuyenDungs { get; set; } = new List<ThongTinTuyenDung>();
}
