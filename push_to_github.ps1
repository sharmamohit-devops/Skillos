Write-Host "Adding all files to git..."
git add .

Write-Host "Committing changes..."
git commit -m "Ready for Vercel deployment - Fixed build issues and added deployment checklist"

Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Done! Code pushed to GitHub successfully."