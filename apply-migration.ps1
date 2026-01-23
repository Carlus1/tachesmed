# Script pour appliquer la migration de la période d'indisponibilités

Write-Host "Application de la migration pour ajouter le champ unavailability_period_weeks..." -ForegroundColor Cyan

# Lire le fichier SQL
$migrationFile = "supabase\migrations\20260123_add_unavailability_period.sql"
$sqlContent = Get-Content $migrationFile -Raw

Write-Host "`nContenu de la migration:" -ForegroundColor Yellow
Write-Host $sqlContent

Write-Host "`n`nPour appliquer cette migration à votre base Supabase:" -ForegroundColor Green
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Sélectionnez votre projet" -ForegroundColor White
Write-Host "3. Allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "4. Créez une nouvelle requête" -ForegroundColor White
Write-Host "5. Copiez-collez le contenu ci-dessus" -ForegroundColor White
Write-Host "6. Exécutez la requête" -ForegroundColor White

Write-Host "`nOu via la CLI Supabase:" -ForegroundColor Green
Write-Host "supabase db push" -ForegroundColor White

Read-Host "`nAppuyez sur Entrée pour continuer"
