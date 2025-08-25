using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace be.Models;

public partial class MyDbContext : DbContext
{
    public MyDbContext()
    {
    }

    public MyDbContext(DbContextOptions<MyDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Company> Companies { get; set; }

    public virtual DbSet<Cv> Cvs { get; set; }

    public virtual DbSet<DonUngTuyen> DonUngTuyens { get; set; }

    public virtual DbSet<KhieuNai> KhieuNais { get; set; }

    public virtual DbSet<Quyen> Quyens { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<ThongTinTuyenDung> ThongTinTuyenDungs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vitri> Vitris { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=KUPHA;Database=QLDangKyThucTap;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Companie__3214EC0796907A4B");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Logo).HasMaxLength(500);
            entity.Property(e => e.MaSoThue).HasMaxLength(50);
            entity.Property(e => e.MoTa).HasMaxLength(2000);
            entity.Property(e => e.NguoiChiuTrachNhiemPhapLy).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Ten).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Website).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.Companies)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Companies__UserI__4E88ABD4");
        });

        modelBuilder.Entity<Cv>(entity =>
        {
            entity.HasKey(e => e.IdCv).HasName("PK__CV__B773909535A25E60");

            entity.ToTable("CV");

            entity.Property(e => e.IdCv).HasColumnName("IdCV");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CvfilePath)
                .HasMaxLength(500)
                .HasColumnName("CVFilePath");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.TenCv)
                .HasMaxLength(255)
                .HasColumnName("TenCV");

            entity.HasOne(d => d.IdStudentNavigation).WithMany(p => p.Cvs)
                .HasForeignKey(d => d.IdStudent)
                .HasConstraintName("FK__CV__IdStudent__48CFD27E");
        });

        modelBuilder.Entity<DonUngTuyen>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__DonUngTu__3214EC07D6DDEE83");

            entity.ToTable("DonUngTuyen");

            entity.HasIndex(e => new { e.JobPostId, e.StudentId }, "UQ__DonUngTu__D444CE82EBF422AD").IsUnique();

            entity.Property(e => e.AppliedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IdCv).HasColumnName("IdCV");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("ch? duy?t");

            entity.HasOne(d => d.IdCvNavigation).WithMany(p => p.DonUngTuyens)
                .HasForeignKey(d => d.IdCv)
                .HasConstraintName("FK__DonUngTuye__IdCV__60A75C0F");

            entity.HasOne(d => d.JobPost).WithMany(p => p.DonUngTuyens)
                .HasForeignKey(d => d.JobPostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonUngTuy__JobPo__5EBF139D");

            entity.HasOne(d => d.Student).WithMany(p => p.DonUngTuyens)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonUngTuy__Stude__5FB337D6");
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__KhieuNai__3214EC0711ED10C3");

            entity.ToTable("KhieuNai");

            entity.Property(e => e.AdminNote).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Reason).HasMaxLength(1000);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("ch? gi?i quy?t");

            entity.HasOne(d => d.ReportedIdTuyenDungNavigation).WithMany(p => p.KhieuNais)
                .HasForeignKey(d => d.ReportedIdTuyenDung)
                .HasConstraintName("FK__KhieuNai__Report__70DDC3D8");

            entity.HasOne(d => d.ReportedUser).WithMany(p => p.KhieuNais)
                .HasForeignKey(d => d.ReportedUserId)
                .HasConstraintName("FK__KhieuNai__Report__6FE99F9F");
        });

        modelBuilder.Entity<Quyen>(entity =>
        {
            entity.HasKey(e => e.IdQuyen).HasName("PK__Quyen__C9FD630AB52A6FC6");

            entity.ToTable("Quyen");

            entity.Property(e => e.TenQuyen).HasMaxLength(50);
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Student__3214EC07D9D5AFED");

            entity.ToTable("Student");

            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Avatar)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.GioiTinh).HasMaxLength(10);
            entity.Property(e => e.IsActive).HasDefaultValue(1);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Nganh).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.TruongHoc).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Students)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Student__UserId__44FF419A");
        });

        modelBuilder.Entity<ThongTinTuyenDung>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ThongTin__3214EC074AD3A3C8");

            entity.ToTable("ThongTinTuyenDung");

            entity.Property(e => e.Benefits).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MoTa).HasMaxLength(3000);
            entity.Property(e => e.Salary).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoLuong).HasDefaultValue(100);
            entity.Property(e => e.SoLuongXem).HasDefaultValue(0);
            entity.Property(e => e.Thoigian)
                .HasMaxLength(20)
                .HasColumnName("thoigian");
            entity.Property(e => e.TieuDe).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.YeuCau).HasMaxLength(2000);

            entity.HasOne(d => d.Company).WithMany(p => p.ThongTinTuyenDungs)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ThongTinT__Compa__5812160E");

            entity.HasOne(d => d.IdLocationNavigation).WithMany(p => p.ThongTinTuyenDungs)
                .HasForeignKey(d => d.IdLocation)
                .HasConstraintName("FK__ThongTinT__IdLoc__59063A47");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC070B779CEA");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534DF984524").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(1);
            entity.Property(e => e.Password)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.RefreshToken)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.RefreshTokenCreate).HasColumnType("datetime");
            entity.Property(e => e.RefreshTokenExpires).HasColumnType("datetime");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleId__3E52440B");
        });

        modelBuilder.Entity<Vitri>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vitri__3214EC077FD9B6F0");

            entity.ToTable("Vitri");

            entity.Property(e => e.TenVitri).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
