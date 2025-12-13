# GitHub Pages Deployment Guide

## Repository Setup Complete! ✅

Your Qwirkle Counter repository is now initialized with:
- ✅ All source files committed
- ✅ GitHub Actions workflow configured
- ✅ Training images included
- ✅ Complete documentation

## Next Steps to Deploy

### 1. Create GitHub Repository

```bash
# Go to GitHub.com and create a new repository
# Name: qwirkle-counter (or any name you prefer)
# Do NOT initialize with README, .gitignore, or license (we already have them)
```

### 2. Add Remote and Push

```bash
cd /home/km/repos/qwirkle-counter

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/qwirkle-counter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. The workflow will automatically run and deploy your site

### 4. Access Your App

After deployment completes (1-2 minutes):
- Your app will be available at: `https://YOUR_USERNAME.github.io/qwirkle-counter/`
- You can access it from any mobile device!

## Workflow Details

The GitHub Actions workflow (`deploy.yml`) will:
1. Trigger on every push to `main` branch
2. Upload all files to GitHub Pages
3. Deploy automatically
4. Make the app publicly accessible

## What Gets Deployed

All files in the repository:
- `index.html` - Main app
- `*.js` - JavaScript modules
- `*.css` - Styles
- `*.md` - Documentation
- `training-images/` - Your sample training images

## Using the Deployed App

### On Mobile:
1. Open `https://YOUR_USERNAME.github.io/qwirkle-counter/`
2. Add to home screen for app-like experience
3. Grant camera permissions
4. Start training or playing!

### Training with Your Images:
Since your training images are included in the repo, users can:
1. Download the 6 images from `training-images/` folder
2. Use Grid Splitter to process them
3. Train their own model

Or you could pre-train and share the model!

## Custom Domain (Optional)

To use a custom domain:
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Configure DNS with your domain provider:
   ```
   Type: CNAME
   Name: www (or subdomain)
   Value: YOUR_USERNAME.github.io
   ```

## Updating the App

After making changes:
```bash
git add .
git commit -m "Your commit message"
git push
```

The GitHub Actions workflow will automatically redeploy!

## Security Notes

### Camera Access
- GitHub Pages uses HTTPS by default
- Camera API will work on all devices
- Users will be prompted for camera permissions

### Training Data
- All training data stays on user's device (LocalStorage)
- Models saved in IndexedDB (local)
- No data sent to any server
- Privacy-first design

## Sharing Your App

Share the URL with friends:
```
https://YOUR_USERNAME.github.io/qwirkle-counter/
```

They can:
- Use it immediately (no installation)
- Train with their own tiles
- Or import your training data
- Play Qwirkle with auto-scoring!

## Pre-Training for Others

If you want to share your trained model:

### Option 1: Share Training Data
1. Train your model
2. Click "Export Data"
3. Commit the JSON file to repo
4. Users can "Import Data" to use your training set

### Option 2: Create Tutorial
1. Keep your training images in repo
2. Add instructions in README
3. Users follow your training guide

### Option 3: Pre-trained Model (Advanced)
TensorFlow.js models can be exported and hosted, but:
- Requires additional setup
- Model files are large
- LocalStorage approach is simpler for now

## Repository Structure

```
qwirkle-counter/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions workflow
├── training-images/            ← Your 6 color photos
│   ├── silver.jpg
│   ├── purple.jpg
│   ├── orange.jpg
│   ├── blue.jpg
│   ├── pink.jpg
│   └── purple-blue.jpg
├── *.js                        ← Application code
├── *.css                       ← Styles
├── *.html                      ← Main page
├── *.md                        ← Documentation
├── .gitignore                  ← Git ignore rules
└── serve.py                    ← Local dev server
```

## Monitoring Deployments

Check deployment status:
1. Go to **Actions** tab on GitHub
2. See workflow runs
3. Green checkmark = successful deployment
4. Red X = failed (check logs)

## Troubleshooting

### Workflow Fails
- Check **Actions** tab for error logs
- Ensure repository has Pages enabled
- Verify permissions are correct

### App Not Loading
- Wait 2-3 minutes after first deployment
- Clear browser cache
- Check browser console for errors
- Ensure HTTPS is used (not HTTP)

### Camera Not Working
- Must use HTTPS (GitHub Pages provides this)
- User must grant camera permissions
- Check browser compatibility

## Future Updates

To add features:
1. Edit files locally
2. Test with `python serve.py`
3. Commit and push to GitHub
4. Automatic deployment!

## Analytics (Optional)

To track usage, add Google Analytics:
1. Get tracking ID from Google Analytics
2. Add tracking code to `index.html`
3. Commit and push

## Backup

Your code is now backed up on GitHub!
- Full version history
- Easy to clone/fork
- Collaborate with others

---

## Quick Commands Reference

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub (triggers deployment)
git push

# View commit history
git log --oneline

# Create new branch for testing
git checkout -b feature-name
```

---

## Ready to Deploy?

1. Create GitHub repository
2. Run these commands:

```bash
cd /home/km/repos/qwirkle-counter
git remote add origin https://github.com/YOUR_USERNAME/qwirkle-counter.git
git push -u origin main
```

3. Enable GitHub Pages in repository settings
4. Access at: `https://YOUR_USERNAME.github.io/qwirkle-counter/`

Your app will be live and accessible from any device! 🚀
