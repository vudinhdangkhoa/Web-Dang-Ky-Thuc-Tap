using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace be.DTO.Student
{
    public class CreateCV
    {
        public string cvName { get; set; }
        public IFormFile file { get; set; }
        public string studentid { get; set; }
    }
}