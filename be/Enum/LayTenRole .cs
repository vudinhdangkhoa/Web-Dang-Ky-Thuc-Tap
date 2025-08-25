using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata;

namespace be.Enum
{
    public class LayTenRole 
    {

      
        public static string GetRoleName(int roleId)
        {
            switch (roleId)
            {
                case 1:
                    return "Student";
                case 2:
                    return "Company";
                case 3:
                    return "Admin";
                default:
                    return "Khong Xac Dinh";
            }
        }
    }
}