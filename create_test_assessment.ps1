
# Get student token
$studentResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/dev-login?user=student" -UseBasicParsing
$studentToken = ($studentResp.Content | ConvertFrom-Json).token
$studentId = "6a3a3ed2418aa458b1b2b2fd"

# Get admin token
$adminResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/dev-login?user=admin" -UseBasicParsing
$adminToken = ($adminResp.Content | ConvertFrom-Json).token
$h = @{"Authorization"="Bearer $adminToken"; "Content-Type"="application/json"}

# Create assessment
$startDate = (Get-Date).AddMinutes(5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$endDate = (Get-Date).AddHours(3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$body = @{
    name = "Python Coding Assessment"
    description = "Test the coding interface"
    startDate = $startDate
    endDate = $endDate
    duration = 180
    totalQuestions = 2
    totalMarks = 100
    passingMarks = 50
    programmingLanguages = @("Python", "JavaScript", "Java")
    maxViolations = 3
    assignedStudents = @($studentId)
} | ConvertTo-Json

$createResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments" -Method Post -Headers $h -Body $body -UseBasicParsing
$assessmentData = $createResp.Content | ConvertFrom-Json
$assessmentId = $assessmentData._id

Write-Host "Assessment created with ID: $assessmentId"
Write-Host "Student ID: $studentId"
