$baseUrl = "http://localhost:5000"
$body = @{
    email = "admin@demo.com"
    password = "Password123!"
    tenantId = "default"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Token: $($response.token)"
} catch {
    Write-Host "Login Failed: $_"
}
