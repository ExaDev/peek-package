import type { PackageStats } from "@/types/adapter";

export function exportToCsv(packages: PackageStats[]): void {
  if (packages.length === 0) return;

  const headers = [
    "Package",
    "Description",
    "Weekly Downloads",
    "Total Downloads",
    "GitHub Stars",
    "Forks",
    "Open Issues",
    "Quality Score",
    "Popularity Score",
    "Maintenance Score",
  ];

  const rows = packages.map((pkg) => [
    pkg.name,
    pkg.description || "",
    String(pkg.weeklyDownloads ?? ""),
    String(pkg.totalDownloads ?? ""),
    String(pkg.stars ?? ""),
    String(pkg.forks ?? ""),
    String(pkg.openIssues ?? ""),
    String(pkg.quality ?? ""),
    String(pkg.popularity ?? ""),
    String(pkg.maintenance ?? ""),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or quote
          const cellStr = typeof cell === "string" ? cell : String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `package-comparison-${String(Date.now())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
