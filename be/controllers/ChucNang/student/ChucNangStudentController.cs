using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

using be.DTO.Student;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be.controllers.ChucNang.student
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChucNangStudentController : ControllerBase
    {

        private readonly MyDbContext db;
        private readonly JWT_Service _jwtService;

        public ChucNangStudentController(MyDbContext context, JWT_Service jwtService)
        {
            _jwtService = jwtService;
            db = context;
        }

        // Add methods for handling student-related functionalities here
        // For example, methods to create, update, delete, and retrieve students


        //--------------------------- page HomeStudent --------------------------------

        [HttpGet("GetAllThongTinTuyenDung")]
        public IActionResult GetAllThongTinTuyenDung()
        {
            var thongTinTuyenDungs = db.ThongTinTuyenDungs.ToList();
            var ThongTinTuyenDungs = thongTinTuyenDungs.Select(t => new
            {
                id = t.Id,
                title = t.TieuDe,
                description = t.MoTa,

                createdAt = t.CreatedAt,
                updatedAt = t.UpdatedAt,
                positions = db.Vitris.FirstOrDefault(v => v.Id == t.IdLocation).TenVitri,
                requirements = t.YeuCau,
                salary = t.Salary,
                name = db.Companies.FirstOrDefault(c => c.Id == t.CompanyId).Ten,
                logo = string.IsNullOrEmpty(db.Companies.FirstOrDefault(c => c.Id == t.CompanyId).Logo) ? null : $"{Request.Scheme}://{Request.Host}/{db.Companies.FirstOrDefault(c => c.Id == t.CompanyId).Logo}",
                location = db.Companies.FirstOrDefault(c => c.Id == t.CompanyId).DiaChi,
                slots = t.SoLuong,
                benefits = t.Benefits,
                duration = t.Thoigian

            }).ToList();
            return Ok(
            
                ThongTinTuyenDungs
            );
        }


        [Authorize]
        [HttpGet("GetAllViTriTT")]
        public async Task<IActionResult> GetAllViTriTT()
        {
            var vitris = await db.Vitris.ToListAsync();
            var result = vitris.Select(v => new
            {
                v.Id,
                v.TenVitri
            }).ToList();
            return Ok(result);
        }


        [Authorize]
        [HttpPost("UngTuyen/{idStudent}")]
        public async Task<IActionResult> UngTuyen(int idStudent, [FromBody] UngTuyen ungTuyen)
        {

            var student = await db.Students.FirstOrDefaultAsync(t => t.Id == idStudent);
            if(student == null)
            {
                return NotFound("Student not found.");
            }
            var checkExist = await db.DonUngTuyens.FirstOrDefaultAsync(t=>t.JobPostId==ungTuyen.idTuyenDung && t.StudentId == student.Id);
            if (checkExist != null)
            {
                return Conflict();
            }

            DonUngTuyen donUngTuyen = new DonUngTuyen();
            donUngTuyen.IdCv = ungTuyen.idCV;
            donUngTuyen.JobPostId = ungTuyen.idTuyenDung;
            donUngTuyen.StudentId = student.Id;

            db.DonUngTuyens.Add(donUngTuyen);
            await db.SaveChangesAsync();

            return Ok();

        }


        //-------------------------------- Page HoSo --------------------------------

        [Authorize]
        [HttpGet("GetAllCVById/{id}")]
        public IActionResult GetAllCVById(int id)
        {
            var student = db.Students.FirstOrDefault(s => s.UserId == id);

            var cv = db.Cvs.Where(c => c.IdStudent == student.Id && c.IsActive == true).Select(c => new
            {
                c.IdCv,
                c.IdStudent,
                c.TenCv,
                c.CvfilePath,
                ngaytao = c.CreateAt != null ? c.CreateAt.Value.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd"),

            }).ToList();

            return Ok(cv);
        }


        [Authorize]
        [HttpPost("AddCV/{id}")]
        public IActionResult AddCV(int id, [FromForm] CreateCV createCV)
        {
            var student = db.Students.FirstOrDefault(s => s.Id == id);
            if (student == null)
            {
                return NotFound("Student not found.");
            }

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(createCV.file.FileName)}";
            var filepath = Path.Combine("wwwroot", "CV");
            var stream = new FileStream(Path.Combine(filepath, fileName), FileMode.Create);
            createCV.file.CopyTo(stream);
            Cv cv = new Cv
            {
                TenCv = createCV.cvName,
                CvfilePath = $"/CV/{fileName}",
                IdStudent = student.Id,
                CreateAt = DateTime.Now,

            };
            db.Cvs.Add(cv);
            db.SaveChanges();

            return Ok();
        }


        [Authorize]
        [HttpPut("UpdateCV/{id}")]
        public async Task<IActionResult> UpdateCV(int id, [FromBody] UpdateCV updateCV)
        {
            var cv = db.Cvs.FirstOrDefault(c => c.IdCv == id);
            if (cv == null)
            {
                return NotFound("CV not found.");
            }

            cv.TenCv = updateCV.cvNameUpdate;
            await db.SaveChangesAsync();

            return Ok();
        }


        [Authorize]
        [HttpPut("DeleteCV/{id}")]
        public async Task<IActionResult> DeleteCV(int id)
        {
            Cv cv = db.Cvs.FirstOrDefault(c => c.IdCv == id);
            if (cv == null)
            {
                return NotFound("CV not found.");
            }

            cv.IsActive = false;
            await db.SaveChangesAsync();

            return Ok();
        }


        [Authorize]
        [HttpGet("GetAllDonUngTuyen/{id}")]
        public async Task<IActionResult> GetAllDonUngTuyen(int id)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var student = await db.Students.FirstOrDefaultAsync(s => s.UserId == user.Id);
            if (student == null)
            {
                return NotFound("Student not found.");
            }

            var lstDonUngTuyen = db.DonUngTuyens.Where(d => d.StudentId == student.Id).Select(c=>new
            {
                id = c.Id,
                AppliedAt = c.AppliedAt,
                Status = c.Status,
                TenCv = db.Cvs.FirstOrDefault(cv => cv.IdCv == c.IdCv).TenCv,
                TieuDe = db.ThongTinTuyenDungs.FirstOrDefault(tt => tt.Id == c.JobPostId).TieuDe,
                TenCongTy = db.Companies.FirstOrDefault(co => co.Id == db.ThongTinTuyenDungs.FirstOrDefault(tt => tt.Id == c.JobPostId).CompanyId).Ten,

            }).ToList();


            return Ok(lstDonUngTuyen);

        }



    }
}