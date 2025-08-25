using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.DTO.XacThuc
{
    public class DangKyCompany : DangKyUser
    {

        public string Ten { get; set; }
        public string MaSoThue { get; set; }
        public string NguoiChiuTrachNhiemPhapLy { get; set; }
        public string Website { get; set; }
        public string DiaChi { get; set; }
        public string Phone { get; set; }
        public string MoTa { get; set; }
        public IFormFile Logo { get; set; } 
    }
}