$body = @{ username = 'admin.nasional'; password = 'Polri2026!' } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/login" -Method POST -Body $body -ContentType "application/json"
$token = $res.token
$data = Invoke-RestMethod -Uri "http://localhost:8080/api/system/device-resources" -Headers @{ Authorization = "Bearer $token" }
$data | ConvertTo-Json -Depth 5
