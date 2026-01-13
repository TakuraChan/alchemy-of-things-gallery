# Complete Deployment Guide – GitHub + Netlify + Custom Domains

**Time needed: 25-30 minutes**

This guide will get your site live at both:
- alchemyofthings.com
- alchemyofthings.co.za

---

## ✅ What You Need

- [x] GitHub account (username: TakuraChan)
- [x] Netlify account
- [x] alchemyofthings.com registered at GoDaddy
- [x] alchemyofthings.co.za registered at GoDaddy
- [x] All website files downloaded from Claude

---

## 📦 PHASE 1: Create GitHub Repository (5 minutes)

### Step 1.1: Create New Repository

1. Go to [github.com](https://github.com) and login
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `alchemy-of-things-gallery`
   - **Description:** `Art gallery website for Alchemy of Things`
   - **Visibility:** 
     - Choose **Public** (free, recommended)
     - OR **Private** (if you have paid GitHub)
   - ✅ Check **"Add a README file"**
   - **Add .gitignore:** None (we'll add our own)
   - **License:** None
4. Click **"Create repository"**

### Step 1.2: Upload Website Files

**Option A: Via Web Interface (Easier)**

1. In your new repository, click **"Add file"** → **"Upload files"**
2. Drag and drop ALL these files/folders:
   ```
   index.html
   styles.css
   script.js
   admin.html
   admin-styles.css
   admin-script.js
   netlify.toml
   images/ (entire folder with SVG placeholders)
   ```
3. **Important:** Also rename `README-GITHUB.md` to `README.md` and upload it
4. In the commit message box, write: `Initial commit - gallery website`
5. Click **"Commit changes"**

**Option B: Via Git Command Line (Advanced)**

If you're comfortable with Git:
```bash
# Navigate to your website folder
cd path/to/lambda-of-things-website

# Initialize Git
git init

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/TakuraChan/alchemy-of-things-gallery.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - gallery website"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 1.3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all files listed
3. Click on `index.html` to verify it uploaded correctly

✅ **Phase 1 Complete!** Your code is now on GitHub.

---

## 🚀 PHASE 2: Deploy to Netlify (5 minutes)

### Step 2.1: Connect GitHub to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and login
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. **First time:** Authorize Netlify to access your GitHub
   - Click **"Authorize Netlify"**
   - You may need to enter your GitHub password
5. Find and click your repository: **`TakuraChan/alchemy-of-things-gallery`**

### Step 2.2: Configure Site Settings

Netlify will show deployment settings:

1. **Branch to deploy:** `main` (should be auto-selected)
2. **Build command:** Leave empty (it's a static site)
3. **Publish directory:** `.` (just a dot, or leave empty)
4. Click **"Deploy site"**

### Step 2.3: Wait for Deployment

1. Netlify will start deploying (takes 30-60 seconds)
2. You'll see "Site deploy in progress"
3. Wait for **"Published"** status
4. You'll get a random URL like: `random-name-123.netlify.app`

### Step 2.4: Test Your Site

1. Click on the random Netlify URL
2. Your site should load!
3. Test:
   - Gallery displays (gray boxes with red squares)
   - Language switcher (click flags)
   - Contact form
   - Admin panel: `your-site.netlify.app/admin.html`

✅ **Phase 2 Complete!** Your site is live on Netlify.

---

## 🌐 PHASE 3: Connect alchemyofthings.com (10 minutes)

### Step 3.1: Add Custom Domain in Netlify

1. In Netlify, go to your site dashboard
2. Click **"Domain settings"** (or "Set up a custom domain")
3. Click **"Add custom domain"**
4. Enter: `alchemyofthings.com`
5. Click **"Verify"**
6. Netlify will say: "Check DNS configuration"
7. Netlify will show you what DNS records to add

### Step 3.2: Configure DNS at GoDaddy

1. Open new tab → Go to [godaddy.com](https://godaddy.com)
2. Login → Go to **"My Products"**
3. Find **alchemyofthings.com** → Click **"DNS"**

### Step 3.3: Add Netlify's DNS Records

Netlify will give you either:

**Option A: Name Servers (Recommended by Netlify)**
1. Netlify shows 4 name servers (e.g., `dns1.p08.nsone.net`)
2. In GoDaddy:
   - Scroll to **"Nameservers"** section
   - Click **"Change"**
   - Select **"Enter my own nameservers"**
   - Enter all 4 Netlify nameservers
   - Save
3. **Wait time:** 24-48 hours (usually faster, ~1-4 hours)

**Option B: A Record + CNAME (Faster but more manual)**
1. Netlify shows an IP address and CNAME target
2. In GoDaddy DNS management:
   - **Add A Record:**
     - Type: `A`
     - Name: `@`
     - Value: `[IP from Netlify]` (e.g., `75.2.60.5`)
     - TTL: 600 seconds
   - **Add CNAME Record:**
     - Type: `CNAME`
     - Name: `www`
     - Value: `[your-site].netlify.app`
     - TTL: 600 seconds
   - **Save**
3. **Wait time:** 10-60 minutes

### Step 3.4: Enable HTTPS (Automatic)

1. Back in Netlify, go to **"Domain settings"**
2. Scroll to **"HTTPS"**
3. Netlify will automatically provision SSL certificate
4. Wait for **"HTTPS certificate ready"**
5. ✅ Enable **"Force HTTPS"** (redirects http to https)

✅ **Phase 3 Complete!** alchemyofthings.com now points to your site.

---

## 🌍 PHASE 4: Connect alchemyofthings.co.za (5 minutes)

This domain will be an **alias** - visitors to .co.za see the same site as .com

### Step 4.1: Add Domain Alias in Netlify

1. In Netlify, go to **"Domain settings"**
2. Click **"Add domain alias"**
3. Enter: `alchemyofthings.co.za`
4. Click **"Verify"**
5. Netlify shows DNS configuration needed

### Step 4.2: Configure DNS for .co.za at GoDaddy

1. Go to GoDaddy → **"My Products"**
2. Find **alchemyofthings.co.za** → Click **"DNS"**
3. Add records (same as alchemyofthings.com):

**If using Name Servers:**
- Change to same 4 Netlify name servers

**If using A + CNAME:**
- **A Record:**
  - Type: `A`
  - Name: `@`
  - Value: `[Same IP as .com]`
- **CNAME Record:**
  - Type: `CNAME`
  - Name: `www`
  - Value: `[your-site].netlify.app`

4. Save changes
5. Wait for DNS propagation (10-60 minutes)

### Step 4.3: Enable HTTPS for .co.za

1. Netlify automatically provisions SSL for domain aliases
2. In **"Domain settings"**, verify both domains show:
   - alchemyofthings.com → ✅ HTTPS
   - alchemyofthings.co.za → ✅ HTTPS

✅ **Phase 4 Complete!** Both domains now work.

---

## 🔐 PHASE 5: Secure Admin Panel (2 minutes)

### Step 5.1: Change Admin Password

1. Go to: `alchemyofthings.com/admin.html`
2. Login with: `alchemy2025`
3. Go to **"Settings"** tab
4. Enter new strong password (min 8 characters)
5. Click **"Update Password"**
6. **Write it down somewhere safe!**

### Step 5.2: Test Admin Panel

1. Logout
2. Login with new password
3. Verify you can access all sections

✅ **Phase 5 Complete!** Admin panel secured.

---

## ✅ Final Checklist

Test everything works:

### Main Site
- [ ] alchemyofthings.com loads
- [ ] alchemyofthings.co.za loads (shows same site)
- [ ] Both redirect to HTTPS (🔒 padlock visible)
- [ ] Gallery displays 6 placeholder artworks
- [ ] Language switcher works (EN/FR/DE)
- [ ] Scroll animations work
- [ ] Contact form submits successfully
- [ ] Mobile responsive (test on phone)

### Admin Panel
- [ ] Can access: alchemyofthings.com/admin.html
- [ ] Login works with new password
- [ ] Can add new artwork
- [ ] Can edit about section
- [ ] Can backup data
- [ ] Changes save correctly

### Both Domains
- [ ] alchemyofthings.com → works ✅
- [ ] www.alchemyofthings.com → works ✅
- [ ] alchemyofthings.co.za → works ✅
- [ ] www.alchemyofthings.co.za → works ✅

---

## 🎉 You're Live!

Your site is now:
- ✅ Hosted on Netlify (fast, secure, free)
- ✅ Connected to both domains
- ✅ HTTPS enabled (secure)
- ✅ Admin panel password-protected
- ✅ Contact form working
- ✅ Auto-deploys when you push to GitHub

---

## 🔄 Making Updates

### To Update Content:

**Option 1: Via Admin Panel (Easy)**
1. Go to admin.html
2. Add/edit artworks
3. Edit about section
4. Changes save locally
5. To publish: manually update index.html and push to GitHub

**Option 2: Via GitHub (Direct)**
1. Edit files locally
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Updated artwork details"
   git push origin main
   ```
3. Netlify auto-deploys (30-60 seconds)
4. Changes live at both domains

---

## 📧 Netlify Form Notifications

To get email when someone submits contact form:

1. In Netlify dashboard → **"Forms"**
2. Click on **"contact"** form
3. Go to **"Form notifications"**
4. Click **"Add notification"** → **"Email notification"**
5. Enter: `enquiries@alchemyofthings.com`
6. Save

Now you'll get email for every form submission!

---

## 🆘 Troubleshooting

### "Site not found" when visiting domain

**Cause:** DNS not propagated yet  
**Fix:** Wait 1-4 hours, check again  
**Test:** Use [whatsmydns.net](https://whatsmydns.net) to check propagation

### Language switcher still not working

**Cause:** Browser cache or local file issue  
**Fix:** 
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Try incognito mode
- Check browser console (F12) for errors

### Admin panel not accessible

**Cause:** admin.html not uploaded  
**Fix:** Verify admin.html exists in GitHub repository

### Form not sending emails

**Cause:** Netlify form not configured  
**Fix:** 
1. Verify `data-netlify="true"` in form tag
2. Check Netlify dashboard → Forms
3. Add email notification (see above)

---

## 📞 Need Help?

If stuck at any step:
1. Take screenshot of error
2. Note which step you're on
3. Check Netlify deploy logs (in dashboard)
4. Share error messages

---

## 🎨 Next Steps After Launch

1. **Replace placeholder images** with your actual artwork photos
2. **Update artwork details** (titles, dimensions, prices)
3. **Customize about text** to match your voice exactly
4. **Add Google Analytics** (optional - track visitors)
5. **Share with your network!**

---

**You're all set! Your gallery is live on both domains with automatic deployment.** 🚀

Remember: Any changes you push to GitHub will automatically update the live site within 60 seconds.
