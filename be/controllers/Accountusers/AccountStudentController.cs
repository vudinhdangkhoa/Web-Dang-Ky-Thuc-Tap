using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using be.DTO.Student;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be.controllers.Accountusers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountStudent : ControllerBase
    {


        MyDbContext db;
        JWT_Service _jwtService;

        public AccountStudent(JWT_Service jwtService, MyDbContext dbContext)
        {
            _jwtService = jwtService;
            db = dbContext;
        }

        [Authorize]
        [HttpGet("GetStudentById/{id}")]
        public async Task<IActionResult> GetStudentById(int id)
        {
            var student = await db.Students.FirstOrDefaultAsync(s => s.UserId == id);
            if (student == null)
            {
                return NotFound();
            }
            return Ok(new
            {
                student.Id,
                student.Name,
                student.Address,
                student.TruongHoc,
                student.Phone,
                student.NgaySinh,
                student.GioiTinh,
                student.Nganh,
                db.Users.FirstOrDefault(u => u.Id == student.UserId).Email,
                Avatar = string.IsNullOrEmpty(student.Avatar) ? null : $"{Request.Scheme}://{Request.Host}/{student.Avatar}"
            });
        }


        [Authorize]
        [HttpPut("UpdateStudent/{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateProfile updatedStudent)
        {


            var student = await db.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            student.Name = updatedStudent.Name;
            student.Address = updatedStudent.Address;
            student.TruongHoc = updatedStudent.TruongHoc;
            student.Phone = updatedStudent.Phone;
            student.NgaySinh = updatedStudent.NgaySinh;
            student.GioiTinh = updatedStudent.GioiTinh;
            student.Nganh = updatedStudent.Nganh;


            await db.SaveChangesAsync();

            return Ok();
        }


        [Authorize]
        [HttpPut("UpdateAvatar/{id}")]
        public async Task<IActionResult> UpdateAvatar(int id, [FromForm] UpdateAvtar avatar)
        {
            var student = await db.Students.FirstOrDefaultAsync(c=>c.UserId==id);
            if (student == null)
            {
                return NotFound();
            }

            if (avatar != null)
            {
                var avatarFileName = $"{Guid.NewGuid()}_{Path.GetFileName(avatar.avatar.FileName)}";
                var avatarFilePath = Path.Combine("wwwroot", "image", "avatarUser", "Students", avatarFileName);
                var stream = new FileStream(avatarFilePath, FileMode.Create);
                await avatar.avatar.CopyToAsync(stream);
                student.Avatar = $"/image/avatarUser/Students/{avatarFileName}";
                db.Students.Update(student);
                await db.SaveChangesAsync();
            }
            else
            {
                return BadRequest("Avatar file is required.");
            }

            return Ok();
        }





    }
}