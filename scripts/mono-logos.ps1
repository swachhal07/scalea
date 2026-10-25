# Converts client logos to white-on-transparent PNGs for the dark site.
# Each pixel's opacity comes from how dark it is (white backgrounds and white
# knockouts disappear, coloured shapes become solid white), then the result is trimmed.
# Usage: powershell -File scripts/mono-logos.ps1
param(
  [string]$Out = (Join-Path $PSScriptRoot '..\public\brands')
)

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class MonoLogo {
  public static void Convert(string src, string dst) {
    using (var input = new Bitmap(src))
    using (var bmp = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(input, 0, 0, input.Width, input.Height);
      int w = bmp.Width, h = bmp.Height;
      var rect = new Rectangle(0, 0, w, h);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = data.Stride;
      var px = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      // Ink = alpha x darkness. Normalise so the darkest ink becomes fully opaque.
      var ink = new double[w * h];
      double max = 0;
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        int i = y * stride + x * 4;
        double a = px[i + 3] / 255.0;
        double lum = (0.0722 * px[i] + 0.7152 * px[i + 1] + 0.2126 * px[i + 2]) / 255.0;
        double v = a * (1 - lum);
        ink[y * w + x] = v;
        if (v > max) max = v;
      }
      if (max <= 0) max = 1;

      int minX = w, minY = h, maxX = -1, maxY = -1;
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        double v = ink[y * w + x] / max;
        // Lift mid tones so lighter brand colours (yellow, light green) stay visible.
        v = Math.Min(1, Math.Pow(v, 0.6) * 1.05);
        if (v < 0.04) v = 0;
        int i = y * stride + x * 4;
        px[i] = 255; px[i + 1] = 255; px[i + 2] = 255;
        px[i + 3] = (byte)Math.Round(v * 255);
        if (v > 0) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);

      if (maxX < 0) { bmp.Save(dst, ImageFormat.Png); return; }
      var crop = new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
      using (var trimmed = bmp.Clone(crop, PixelFormat.Format32bppArgb)) Save(trimmed, dst);
    }
  }

  // Logos never render wider than 340px, so cap them at 2x that (and a matching height).
  const int MaxW = 680, MaxH = 300;
  static void Save(Bitmap img, string dst) {
    double k = Math.Min(1.0, Math.Min((double)MaxW / img.Width, (double)MaxH / img.Height));
    if (k >= 1) { img.Save(dst, ImageFormat.Png); return; }
    int w = (int)Math.Round(img.Width * k), h = (int)Math.Round(img.Height * k);
    using (var small = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(small)) {
        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
        g.DrawImage(img, 0, 0, w, h);
      }
      small.Save(dst, ImageFormat.Png);
    }
  }
}
"@

$root = Join-Path $PSScriptRoot '..\src'
$map = [ordered]@{
  'mahindra'   = 'mahindra-logo-03-freelogovectors-net_-640x400.png'
  'revolt'     = 'new-logo-1.png'
  'john-deere' = 'john-deere-logo.png'
  'kaifeng'    = 'kaifeng-logo.png'
  'bkt'        = 'pngfind.com-tire-marks-png-139014.png'
  'mv-dugar'   = 'dugar-logo.png'
  'manokamana' = 'manokamana-logo.png'
}
New-Item -ItemType Directory -Force $Out | Out-Null
foreach ($k in $map.Keys) {
  $src = (Resolve-Path (Join-Path $root $map[$k])).Path
  $dst = Join-Path (Resolve-Path $Out).Path "$k.png"
  [MonoLogo]::Convert($src, $dst)
  "$k -> $dst"
}
