# 🚀 Eco Donations Development Server

This guide provides multiple ways to start your development server correctly every time.

## 🎯 Quick Start (Recommended)

### Option 1: Using the Startup Script

```bash
# From the project root directory
./start-dev-server.sh
```

### Option 2: Using npm commands

```bash
# Simple start
npm run dev

# Start with cleanup (kills any existing servers first)
npm run dev-clean

# Alternative using the script
npm start
```

### Option 3: Using aliases (optional setup)

```bash
# Add to your ~/.zshrc or ~/.bashrc:
source /Users/petermichell/Eco---Donations-/dev-aliases.sh

# Then use:
eco-dev          # Start server
eco-dev-clean    # Start server with cleanup
eco-urls         # Show access URLs
```

## 🌐 Access URLs

Once started, your site will be available at:

- **Desktop**: http://localhost:8888
- **iPhone/Mobile**: http://[YOUR_LOCAL_IP]:8888

## 🛠️ Manual Setup (if needed)

If you need to start manually:

```bash
# 1. Navigate to project root
cd /Users/petermichell/Eco---Donations-

# 2. Kill any existing servers
pkill -f "python3 -m http.server"

# 3. Navigate to frontend directory
cd frontend

# 4. Start server
python3 -m http.server 8888
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill all Python HTTP servers
pkill -f "python3 -m http.server"

# Check what's using port 8888
lsof -i :8888

# Try a different port
python3 -m http.server 9000
```

### Directory Listing Instead of Website

This means the server is running from the wrong directory. Always ensure:

1. You're running from the project root, OR
2. The script navigates to the frontend directory correctly

### Mobile Access Not Working

1. Make sure your phone is on the same WiFi network
2. Check your local IP: `ifconfig | grep "inet "`
3. Try turning WiFi off/on on your phone

## 📁 File Structure

The server must run from the `frontend/` directory which contains:

- `index.html` (main page)
- `css/` (stylesheets including mobile-hero.css)
- `js/` (JavaScript files)
- Other assets

## 🎨 Development Workflow

1. Start server using any method above
2. Open both desktop and mobile URLs
3. Edit files in VS Code
4. Save changes
5. Refresh browser to see updates
6. Test on both desktop and mobile

## 📝 Notes

- The server automatically finds your local IP for mobile access
- Port 8888 is used by default (change in scripts if needed)
- The startup script includes cleanup to prevent conflicts
- All methods ensure the server runs from the correct directory
