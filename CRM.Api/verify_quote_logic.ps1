$ErrorActionPreference = "Stop"

function Test-QuoteLogic {
    Write-Host "Starting Quote Logic Verification..." -ForegroundColor Cyan

    # 1. Prepare Payload with Multiple Line Items
    $payload = @{
        subject = "Logic Verification Quote"
        contactId = 17
        companyId = 1
        quoteDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        expirationDate = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")
        status = "Draft"
        currency = "USD"
        paymentTerms = "Net30"
        lineItems = @(
            @{
                name = "Widget A"
                quantity = 2
                unitPrice = 50.00
                discount = 0
                taxRate = 0
                unitOfMeasure = "Each"
                isTaxable = $false
                cost = 40.00
                sortOrder = 1
            },
            @{
                name = "Widget B"
                quantity = 1
                unitPrice = 75.00
                discount = 0
                taxRate = 0
                unitOfMeasure = "Each"
                isTaxable = $false
                cost = 60.00
                sortOrder = 2
            }
        )
    }

    $jsonPayload = $payload | ConvertTo-Json -Depth 5

    # 2. Create Quote
    Write-Host "Creating Quote..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/quotes" -Method Post -Body $jsonPayload -ContentType "application/json"
        Write-Host "Success! Quote ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "Failed!" -ForegroundColor Red
        if ($_.Exception.Response) {
             $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
             $err = $reader.ReadToEnd()
             Write-Host "Server Message: $err" -ForegroundColor Yellow
             $err | Out-File "d:\Project(s)\CRM_ACT\CRM.Api\last_error.txt"
        }
        return
    }

    # 3. Verify Totals
    $quoteId = $response.id
    Write-Host "Verifying Totals for Quote $quoteId..."
    
    $expectedTotal = (2 * 50.00) + (1 * 75.00) # 175.00
    $actualTotal = $response.total

    if ($actualTotal -eq $expectedTotal) {
        Write-Host "--------------------------------------------------" -ForegroundColor Green
        Write-Host "VERIFICATION PASSED" -ForegroundColor Green
        Write-Host "Expected Total: $expectedTotal"
        Write-Host "Actual Total:   $actualTotal"
        Write-Host "--------------------------------------------------" -ForegroundColor Green
    } else {
        Write-Host "--------------------------------------------------" -ForegroundColor Red
        Write-Host "VERIFICATION FAILED" -ForegroundColor Red
        Write-Host "Expected Total: $expectedTotal"
        Write-Host "Actual Total:   $actualTotal"
        Write-Host "--------------------------------------------------" -ForegroundColor Red
    }
    
    # 4. Fetch to confirm persistence
    $fetchedQuote = Invoke-RestMethod -Uri "http://localhost:5000/api/quotes/$quoteId" -Method Get
    if ($fetchedQuote.lineItems.Count -eq 2) {
         Write-Host "Persistence Check: Passed (2 line items found)" -ForegroundColor Green
    } else {
         Write-Host "Persistence Check: Failed (Line items missing)" -ForegroundColor Red
    }
}

Test-QuoteLogic
