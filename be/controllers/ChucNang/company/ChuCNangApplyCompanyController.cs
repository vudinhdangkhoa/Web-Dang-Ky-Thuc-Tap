using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using be.Enum;
using Microsoft.AspNetCore.SignalR;


namespace be.controllers.ChucNang.company
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChuCNangApplyCompanyController : ControllerBase
    {


        public MyDbContext db;
        public JWT_Service jwtService;
        public IHubContext<SignalR_Service> hubContext;

        public ChuCNangApplyCompanyController(MyDbContext context, JWT_Service jwtService, IHubContext<SignalR_Service> hubContext)
        {
            this.jwtService = jwtService;
            db = context;
            this.hubContext = hubContext;
        }



        [Authorize]
        [HttpGet("GetAllDonUngTuyen/{idUser}")]
        public async Task<IActionResult> GetAllDonUngTuyen(int idUser)
        {

            var company = await db.Companies.FirstOrDefaultAsync(t => t.UserId == idUser);
            if (company == null)
            {
                return NotFound();
            }
            var lstThongTinTuyenDung = await db.ThongTinTuyenDungs.Where(t => t.CompanyId == company.Id).ToListAsync();
            var lstJobPostIds = lstThongTinTuyenDung.Select(t => t.Id).ToList();
            var LstdonUngTuyen = await db.DonUngTuyens.Where(t => lstJobPostIds.Contains(t.JobPostId)).Select(
                t => new
                {
                    t.Id,
                    db.Students.FirstOrDefault(c => c.Id == t.StudentId).Name,
                    t.AppliedAt,
                    cvfilePath = $"{Request.Scheme}://{Request.Host}/" + db.Cvs.FirstOrDefault(c => c.IdCv == t.IdCv).CvfilePath,
                    t.Status,
                    db.ThongTinTuyenDungs.FirstOrDefault(c => c.Id == t.JobPostId).TieuDe,
                }
            ).ToListAsync();

            return Ok(

                LstdonUngTuyen

            );

        }


        [Authorize]
        [HttpPut("DuyetDonUngTuyen/{idDon}")]
        public async Task<IActionResult> DuyetDonUngTuyen(int idDon)
        {

            var donUngTuyen = await db.DonUngTuyens.FirstOrDefaultAsync(t => t.Id == idDon);
          var student = await db.Students.FirstOrDefaultAsync(t => t.Id == donUngTuyen.StudentId);
          var user = await db.Users.FirstOrDefaultAsync(t => t.Id == student.UserId);
            if (donUngTuyen == null)
            {
                return NotFound();
            }

            donUngTuyen.Status = TrangThaiDonUngTuyen.DaDuyet;
            await db.SaveChangesAsync();

            // Gửi thông báo đến người dùng qua SignalR
            await hubContext.Clients.User(user.Id.ToString()).SendAsync("ReceiveMessage", "Đơn ứng tuyển của bạn đã được duyệt.");

            return Ok();

        }


        [Authorize]
        [HttpPut("TuChoiDonUngTuyen/{idDon}")]
        public async Task<IActionResult> TuChoiDonUngTuyen(int idDon)
        {

            var donUngTuyen = await db.DonUngTuyens.FirstOrDefaultAsync(t => t.Id == idDon);
            if (donUngTuyen == null)
            {
                return NotFound();
            }

            donUngTuyen.Status = TrangThaiDonUngTuyen.TuChoi;
            await db.SaveChangesAsync();

            // Gửi thông báo đến người dùng qua SignalR
            await hubContext.Clients.User(donUngTuyen.StudentId.ToString()).SendAsync("ReceiveMessage", "Đơn ứng tuyển của bạn đã bị từ chối.");

            return Ok();

        }

    }
}