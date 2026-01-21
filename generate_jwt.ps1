function New-JwtToken {
    param (
        [string]$SecretKey,
        [string]$Issuer = "NexusCRM",
        [string]$Audience = "NexusCRM-Users",
        [int]$ExpirationMinutes = 60
    )

    $header = @{
        alg = "HS256"
        typ = "JWT"
    }

    $payload = @{
        sub = "1"
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" = "1"
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" = "admin@demo.com"
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" = "Admin"
        iss = $Issuer
        aud = $Audience
        exp = [int][double]::Parse((Get-Date).AddMinutes($ExpirationMinutes).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    }

    $headerJson = $header | ConvertTo-Json -Compress
    $payloadJson = $payload | ConvertTo-Json -Compress

    $headerBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($headerJson)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    $payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payloadJson)).TrimEnd('=').Replace('+', '-').Replace('/', '_')

    $signatureData = "$headerBase64.$payloadBase64"
    
    $secretBytes = [System.Text.Encoding]::UTF8.GetBytes($SecretKey)
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $secretBytes
    $signatureBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signatureData))
    $signatureBase64 = [Convert]::ToBase64String($signatureBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

    return "$headerBase64.$payloadBase64.$signatureBase64"
}

$secret = "YourSuperSecretKeyThatIsAtLeast32CharactersLong!@#$"
$token = New-JwtToken -SecretKey $secret

Write-Host "Generated Token:"
Write-Host $token

# Update test-custom-fields.ps1 with this token
$testScriptParams = @{
    Token = $token
}
