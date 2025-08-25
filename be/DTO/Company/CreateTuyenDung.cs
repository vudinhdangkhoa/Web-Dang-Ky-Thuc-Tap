using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.DTO.Company
{
    public class CreateTuyenDung
    {


        public string TieuDe { get; set; } = null!;

        public string MoTa { get; set; } = null!;

        public string? YeuCau { get; set; }

        public string? Benefits { get; set; }

        public int? IdLocation { get; set; }

        public decimal? Salary { get; set; }

        public DateOnly? HanNop { get; set; }

        public int? SoLuong { get; set; }
        public string? Thoigian { get; set; }
    }
}