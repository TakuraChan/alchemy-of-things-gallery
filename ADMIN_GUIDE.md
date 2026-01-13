# Λ◦T Admin Panel – User Guide

## 🔐 Access & Security

### Login
- **URL:** `https://alchemyofthings.com/admin.html`
- **Default Password:** `alchemy2025`
- **IMPORTANT:** Change this password immediately after first login!

### Change Password
1. Login to admin panel
2. Go to **Settings** tab
3. Enter new password (minimum 6 characters)
4. Click "Update Password"
5. Your new password is saved locally

### Security Notes
- Password is stored in browser's localStorage
- Session expires when you close the browser
- Always logout when finished
- Don't share your password
- Access admin.html only via HTTPS

---

## 📸 Managing Artworks

### Add New Artwork

1. Click **"+ Add New Artwork"** button
2. Fill in all required fields:
   - **Title** * (required)
   - **Medium** * (default: Acrylic on canvas)
   - **Size** * (e.g., 60 × 80 cm)
   - **Year** * (default: 2025)
   - **Status** * (Available or Sold)
   - **Price** (default: POA - Price On Application)
   - **Image** * (your artwork photo)

3. **Image Requirements:**
   - Format: JPG, PNG
   - Size: 1200-1600px recommended
   - File size: Under 500KB (compress at tinypng.com)
   - Images are stored as base64 (embedded in browser storage)

4. Click **"Save Artwork"**

### Edit Existing Artwork

1. Find the artwork card in the grid
2. Click **"Edit"** button
3. Update any fields
4. Click **"Save Artwork"**

### Delete Artwork

1. Find the artwork card
2. Click **"Delete"** button
3. Confirm deletion (this cannot be undone)

### Artwork Display

Each artwork shows:
- Title
- Medium | Size | Year
- Price (POA or specific price)
- Status badge (Available/Sold)
- Worldwide shipping note (automatically added)

---

## ✍️ Editing About Section

### Update Text

1. Go to **"About Section"** tab
2. Edit the text fields:
   - **Lead Text:** The subtitle/introduction
   - **Paragraph 1:** First paragraph
   - **Paragraph 2:** Second paragraph
   - **Paragraph 3:** Third paragraph

3. Click **"Save Changes"**

### Writing Tips

- Write in first-person (your voice)
- Keep lead text concise (1-2 sentences)
- Each paragraph: 2-4 sentences
- Focus on emotion, process, themes
- Avoid technical jargon
- Be authentic and direct

---

## ⚙️ Settings & Data Management

### Backup Your Data

**Important:** Always backup before making major changes!

1. Go to **Settings** tab
2. Click **"Export JSON"** button
3. Save the downloaded file somewhere safe
4. File contains: all artworks, about text, export date

### Restore from Backup

1. Go to **Settings** tab
2. Click **"Choose File"** under Import Data
3. Select your backup JSON file
4. Click **"Import JSON"**
5. Your data is restored

### When to Backup

- Before adding many new artworks
- Before editing about text
- Monthly (good practice)
- Before any major website updates

---

## 🚀 Publishing Changes to Your Live Site

### **IMPORTANT LIMITATION**

The admin panel stores data in your **browser's localStorage**. This means:
- ✅ You can manage all your content easily
- ✅ Changes are saved permanently in your browser
- ❌ Changes don't automatically update the live website
- ❌ You need to manually update index.html

### Publishing Workflow

**Option 1: Manual Update (Recommended for now)**

1. Make changes in admin panel
2. Open browser console (F12)
3. Copy the generated artwork data
4. Manually update `index.html` with new artwork blocks
5. Upload updated `index.html` to GoDaddy

**Option 2: Full CMS Solution (Future Enhancement)**

This would require:
- Server-side database (PHP + MySQL or similar)
- Backend API to save/load data
- More complex hosting setup
- Higher hosting costs

For now, use Option 1 for simplicity.

### Quick Update Process

1. **Add artwork in admin panel**
2. **Export data** (backup)
3. **Copy this HTML structure** for each artwork:

```html
<div class="artwork-item" data-available="true">
    <div class="artwork-image">
        <img src="images/YOUR-IMAGE.jpg" alt="TITLE">
        <div class="artwork-overlay">
            <button class="btn-inquire" onclick="openInquiry('TITLE')">Enquire</button>
        </div>
    </div>
    <div class="artwork-info">
        <h3>TITLE</h3>
        <p class="artwork-details">Medium | Size | Year</p>
        <p class="artwork-price">Price: POA</p>
        <p class="artwork-shipping">Worldwide shipping available</p>
        <span class="artwork-status available">Available</span>
    </div>
</div>
```

4. **Replace placeholders** with your data
5. **Paste into index.html** gallery section
6. **Upload to GoDaddy**

---

## 🎨 Best Practices

### Images

- **Before uploading:** Compress images
- **Tool:** TinyPNG.com or Squoosh.app
- **Target:** Under 500KB per image
- **Format:** JPG for paintings, PNG for transparency
- **Size:** 1200-1600px on longest side

### Artwork Titles

- Be consistent with naming
- Use descriptive but concise titles
- Example: "Red Focal Series 01" not "IMG_1234"

### Pricing

- **POA** (Price On Application) = most flexible
- Or specify: "R3,500" or "€450"
- Keep consistent format across all works

### Status Updates

- Mark as **Sold** immediately when piece sells
- Sold pieces still appear on site (shows success)
- Remove completely if you prefer

---

## 📱 Mobile Access

- Admin panel is mobile-responsive
- Can manage from phone/tablet
- Image uploads work on mobile
- Recommended: Use desktop for easier editing

---

## 🆘 Troubleshooting

### "Can't login / Password not working"

- Check you're using the current password
- Password is case-sensitive
- Clear browser cache and try again
- Reset: Delete localStorage and use default password

### "Images not saving"

- Check file size (under 2MB recommended)
- Try compressing image first
- Use JPG format
- Avoid very large dimensions

### "Lost my data"

- Check if you have a backup JSON file
- Import the backup via Settings tab
- If no backup: Data may be lost (always backup!)

### "Changes not showing on live site"

- Admin panel changes are LOCAL only
- Must manually update index.html
- Upload updated file to GoDaddy
- Clear browser cache after uploading

---

## 🔄 Future Enhancements

### Possible Upgrades:

1. **Auto-sync to website**
   - Requires backend/database
   - Changes go live automatically
   - More expensive hosting

2. **Email notifications**
   - Get notified when artwork sells
   - Form submissions sent to email

3. **Analytics dashboard**
   - View visitor stats
   - Track popular artworks
   - See inquiry sources

4. **Multi-user access**
   - Different admin accounts
   - Role-based permissions
   - Audit logs

5. **Cloud image storage**
   - Images on CDN (faster)
   - No browser storage limits
   - Better performance

---

## 📋 Quick Reference

### Default Password
```
alchemy2025
```

### Admin URL
```
https://alchemyofthings.com/admin.html
```

### Backup File Format
```
aot-backup-YYYY-MM-DD.json
```

### Image Requirements
```
Format: JPG/PNG
Size: 1200-1600px
Max: 500KB
```

### Status Options
```
- available
- sold
```

---

## ✅ Launch Checklist

Before going live:

- [ ] Changed default password
- [ ] Added first artwork
- [ ] Tested image upload
- [ ] Updated about section
- [ ] Created backup
- [ ] Tested on mobile
- [ ] Confirmed admin URL works
- [ ] Logged out successfully

---

## 📞 Support Notes

This admin panel is:
- ✅ Browser-based (localStorage)
- ✅ Password protected
- ✅ Mobile responsive
- ✅ Backup/restore capable
- ⚠️ Manual sync to live site required
- ⚠️ Single user at a time
- ⚠️ Data stored locally (backup important!)

For automatic publishing, you'd need a more complex setup with server-side components. Current solution is perfect for getting started and maintaining full control.

---

**Remember:** Always backup before major changes!
