using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using be.DTO.XacThuc;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be.controllers.XacThuc
{
    [ApiController]
    [Route("api/[controller]")]
    public class DangKyController : ControllerBase
    {
        JWT_Service _jwtService;
        MyDbContext db;

        public DangKyController(JWT_Service jwtService, MyDbContext dbContext)
        {
            _jwtService = jwtService;
            db = dbContext;
        }


        [HttpPost("DangKyStudent")]
        public async Task<IActionResult> Register([FromForm] DangKyStudent student)
        {
            if (db.Users.Any(u => u.Email == student.Email))
            {
                return BadRequest("Email đã được sử dụng.");
            }

            User newUser = new User
            {
                Email = student.Email,
                Password = student.Password,
                RoleId = student.RoleId 
            };

            await db.Users.AddAsync(newUser);
            await db.SaveChangesAsync();
            Student newStudent = new Student
                {
                    Name = student.Name,
                    Address = student.Address,
                    TruongHoc = student.TruongHoc,
                    Phone = student.Phone,
                    NgaySinh = DateOnly.FromDateTime(student.NgaySinh),
                    GioiTinh = student.GioiTinh,
                    Nganh = student.Nganh,
                 
                    UserId = newUser.Id
                };
            if (student.Avatar != null)
            {
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(student.Avatar.FileName)}";
                var filePath = Path.Combine("wwwroot", "image", "avatarUser", "Students", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await student.Avatar.CopyToAsync(stream);
                }

                newStudent.Avatar = $"/wwwroot/image/avatarUser/Students/{fileName}";

            }

            await db.Students.AddAsync(newStudent);
            await db.SaveChangesAsync();

            return Ok("Đăng ký thành công.");
        }
       
        [HttpPost("DangKyCompany")]
        public async Task<IActionResult> RegisterCompany([FromForm] DangKyCompany company)
        {
            if (await db.Users.AnyAsync(u => u.Email == company.Email))
            {
                return BadRequest("Email đã được sử dụng.");
            }

            User newUser = new User
            {
                Email = company.Email,
                Password = company.Password,
                RoleId = company.RoleId
            };

            await db.Users.AddAsync(newUser);
            await db.SaveChangesAsync();

            Company newCompany = new Company
            {
                Ten = company.Ten,
                MaSoThue = company.MaSoThue,
                NguoiChiuTrachNhiemPhapLy = company.NguoiChiuTrachNhiemPhapLy,
                Website = company.Website,
                DiaChi = company.DiaChi,
                Phone = company.Phone,
                MoTa = company.MoTa,
                UserId = newUser.Id
            };

            if (company.Logo != null)
            {
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(company.Logo.FileName)}";
                var filePath = Path.Combine("wwwroot", "image", "avatarUser", "Companys", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await company.Logo.CopyToAsync(stream);
                }

                newCompany.Logo = $"/image/avatarUser/Companys/{fileName}";
            }

            await db.Companies.AddAsync(newCompany);
            await db.SaveChangesAsync();

            return Ok("Đăng ký thành công.");
        }
    }
}