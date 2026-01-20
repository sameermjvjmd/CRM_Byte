namespace CRM.Api.Models.Reporting
{
    public class SalesForecastSummary
    {
        public int FiscalYear { get; set; }
        public decimal TotalQuota { get; set; }
        public decimal TotalClosedWon { get; set; }
        public decimal TotalPipelineWeighted { get; set; }
        public decimal AchievementPercent => TotalQuota > 0 ? (TotalClosedWon / TotalQuota) * 100 : 0;
        
        public List<MonthlyForecastItem> MonthlyData { get; set; } = new List<MonthlyForecastItem>();
    }

    public class MonthlyForecastItem
    {
        public int Month { get; set; }
        public string MonthName { get; set; }
        public decimal Quota { get; set; }
        public decimal ClosedWon { get; set; }
        public decimal PipelineWeighted { get; set; } // Probability * Amount
        public decimal PipelineTotal { get; set; } // Raw Amount
    }
}
