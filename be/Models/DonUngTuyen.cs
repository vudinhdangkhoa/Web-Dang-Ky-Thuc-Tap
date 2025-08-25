using System;
using System.Collections.Generic;

namespace be.Models;

public partial class DonUngTuyen
{
    public int Id { get; set; }

    public int JobPostId { get; set; }

    public int StudentId { get; set; }

    public int? IdCv { get; set; }

    public string? Status { get; set; }

    public DateTime? AppliedAt { get; set; }

    public virtual Cv? IdCvNavigation { get; set; }

    public virtual ThongTinTuyenDung JobPost { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
