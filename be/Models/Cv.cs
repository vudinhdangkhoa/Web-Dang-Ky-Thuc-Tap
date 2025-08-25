using System;
using System.Collections.Generic;

namespace be.Models;

public partial class Cv
{
    public int IdCv { get; set; }

    public string? CvfilePath { get; set; }

    public int? IdStudent { get; set; }

    public bool? IsActive { get; set; }

    public string? TenCv { get; set; }

    public DateTime? CreateAt { get; set; }

    public virtual ICollection<DonUngTuyen> DonUngTuyens { get; set; } = new List<DonUngTuyen>();

    public virtual Student? IdStudentNavigation { get; set; }
}
