using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

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
            string appDataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "PlayVerseApp"
            );

            try
            {
                if (!Directory.Exists(appDataDir))
                {
                    Directory.CreateDirectory(appDataDir);
                }
            }
            catch { }

            // Tạo shortcut ngoài Desktop tự động nếu chưa có
            CreateDesktopShortcut(targetUrl);

            // Mở ứng dụng PlayVerse ở chế độ Desktop Window chuyên biệt
            LaunchApp(targetUrl, appDataDir);
        }

        static void LaunchApp(string url, string dataDir)
        {
            // Danh sách các executable Chromium hỗ trợ chế độ --app
            string[] possibleBrowsers = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
            };

            foreach (string exe in possibleBrowsers)
            {
                if (File.Exists(exe))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = exe,
                            Arguments = string.Format(
                                "--app={0} --window-size=1280,820 --user-data-dir=\"{1}\" --enable-features=WebRtcHideLocalIpsWithMdns,OverlayScrollbar",
                                url,
                                dataDir
                            ),
                            UseShellExecute = true
                        };
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

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
                MessageBox.Show(
                    "Không thể khởi chạy ứng dụng PlayVerse: " + ex.Message,
                    "PlayVerse Lỗi",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        static void CreateDesktopShortcut(string url)
        {
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string shortcutPath = Path.Combine(desktopPath, "PlayVerse.url");
                if (!File.Exists(shortcutPath))
                {
                    using (StreamWriter writer = new StreamWriter(shortcutPath))
                    {
                        writer.WriteLine("[InternetShortcut]");
                        writer.WriteLine("URL=" + url);
                        writer.WriteLine("IconIndex=0");
                    }
                }
            }
            catch { }
        }
    }
}
