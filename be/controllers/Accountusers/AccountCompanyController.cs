using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be.controllers.Accountusers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountCompanyController : ControllerBase
    {


        public MyDbContext db { get; set; }
        public JWT_Service _jwtService { get; set; }


        public AccountCompanyController(MyDbContext context, JWT_Service jwtService)
        {
            db = context;
            _jwtService = jwtService;
        }



        [Authorize]
        [HttpGet("GetCompanyById/{UserId}")]
        public async Task<IActionResult> GetCompanyById(int UserId)
        {

            var company = await db.Companies.FirstOrDefaultAsync(c => c.UserId == UserId);
            if (company == null)
            {
                return NotFound();
            }
            return Ok(new
            {
                company.Id,
                company.Ten,
                company.DiaChi,
                company.Phone,
                Email = db.Users.FirstOrDefault(t => t.Id == UserId)?.Email,
                company.MoTa,
                Logo = string.IsNullOrEmpty(company.Logo) ? null : $"{Request.Scheme}://{Request.Host}/{company.Logo}",
                company.UserId
            });
        }

           

        

    }
}