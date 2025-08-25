using System;
using System.Collections.Generic;

namespace be.Models;

public partial class Quyen
{
    public int IdQuyen { get; set; }

    public string TenQuyen { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
