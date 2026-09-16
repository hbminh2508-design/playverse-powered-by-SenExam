using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

namespace PlayVerse
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string targetUrl = "https://playverse.senexam.me";

            DialogResult result = MessageBox.Show(
                "Chào mừng bạn đến với PlayVerse (Discord-like Community App)!\n\n" +
                "Bạn có muốn khởi chạy PlayVerse ở chế độ Ứng Dụng Desktop không?\n\n" +
                "• Nhấn 'Yes' để mở ứng dụng PlayVerse ngay lập tức.\n" +
                "• Nhấn 'No' để tạo biểu tượng PlayVerse trên Màn hình chính (Desktop).",
                "PlayVerse for Windows Setup v1.0.0",
                MessageBoxButtons.YesNoCancel,
                MessageBoxIcon.Information
            );

            if (result == DialogResult.Yes)
            {
                LaunchApp(targetUrl);
            }
            else if (result == DialogResult.No)
            {
                CreateDesktopShortcut(targetUrl);
                MessageBox.Show(
                    "Đã tạo lối tắt PlayVerse trên Màn hình Desktop thành công!\nBạn có thể khởi chạy ứng dụng bất kỳ lúc nào.",
                    "PlayVerse Setup",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
                LaunchApp(targetUrl);
            }
        }

        static void LaunchApp(string url)
        {
            try
            {
                // Thử mở bằng Edge ở chế độ App Window (không thanh địa chỉ, giống Discord thật)
                string edgePath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                    @"Microsoft\Edge\Application\msedge.exe"
                );

                if (File.Exists(edgePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = "--app=" + url + " --window-size=1280,800",
                        UseShellExecute = true
                    });
                    return;
                }
            }
            catch { }

            // Fallback mở trình duyệt mặc định
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Lỗi khởi chạy: " + ex.Message);
            }
        }

        static void CreateDesktopShortcut(string url)
        {
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string shortcutPath = Path.Combine(desktopPath, "PlayVerse.url");
                using (StreamWriter writer = new StreamWriter(shortcutPath))
                {
                    writer.WriteLine("[InternetShortcut]");
                    writer.WriteLine("URL=" + url);
                    writer.WriteLine("IconIndex=0");
                }
            }
            catch { }
        }
    }
}
