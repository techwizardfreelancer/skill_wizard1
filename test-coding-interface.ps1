# Test the Coding Interface

# Colors for output
$green = "Green"
$red = "Red"
$yellow = "Yellow"

Write-Host "🧪 Testing Coding Interface" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Step 1: Get Student Token
Write-Host "`n1️⃣ Authenticating as Student..." -ForegroundColor Yellow
$studentResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/dev-login?user=student" -UseBasicParsing
$studentData = $studentResp.Content | ConvertFrom-Json
$studentToken = $studentData.token
$studentId = ($studentData.token | ConvertFrom-Json -ErrorAction SilentlyContinue).id
Write-Host "✅ Student authenticated: $($studentData.user.name)" -ForegroundColor Green

# Decode JWT to get ID
$parts = $studentToken.Split('.')
$payload = $parts[1]
# Add padding if needed
while ($payload.Length % 4) { $payload += "=" }
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload)) | ConvertFrom-Json
$studentId = $decoded.id
Write-Host "✅ Student ID: $studentId" -ForegroundColor Green

# Step 2: Get Admin Token and Create Assessment
Write-Host "`n2️⃣ Creating Assessment..." -ForegroundColor Yellow
$adminResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/auth/dev-login?user=admin" -UseBasicParsing
$adminToken = ($adminResp.Content | ConvertFrom-Json).token
$h = @{"Authorization"="Bearer $adminToken"; "Content-Type"="application/json"}

$startDate = (Get-Date).AddMinutes(5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$endDate = (Get-Date).AddHours(3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$body = @{
    name = "Python Coding Test"
    description = "Test the coding interface"
    startDate = $startDate
    endDate = $endDate
    duration = 180
    totalMarks = 100
    passingMarks = 50
    programmingLanguages = @("Python", "JavaScript", "Java")
    maxViolations = 3
    assignedStudents = @($studentId)
} | ConvertTo-Json

$createResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments" -Method Post -Headers $h -Body $body -UseBasicParsing
$assessmentId = ($createResp.Content | ConvertFrom-Json)._id
Write-Host "✅ Assessment created: $assessmentId" -ForegroundColor Green

# Step 3: Create Questions
Write-Host "`n3️⃣ Creating Questions..." -ForegroundColor Yellow
$questions = @(
    @{
        title = "Sum of Two Numbers"
        description = "Write a function that returns the sum of two numbers."
        difficulty = "Easy"
        type = "Programming"
        marks = 10
        sampleInput = "2, 3"
        sampleOutput = "5"
        constraints = "Numbers will be between 0 and 1000"
    },
    @{
        title = "Palindrome Check"
        description = "Check if a string is a palindrome."
        difficulty = "Medium"
        type = "Programming"
        marks = 15
        sampleInput = "racecar"
        sampleOutput = "true"
        constraints = "String length < 1000"
    }
)

$questionIds = @()
foreach ($q in $questions) {
    $qBody = $q | ConvertTo-Json
    $qResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/questions" -Method Post -Headers $h -Body $qBody -UseBasicParsing -ErrorAction SilentlyContinue
    if ($qResp.StatusCode -eq 201 -or $qResp.StatusCode -eq 200) {
        $qId = ($qResp.Content | ConvertFrom-Json)._id
        $questionIds += $qId
        Write-Host "  ✅ Question created: $($q.title)" -ForegroundColor Green
    }
}

# Step 4: Assign Questions to Assessment
Write-Host "`n4️⃣ Assigning Questions to Assessment..." -ForegroundColor Yellow
$assignBody = @{
    questionIds = $questionIds
} | ConvertTo-Json
$assignResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments/$assessmentId/assign-questions" -Method Post -Headers $h -Body $assignBody -UseBasicParsing
Write-Host "✅ Questions assigned" -ForegroundColor Green

# Step 5: Test Student API Access
Write-Host "`n5️⃣ Testing Student API Endpoints..." -ForegroundColor Yellow
$sh = @{"Authorization"="Bearer $studentToken"; "Content-Type"="application/json"}

# Test: Get assessment
$getAssessResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments/$assessmentId" -Headers $sh -UseBasicParsing -ErrorAction SilentlyContinue
if ($getAssessResp.StatusCode -eq 200) {
    Write-Host "  ✅ Get assessment endpoint works" -ForegroundColor Green
} else {
    Write-Host "  ❌ Get assessment endpoint failed" -ForegroundColor Red
}

# Test: Get questions
$getQuestionsResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments/$assessmentId/questions" -Headers $sh -UseBasicParsing -ErrorAction SilentlyContinue
if ($getQuestionsResp.StatusCode -eq 200) {
    $qCount = ($getQuestionsResp.Content | ConvertFrom-Json).questions.Count
    Write-Host "  ✅ Get questions endpoint works ($qCount questions)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Get questions endpoint failed" -ForegroundColor Red
}

# Test: Start assessment
$startBody = @{ assessmentId = $assessmentId } | ConvertTo-Json
$startResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments/start" -Method Post -Headers $sh -Body $startBody -UseBasicParsing -ErrorAction SilentlyContinue
if ($startResp.StatusCode -eq 200 -or $startResp.StatusCode -eq 201) {
    Write-Host "  ✅ Start assessment endpoint works" -ForegroundColor Green
} else {
    Write-Host "  ❌ Start assessment endpoint failed: $($startResp.StatusCode)" -ForegroundColor Red
}

# Step 6: Test Code Execution
Write-Host "`n6️⃣ Testing Code Execution..." -ForegroundColor Yellow
$codeBody = @{
    assessmentId = $assessmentId
    code = "print(2 + 3)"
    language = "Python"
} | ConvertTo-Json
$codeResp = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/assessments/run-code" -Method Post -Headers $sh -Body $codeBody -UseBasicParsing -ErrorAction SilentlyContinue
if ($codeResp.StatusCode -eq 200) {
    $output = ($codeResp.Content | ConvertFrom-Json)
    Write-Host "  ✅ Code execution works" -ForegroundColor Green
    Write-Host "  Output: $($output.output)" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ Code execution failed: $($codeResp.StatusCode)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Yellow
Write-Host "✅ TEST SUMMARY" -ForegroundColor Green
Write-Host "Assessment ID: $assessmentId" -ForegroundColor Cyan
Write-Host "Student ID: $studentId" -ForegroundColor Cyan
Write-Host "Access URL: http://localhost:5173/student/assessments/$assessmentId/test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Yellow
