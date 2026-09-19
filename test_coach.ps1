Start-Sleep -Seconds 8
$body = ConvertTo-Json @{message="Hello, I have a moderate heart risk score. What are the top 3 lifestyle changes I should make?"}
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/wellness-coach/chat" -Method POST -ContentType "application/json" -Body $body
    Write-Output "=== ENDPOINT TEST RESULT ==="
    Write-Output "Status: SUCCESS"
    Write-Output "Reply:"
    Write-Output $r.reply
} catch {
    Write-Output "=== ENDPOINT TEST RESULT ==="
    Write-Output "Status: FAILED"
    Write-Output "Error: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Output "Response body: $($reader.ReadToEnd())"
    }
}
