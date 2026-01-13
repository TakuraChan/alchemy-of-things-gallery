# Quick Start Checklist – Get Live in 30 Minutes

Use this as your step-by-step guide. Check off each item as you complete it.

---

## 📋 Pre-Flight Check

- [ ] Downloaded all website files from Claude
- [ ] Have GitHub login ready (username: TakuraChan)
- [ ] Have Netlify login ready
- [ ] Have GoDaddy login ready
- [ ] Have 30 minutes available

---

## ⏱️ Phase 1: GitHub (5 min)

- [ ] Logged into GitHub
- [ ] Created new repository: `alchemy-of-things-gallery`
- [ ] Made it Public
- [ ] Uploaded all files:
  - [ ] index.html
  - [ ] styles.css
  - [ ] script.js
  - [ ] admin.html
  - [ ] admin-styles.css
  - [ ] admin-script.js
  - [ ] netlify.toml
  - [ ] images/ folder
  - [ ] README-GITHUB.md (renamed to README.md)
- [ ] Verified files appear in repository

**✅ Phase 1 Done!**

---

## ⏱️ Phase 2: Netlify (5 min)

- [ ] Logged into Netlify (app.netlify.com)
- [ ] Clicked "Add new site" → "Import project"
- [ ] Connected GitHub account
- [ ] Selected: `TakuraChan/alchemy-of-things-gallery`
- [ ] Set branch: `main`
- [ ] Left build settings empty
- [ ] Clicked "Deploy site"
- [ ] Waited for "Published" status
- [ ] Got random Netlify URL (e.g., `random-123.netlify.app`)
- [ ] Tested site loads at Netlify URL
- [ ] Clicked flag buttons - language changes ✅
- [ ] Gallery displays (gray boxes with red squares) ✅

**✅ Phase 2 Done!** Site is live on Netlify.

---

## ⏱️ Phase 3: alchemyofthings.com (10 min)

### In Netlify:
- [ ] Clicked "Domain settings"
- [ ] Clicked "Add custom domain"
- [ ] Entered: `alchemyofthings.com`
- [ ] Clicked "Verify"
- [ ] Noted DNS instructions from Netlify

### In GoDaddy:
- [ ] Logged into GoDaddy
- [ ] Went to "My Products"
- [ ] Found alchemyofthings.com → clicked "DNS"

**Choose ONE method:**

**Method A: Name Servers** (Recommended)
- [ ] In Netlify, copied 4 name servers
- [ ] In GoDaddy:
  - [ ] Scrolled to "Nameservers"
  - [ ] Clicked "Change"
  - [ ] Selected "Enter my own nameservers"
  - [ ] Pasted all 4 Netlify nameservers
  - [ ] Saved
- [ ] Noted: Will take 1-24 hours to propagate

**OR Method B: A Record + CNAME** (Faster)
- [ ] In Netlify, noted IP address
- [ ] In GoDaddy DNS, added:
  - [ ] A Record: `@` → `[Netlify IP]`
  - [ ] CNAME: `www` → `[your-site].netlify.app`
  - [ ] Saved
- [ ] Noted: Will take 10-60 minutes

### Back in Netlify:
- [ ] Waited for domain to verify
- [ ] HTTPS certificate provisioned automatically
- [ ] Enabled "Force HTTPS"

**✅ Phase 3 Done!** .com domain connected.

---

## ⏱️ Phase 4: alchemyofthings.co.za (5 min)

### In Netlify:
- [ ] Clicked "Add domain alias"
- [ ] Entered: `alchemyofthings.co.za`
- [ ] Verified

### In GoDaddy:
- [ ] Found alchemyofthings.co.za → clicked "DNS"
- [ ] Added same DNS records as .com:
  - [ ] Either: Same 4 name servers
  - [ ] OR: A Record + CNAME
- [ ] Saved

### Back in Netlify:
- [ ] Waited for .co.za to verify
- [ ] HTTPS enabled for .co.za ✅

**✅ Phase 4 Done!** Both domains connected.

---

## ⏱️ Phase 5: Security (2 min)

- [ ] Visited: alchemyofthings.com/admin.html
- [ ] Logged in with: `alchemy2025`
- [ ] Went to "Settings" tab
- [ ] Changed password to something secure
- [ ] **Wrote down new password:** ________________
- [ ] Logged out and back in with new password ✅

**✅ Phase 5 Done!** Admin secured.

---

## 🎯 Final Testing

### Test Both Domains:
- [ ] alchemyofthings.com → loads ✅
- [ ] www.alchemyofthings.com → loads ✅
- [ ] alchemyofthings.co.za → loads ✅
- [ ] www.alchemyofthings.co.za → loads ✅
- [ ] All show 🔒 HTTPS padlock ✅

### Test Features:
- [ ] Click 🇬🇧 → English
- [ ] Click 🇫🇷 → Text changes to French ✅
- [ ] Click 🇩🇪 → Text changes to German ✅
- [ ] Gallery displays 6 artworks
- [ ] Hover over artwork → "Enquire" button appears
- [ ] Scroll down → About section loads
- [ ] Contact form visible
- [ ] Test on mobile phone

### Test Admin:
- [ ] Visit: alchemyofthings.com/admin.html
- [ ] Login works with new password
- [ ] Can view artworks tab
- [ ] Can view about tab
- [ ] Can view settings tab

---

## 🎉 LAUNCH COMPLETE!

**Time elapsed:** _______ minutes

**Your site is now:**
- ✅ Live at alchemyofthings.com
- ✅ Live at alchemyofthings.co.za  
- ✅ Secure (HTTPS)
- ✅ Admin panel password-protected
- ✅ Auto-deploys from GitHub
- ✅ Contact form working
- ✅ Multilingual (EN/FR/DE)

---

## 📝 Next Steps

Now that you're live:

**Immediate:**
1. [ ] Test contact form (submit to yourself)
2. [ ] Set up Netlify form email notifications
3. [ ] Bookmark admin URL
4. [ ] Take screenshot of live site!

**This Week:**
1. [ ] Replace placeholder images with your artwork photos
2. [ ] Update artwork titles and details
3. [ ] Customize about section text
4. [ ] Share site with 5 friends for feedback

**This Month:**
1. [ ] Share on social media
2. [ ] Email your network
3. [ ] Add to email signature
4. [ ] Consider Google Analytics

---

## 🔄 Making Changes

When you want to update your site:

1. Edit files locally
2. Run:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Netlify auto-deploys in ~60 seconds
4. Changes live at both domains!

---

## 📞 If You Get Stuck

**Domain not working?**
- Check DNS propagation: whatsmydns.net
- Wait 1-4 hours, try again

**Language switcher not working?**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Check browser console (F12) for errors
- Try incognito mode

**Need help?**
- Screenshot the error
- Note which step
- Check Netlify deploy logs

---

## ✅ Success Criteria

You're done when:
- ✅ Both domains load your site
- ✅ HTTPS works (🔒 padlock)
- ✅ Language switcher works
- ✅ Admin panel accessible
- ✅ You can login to admin
- ✅ Contact form submits

**Congratulations! Your gallery is live!** 🎨🚀
