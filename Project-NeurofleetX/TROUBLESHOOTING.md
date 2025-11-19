# NeuroFleetX Troubleshooting Guide

## Common Issues & Solutions

### 1. **Login Page Loads but API Calls Fail**
**Symptom**: Login form appears, but login button doesn't work or shows error.

**Solution**:
- Ensure backend is running: `netstat -ano | findstr ":8081"`
- Check backend logs for errors
- Verify proxy is working: Open DevTools (F12) → Network tab → try login → check if requests go to `http://localhost:3000/api/auth/login`
- If requests show CORS errors, the backend is not reachable through the proxy

**Fix**: Restart both servers:
```powershell
# Kill existing processes
Get-Process java | Stop-Process -Force
Get-Process node | Stop-Process -Force

# Restart backend
Set-Location 'C:\Users\nimis\OneDrive\Documents\K\INFOSYS\new\frontend\frontend\backend'
Start-Process java -ArgumentList '-jar','target\neurofleetx-backend-0.0.1-SNAPSHOT.jar' -NoNewWindow

# Restart frontend (in new terminal)
Set-Location 'C:\Users\nimis\OneDrive\Documents\K\INFOSYS\new\frontend\frontend'
Start-Process npm.cmd -ArgumentList 'start' -NoNewWindow
```

---

### 2. **MongoDB Connection Error**
**Symptom**: Backend logs show "MongoTimeoutException" or "Unable to connect to MongoDB"

**Solution**:
- Ensure MongoDB is running locally on port 27017
- Check: `netstat -ano | findstr ":27017"`
- If not running, start MongoDB:
  ```powershell
  # On Windows, if MongoDB is installed as a service:
  Start-Service MongoDB
  
  # Or run manually:
  mongod --dbpath C:\path\to\data
  ```

---

### 3. **Port Already in Use**
**Symptom**: Backend or frontend fails to start with "Address already in use"

**Solution**:
- Find process using the port:
  ```powershell
  # For port 8081 (backend)
  netstat -ano | findstr ":8081"
  
  # For port 3000 (frontend)
  netstat -ano | findstr ":3000"
  ```
- Kill the process:
  ```powershell
  Stop-Process -Id <PID> -Force
  ```
- Then restart the server

---

### 4. **Frontend Shows Blank Page or 404**
**Symptom**: Browser shows nothing or "Cannot GET /"

**Solution**:
- Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Check if dev server is running: `netstat -ano | findstr ":3000"`
- Check frontend console: F12 → Console tab for errors

---

### 5. **Login Works but Dashboard Shows No Data**
**Symptom**: User logs in successfully but dispatcher/driver/admin dashboard shows empty or "Loading..." forever

**Solution**:
- Open DevTools (F12) → Network tab
- Try to load the page
- Check if API calls are failing (red X on requests)
- Common causes:
  1. Backend is offline — check `netstat -ano | findstr ":8081"`
  2. JWT token expired — logout and login again
  3. User doesn't have the right role — check backend DataLoader for seeded roles

**Fix**: Try logout and login again:
- Click logout button if available
- Clear localStorage: F12 → Application → localStorage → clear all
- Refresh page and login again

---

### 6. **API Returns 403 Forbidden**
**Symptom**: Backend API returns 403 error when accessing protected endpoints

**Solution**:
- Ensure JWT token is being sent in Authorization header
- Check backend logs for security filter messages
- Try logging in again to refresh token
- Verify role has permission for that endpoint (check SecurityConfig.java)

---

### 7. **Proxy Not Working (Frontend Can't Reach Backend)**
**Symptom**: Network requests show `ECONNREFUSED` or `Proxy error`

**Solution**:
- Verify `package.json` has: `"proxy": "http://localhost:8081"`
- Restart npm dev server:
  ```powershell
  Get-Process node | Stop-Process -Force
  npm start
  ```
- Wait ~30 seconds for dev server to fully start

---

### 8. **CSS/Styling Not Loading**
**Symptom**: Page loads but looks unstyled (no colors, fonts, or layout)

**Solution**:
- Check if `index.css` exists: `src/index.css`
- Hard refresh page: Ctrl+Shift+R
- Check DevTools Console for CSS loading errors
- Restart dev server

---

## Quick Diagnostics Script

Run this PowerShell script to check all services:

```powershell
Write-Host "=== NeuroFleetX Diagnostics ===" -ForegroundColor Cyan

Write-Host "`nChecking Backend..." -ForegroundColor Yellow
$backend = netstat -ano | findstr ":8081"
if ($backend) { Write-Host "✓ Backend running on 8081" -ForegroundColor Green } else { Write-Host "✗ Backend NOT running" -ForegroundColor Red }

Write-Host "`nChecking Frontend..." -ForegroundColor Yellow
$frontend = netstat -ano | findstr ":3000"
if ($frontend) { Write-Host "✓ Frontend running on 3000" -ForegroundColor Green } else { Write-Host "✗ Frontend NOT running" -ForegroundColor Red }

Write-Host "`nChecking MongoDB..." -ForegroundColor Yellow
$mongo = netstat -ano | findstr ":27017"
if ($mongo) { Write-Host "✓ MongoDB running on 27017" -ForegroundColor Green } else { Write-Host "✗ MongoDB NOT running" -ForegroundColor Red }

Write-Host "`nTesting Backend API..." -ForegroundColor Yellow
try {
  $r = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method Post -Body '{"email":"admin@neurofleetx.com","password":"admin123"}' -ContentType 'application/json' -ErrorAction Stop
  Write-Host "✓ Backend API responding correctly" -ForegroundColor Green
} catch {
  Write-Host "✗ Backend API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== End Diagnostics ===" -ForegroundColor Cyan
```

---

## Demo Credentials

Use these to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@neurofleetx.com | admin123 |
| Dispatcher | dispatcher@neurofleetx.com | dispatcher123 |
| Driver | driver@neurofleetx.com | driver123 |

---

## Logs Location

- **Backend logs**: Console output or check Spring Boot logs in terminal
- **Frontend logs**: Browser DevTools → Console (F12)
- **MongoDB logs**: MongoDB console output

---

## Still Having Issues?

1. Check backend logs in the terminal running `java -jar ...`
2. Open DevTools (F12) and check:
   - Console tab for JavaScript errors
   - Network tab for API call failures
   - Application tab for localStorage/cookies
3. Ensure MongoDB is running and accessible
4. Try restarting all services

