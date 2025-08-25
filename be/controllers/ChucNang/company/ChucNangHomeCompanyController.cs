using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace be.controllers.ChucNang.company
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChucNangHomeCompanyController : ControllerBase
    {


        private readonly MyDbContext db;
        private readonly JWT_Service _jwtService;

        public ChucNangHomeCompanyController(MyDbContext context, JWT_Service jwtService)
        {
            _jwtService = jwtService;
            db = context;
        }


        [Authorize]
        [HttpGet("GetAllDonUngTuyen/{idCompany}")]
        public async Task<IActionResult> GetAllDonUngTuyen(int idCompany)
        {

            var company = await db.Companies.FirstOrDefaultAsync(t => t.Id == idCompany);
            if (company == null)
            {
                return NotFound();
            }
            var lstThongTinTuyenDung = await db.ThongTinTuyenDungs.Where(t => t.CompanyId == idCompany).ToListAsync();
            var lstJobPostIds = lstThongTinTuyenDung.Select(t => t.Id).ToList();
            var LstdonUngTuyen = await db.DonUngTuyens.Where(t => lstJobPostIds.Contains(t.JobPostId) && t.Status == "chờ duyệt").Select(
                t => new
                {
                    t.Id,
                    db.Students.FirstOrDefault(c => c.Id == t.StudentId).Name,
                    t.AppliedAt,
                    db.Cvs.FirstOrDefault(c => c.IdCv == t.IdCv).CvfilePath,
                    t.Status,
                    db.ThongTinTuyenDungs.FirstOrDefault(c => c.Id == t.JobPostId).TieuDe,
                }
            ).OrderByDescending(t => t.AppliedAt).ToListAsync();

            return Ok(

                LstdonUngTuyen

            );

        }


        [Authorize]
        [HttpGet("GetAllThongTinTuyenDung/{idCompany}")]
        public async Task<IActionResult> GetAllThongTinTuyenDung(int idCompany)
        {
            var company = await db.Companies.FirstOrDefaultAsync(t => t.Id == idCompany);
            if (company == null)
            {
                return NotFound();
            }
            var lstThongTinTuyenDung = await db.ThongTinTuyenDungs.Where(t => t.CompanyId == idCompany && t.IsActive == true).Select(c => new
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
        [HttpGet("GetDataDashboard/{idCompany}")]
        public async Task<IActionResult> GetDataDashboard(int idCompany)
        {
            var company = await db.Companies.FirstOrDefaultAsync(t => t.Id == idCompany);
            if (company == null)
            {
                return NotFound();
            }

            var lstThongTinTuyenDung = await db.ThongTinTuyenDungs.Where(t => t.CompanyId == idCompany).ToListAsync();
            var lstJobPostIds = lstThongTinTuyenDung.Select(t => t.Id).ToList();

            var tongThongTinTuyenDung = await db.ThongTinTuyenDungs.CountAsync(t => t.CompanyId == idCompany);
            var tongThongTinTuyenDungHoatDong= await db.ThongTinTuyenDungs.CountAsync(t => t.CompanyId == idCompany && t.IsActive==true);
            var tongDonUngTuyen = await db.DonUngTuyens.CountAsync(t=>lstJobPostIds.Contains(t.JobPostId));
            var tongDonUngTuyenChoDuyet = await db.DonUngTuyens.CountAsync(t => lstJobPostIds.Contains(t.JobPostId) && t.Status == "chờ duyệt");
            return Ok(
                new
                {
                    tongThongTinTuyenDung,
                    tongThongTinTuyenDungHoatDong,
                    tongDonUngTuyen,
                    tongDonUngTuyenChoDuyet
                }
            );

        }



    }
}