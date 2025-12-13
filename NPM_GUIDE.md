# Quick Start with Node.js/npm

## Running the App Locally

### Option 1: Simple Server (Recommended)
```bash
cd /home/km/repos/qwirkle-counter

# Start the server
npm start

# Or with auto-open in browser
npm run dev
```

The app will be available at: `http://localhost:8000`

### Option 2: Direct npx (No npm needed)
```bash
npx http-server -p 8000 -c-1
```

## Adding Pre-trained Models

### Using the Node.js Script
```bash
# Run the interactive setup
npm run add-models

# Or directly
node add_models.js
```

The script will:
1. Ask for paths to your exported models
2. Copy them to the correct location
3. Create metadata
4. Show you a summary

## Development Commands

```bash
# Start server on port 8000
npm start

# Start server and open browser
npm run dev

# Just serve (same as start)
npm run serve

# Add pre-trained models
npm run add-models
```

## Accessing on Mobile

After running `npm start`:

1. Find your computer's IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

2. On your mobile device, open:
   ```
   http://YOUR_COMPUTER_IP:8000
   ```

3. Grant camera permissions when prompted

## First Time Setup

```bash
# 1. Navigate to project
cd /home/km/repos/qwirkle-counter

# 2. Start server
npm start

# 3. Open browser
# Go to http://localhost:8000

# 4. (Optional) Add your pre-trained models
npm run add-models
```

## No Installation Needed!

These commands use `npx` which downloads packages on-the-fly:
- No `npm install` required
- No `node_modules` directory
- No package lock files
- Just run and go!

## Alternative: Python Server

If you prefer Python:
```bash
python serve.py
# or
python -m http.server 8000
```

But with Node.js available, `npm start` is cleaner!

## Testing the App

### Desktop Browser
```bash
npm start
# Open http://localhost:8000
```

### Mobile Device
```bash
npm start
# Find your IP: ifconfig (look for 192.168.x.x)
# On phone: http://192.168.x.x:8000
```

### Camera Access
- ✅ Works on localhost
- ✅ Works on local network (http://192.168.x.x)
- ⚠️ For production, need HTTPS (GitHub Pages provides this)

## Stopping the Server

Press `Ctrl+C` in the terminal

## Package.json Scripts

```json
{
  "scripts": {
    "start": "npx http-server -p 8000 -c-1",
    "dev": "npx http-server -p 8000 -c-1 -o",
    "serve": "npx http-server -p 8000 -c-1",
    "add-models": "node add_models.js"
  }
}
```

## Cache-Control

The `-c-1` flag disables caching, useful for development. Your changes are immediately visible on refresh!

---

## Quick Commands Reference

```bash
# Start developing
npm start

# Add your trained models
npm run add-models

# Commit changes
git add .
git commit -m "Your message"
git push

# Deploy to GitHub Pages
# (After pushing to GitHub and enabling Pages)
# Your app will be at:
# https://YOUR_USERNAME.github.io/qwirkle-counter/
```

Simple and clean! 🚀
