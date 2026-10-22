$txt = [System.IO.File]::ReadAllText('.\parse_prep3.ps1')
$utf8 = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText('.\parse_prep3_bom.ps1', $txt, $utf8)
& .\parse_prep3_bom.ps1
