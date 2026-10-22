$files = Get-ChildItem -Path "e:\منصة الجنيدي\app\live" -Filter "*.js" -Recurse
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    $content = $content.Replace("ط§ظ„ظ…ط¹ظ„ظ…", "المعلم")
    $content = $content.Replace("ط·ط§ظ„ط¨", "طالب")
    $content = $content.Replace("âڑ ï¸ڈ", "⚠️")
    $content = $content.Replace("ط§ظ„ظ…ظٹظƒط±ظˆظپظˆظ† ظ…ط³طھط®ط¯ظ… ط­ط§ظ„ظٹط§ظ‹ ظ…ظ† طھط·ط¨ظٹظ‚ ط¢ط®ط± (ظ…ط«ظ„ ظ…ظƒط§ظ„ظ…ط© ظ‡ط§طھظپظٹط©).", "الميكروفون مستخدم حالياً من تطبيق آخر (مثل مكالمة هاتفية).")
    $content = $content.Replace("طھط¹ط°ط± ظپطھط­ ط§ظ„ظ…ظٹظƒط±ظˆظپظˆظ† â€” طھط£ظƒط¯ ظ…ظ† ط¥ط°ظ† ط§ظ„ظ…ظٹظƒط±ظˆظپظˆظ† ظپظٹ ط§ظ„ظ…طھطµظپط­.", "تعذر فتح الميكروفون — تأكد من إذن الميكروفون في المتصفح.")
    $content = $content.Replace("ط§ظ„ظƒط§ظ…ظٹط±ط§ ظ…ط³طھط®ط¯ظ…ط© ط­ط§ظ„ظٹط§ظ‹ ظ…ظ† طھط·ط¨ظٹظ‚ ط¢ط®ط±.", "الكاميرا مستخدمة حالياً من تطبيق آخر.")
    $content = $content.Replace("طھط¹ط°ط± ظپطھط­ ط§ظ„ظƒط§ظ…ظٹط±ط§ â€” طھط£ظƒط¯ ظ…ظ† ط¥ط°ظ† ط§ظ„ظƒط§ظ…ظٹط±ط§ ظپظٹ ط§ظ„ظ…طھطµظپط­.", "تعذر فتح الكاميرا — تأكد من إذن الكاميرا في المتصفح.")
    $content = $content.Replace("ظپظٹط¯ظٹظˆ ظٹظˆطھظٹظˆط¨", "فيديو يوتيوب")
    $content = $content.Replace("(ط§ط³ط­ط¨ ظ„ظ„طھط­ط±ظٹظƒ)", "(اسحب للتحريك)")
    $content = $content.Replace("ط¥ط¬ط§ط¨ط© ط§ظ„ط¨ط·ط§ظ‚ط©", "إجابة البطاقة")
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed encoding issues in $($file.Name)"
    }
}
