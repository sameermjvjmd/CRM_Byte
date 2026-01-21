try {
    $body = @{
        subdomain = "test"
        companyName = "Test Corp"
        adminEmail = "admin@test.com"
        adminPassword = "Password123!"
        adminName = "System Admin"
        plan = "Free"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "Registered Tenant: $($response.tenantId)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Details: $($reader.ReadToEnd())"
        }
    }
}
