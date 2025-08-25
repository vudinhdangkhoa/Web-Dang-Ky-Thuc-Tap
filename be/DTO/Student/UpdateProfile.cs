using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.DTO.Student
{
    public class UpdateProfile
    {
    public string Name { get; set; }
    public string Address { get; set; }
    public string GioiTinh { get; set; }
    public string Nganh { get; set; }
    public DateOnly NgaySinh { get; set; }
    public string Phone { get; set; }
    public string TruongHoc { get; set; }
      
    }
}