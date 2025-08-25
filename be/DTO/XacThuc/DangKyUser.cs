using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.DTO.XacThuc
{
    public class DangKyUser
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; } // 1: Student, 2: Company
    }
}