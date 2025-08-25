using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using be.DTO.Company;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be.controllers.ChucNang.company
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChucNangDangTinTuyenDungCompanyController : ControllerBase
    {

        public MyDbContext db;
        public JWT_Service jwtService;

        public ChucNangDangTinTuyenDungCompanyController(MyDbContext context, JWT_Service jwtService)
        {
            db = context;
            this.jwtService = jwtService;
        }


        [Authorize]
        [HttpGet("GetAllThongTinTuyenDung/{idUser}")]
        public async Task<IActionResult> GetAllThongTinTuyenDung(int idUser)
        {
            var user = db.Users.FirstOrDefault(t => t.Id == idUser);
            if (user == null)
            {
                return NotFound();
            }

            var company = await db.Companies.FirstOrDefaultAsync(t => t.UserId == idUser);
            if (company == null)
            {
                return NotFound();
            }
            var lstThongTinTuyenDung = await db.ThongTinTuyenDungs.Where(t => t.CompanyId == company.Id).Select(c => new
            {
                c.Id,
                c.TieuDe,
                c.MoTa,
                c.Benefits,
                db.Vitris.FirstOrDefault(a => a.Id == c.IdLocation).TenVitri,
                c.Salary,
                c.HanNop,
                c.SoLuongXem,
                c.SoLuong,
                c.CreatedAt,
                c.Thoigian,
                c.YeuCau,
                c.IsActive
            }).OrderByDescending(c => c.CreatedAt).ToListAsync();
            return Ok(lstThongTinTuyenDung);
        }

        [Authorize]
        [HttpPost("CreateThongTinTuyenDung/{idCompany}")]
        public async Task<IActionResult> CreateThongTinTuyenDung(int idCompany, [FromBody] CreateTuyenDung dto)
        {
            var company = await db.Companies.FirstOrDefaultAsync(t => t.Id == idCompany);
            if (company == null)
            {
                return NotFound();
            }

            ThongTinTuyenDung newJobPost = new ThongTinTuyenDung
            {
                CompanyId = idCompany,
                TieuDe = dto.TieuDe,
                MoTa = dto.MoTa,
                YeuCau = dto.YeuCau,
                Benefits = dto.Benefits,
                IdLocation = dto.IdLocation,
                Salary = dto.Salary,
                HanNop = dto.HanNop,
                SoLuong = dto.SoLuong,
                Thoigian = dto.Thoigian + " Tháng"
            };

            db.ThongTinTuyenDungs.Add(newJobPost);
            await db.SaveChangesAsync();

            return Ok();

        }


        [Authorize]
        [HttpGet("GetThongTinTuyenDungById/{id}")]
        public async Task<IActionResult> GetThongTinTuyenDungById(int id)
        {
            var jobPost = await db.ThongTinTuyenDungs.FirstOrDefaultAsync(t => t.Id == id);
            if (jobPost == null)
            {
                return NotFound();
            }

            return Ok(new
            {

                jobPost.TieuDe,
                jobPost.MoTa,
                jobPost.Benefits,
                TenVitri = db.Vitris.FirstOrDefault(a => a.Id == jobPost.IdLocation).TenVitri,
                jobPost.IdLocation,
                jobPost.Salary,
                jobPost.HanNop,
                jobPost.SoLuongXem,
                jobPost.SoLuong,
                jobPost.CreatedAt,
                jobPost.Thoigian,
                jobPost.YeuCau,

            });
        }

        [Authorize]
        [HttpPut("UpdateJobPost/{id}")]
        public async Task<IActionResult> UpdateJobPost(int id, [FromBody] CreateTuyenDung dto)
        {
            var jobPost = await db.ThongTinTuyenDungs.FirstOrDefaultAsync(t => t.Id == id);
            if (jobPost == null)
            {
                return NotFound();
            }

            jobPost.TieuDe = dto.TieuDe;
            jobPost.MoTa = dto.MoTa;
            jobPost.YeuCau = dto.YeuCau;
            jobPost.Benefits = dto.Benefits;
            jobPost.IdLocation = dto.IdLocation;
            jobPost.Salary = dto.Salary;
            jobPost.HanNop = dto.HanNop;
            jobPost.SoLuong = dto.SoLuong;
            jobPost.Thoigian = dto.Thoigian + " Tháng";

            await db.SaveChangesAsync();

            return Ok();
        }


        [Authorize]
        [HttpPut("PauseJob/{idJob}")]
        public async Task<IActionResult> PauseJob(int idJob)
        {
            var jobPost = await db.ThongTinTuyenDungs.FirstOrDefaultAsync(t => t.Id == idJob);
            if (jobPost == null)
            {
                return NotFound();
            }

            jobPost.IsActive = false;
            await db.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpPut("ResumeJob/{idJob}")]
        public async Task<IActionResult> ResumeJob(int idJob)
        {
            var jobPost = await db.ThongTinTuyenDungs.FirstOrDefaultAsync(t => t.Id == idJob);
            if (jobPost == null)
            {
                return NotFound();
            }

            jobPost.IsActive = true;
            await db.SaveChangesAsync();

            return Ok();
        }

    }
    
}