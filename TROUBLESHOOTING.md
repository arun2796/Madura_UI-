# Troubleshooting Guide - Empty Data Issue

## Problem: Data Not Loading from JSON Server

If you're seeing empty data in your application, follow these steps:

---

## ✅ Step 1: Check if JSON Server is Running

### Check Current Processes
Open a terminal and run:
```bash
netstat -ano | findstr :3002
```

If you see output, the port is in use. If not, the server is not running.

### Start JSON Server
```bash
npm run server
```

Or manually:
```bash
npx json-server --watch db.json --port 3002
```

You should see:
```
JSON Server started on PORT :3002
Endpoints:
http://localhost:3002/bindingAdvices
http://localhost:3002/jobCards
...
```

---

## ✅ Step 2: Verify Environment Configuration

### Check .env File
Make sure your `.env` file in the root directory contains:
```env
VITE_API_BASE_URL=http://localhost:3002
VITE_APP_NAME=Madura ERP
```

### Restart Frontend After .env Changes
**IMPORTANT:** Vite only reads `.env` on startup. After changing `.env`:
1. Stop the dev server (Ctrl+C)
2. Restart it: `npm run dev`

---

## ✅ Step 3: Test API Connection Directly

### Test in Browser
Open these URLs in your browser:
- http://localhost:3002/bindingAdvices
- http://localhost:3002/jobCards
- http://localhost:3002/inventory

You should see JSON data. If you get an error, the server isn't running.

### Use the Built-in Diagnostics Page
Navigate to: http://localhost:5173/api-diagnostics

This page will:
- Test all API endpoints
- Show which ones are working
- Display error messages
- Provide troubleshooting tips

---

## ✅ Step 4: Check Browser Console

1. Open your application in the browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Look for errors like:
   - `Network error`
   - `ERR_CONNECTION_REFUSED`
   - `404 Not Found`

### Common Console Errors

#### Error: `ERR_CONNECTION_REFUSED`
**Cause:** JSON server is not running
**Solution:** Start the JSON server (see Step 1)

#### Error: `404 Not Found`
**Cause:** Wrong API URL or endpoint
**Solution:** Check your .env file and restart frontend

#### Error: `CORS Error`
**Cause:** CORS not configured
**Solution:** The json-server should handle CORS automatically. If not, check `json-server-middleware.js`

---

## ✅ Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for API calls to `localhost:3002`

### What to Check:
- **Status Code:** Should be 200 (green)
- **Response:** Should contain JSON data
- **Request URL:** Should be `http://localhost:3002/...`

### If Status is Red (Failed):
- Server is not running
- Wrong port number
- Network issue

---

## ✅ Step 6: Verify db.json Has Data

Open `db.json` and check if it contains data:
```json
{
  "bindingAdvices": [
    {
      "id": "d17c",
      "clientName": "Government School",
      ...
    }
  ],
  "jobCards": [...],
  "inventory": [...]
}
```

If the file is empty or corrupted, restore it from backup or recreate it.

---

## ✅ Step 7: Clear Browser Cache

Sometimes cached data causes issues:
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or:
- Chrome: Ctrl+Shift+Delete → Clear cache
- Firefox: Ctrl+Shift+Delete → Clear cache

---

## ✅ Step 8: Check React Query DevTools

1. Look for the React Query DevTools icon in the bottom-left corner
2. Click it to open
3. Check the "Queries" tab
4. Look for queries with status:
   - ✅ Success (green) - Data loaded
   - ⏳ Loading (yellow) - Still fetching
   - ❌ Error (red) - Failed to load

---

## 🚀 Quick Fix Checklist

Run these commands in order:

```bash
# 1. Stop all running processes (Ctrl+C in terminals)

# 2. Start JSON Server
npm run server

# 3. In a NEW terminal, start frontend
npm run dev

# 4. Open browser to http://localhost:5173

# 5. Check diagnostics page
# Navigate to: http://localhost:5173/api-diagnostics
```

---

## 🔧 Advanced Troubleshooting

### Port Conflicts

If port 3002 is already in use:

1. Find the process using the port:
```bash
netstat -ano | findstr :3002
```

2. Kill the process (replace PID with actual process ID):
```bash
taskkill /PID <PID> /F
```

3. Or use a different port:
```bash
npx json-server --watch db.json --port 3003
```

Then update `.env`:
```env
VITE_API_BASE_URL=http://localhost:3003
```

### Check API Service Configuration

Open `src/services/api.ts` and verify:
```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
```

The fallback should match your server port.

### Test API from Command Line

Using curl (if installed):
```bash
curl http://localhost:3002/bindingAdvices
```

Using PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3002/bindingAdvices
```

---

## 📝 Common Scenarios

### Scenario 1: "Everything was working, now it's not"
**Solution:** Restart both servers
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### Scenario 2: "I changed .env but nothing changed"
**Solution:** Restart the frontend dev server
```bash
# Stop with Ctrl+C, then:
npm run dev
```

### Scenario 3: "API works in browser but not in app"
**Solution:** Check CORS and browser console for errors

### Scenario 4: "Some data loads, some doesn't"
**Solution:** Check specific endpoints in diagnostics page

---

## 🆘 Still Not Working?

1. **Check the diagnostics page:** http://localhost:5173/api-diagnostics
2. **Open browser console** (F12) and copy any error messages
3. **Check JSON server terminal** for error messages
4. **Verify db.json** is not corrupted
5. **Try the quick fix checklist** above

---

## 📞 Getting Help

When asking for help, provide:
1. Screenshot of browser console errors
2. Screenshot of Network tab showing failed requests
3. Output from JSON server terminal
4. Your `.env` file contents
5. Screenshot of diagnostics page

---

## ✨ Prevention Tips

1. **Always run both servers:**
   - JSON Server (backend): `npm run server`
   - Vite Dev Server (frontend): `npm run dev`

2. **Use the combined command:**
   ```bash
   npm run dev:full
   ```
   This starts both servers automatically.

3. **Bookmark the diagnostics page:**
   http://localhost:5173/api-diagnostics

4. **Check server status before debugging:**
   Look for "JSON Server started on PORT :3002" message

---

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ JSON server shows "JSON Server started on PORT :3002"
- ✅ Frontend shows "VITE ready in XXX ms"
- ✅ Diagnostics page shows all endpoints green
- ✅ Dashboard displays data (not empty)
- ✅ Browser console has no red errors
- ✅ Network tab shows 200 status codes

---

**Last Updated:** 2025-09-30

