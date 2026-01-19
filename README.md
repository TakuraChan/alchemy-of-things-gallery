# Alchemy of Things

A container for serious work.

---

## Overview

This is the complete website package for **alchemyofthings.com** and **alchemyofthings.co.za**.

The site consists of:
- **Public website** — Elegant, minimal display of artwork
- **Admin panel** — Secure CMS for uploading works via browser or phone

---

## Quick Start

### 1. Push to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/alchemy-of-things.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the `alchemy-of-things` repository
5. Deploy settings (should auto-detect from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.`
6. Click **"Deploy site"**

### 3. Enable Identity (Required for Admin)

After deployment:

1. Go to **Site settings** → **Identity**
2. Click **"Enable Identity"**
3. Under **Registration**, select **"Invite only"**
4. Under **Services** → **Git Gateway**, click **"Enable Git Gateway"**
5. Go to **Identity** tab → **"Invite users"**
6. Invite yourself with your email address
7. Check your email for the invite link

### 4. Configure Custom Domains

In Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter `alchemyofthings.com`
4. Repeat for `alchemyofthings.co.za`

In GoDaddy:
1. Go to your domain's DNS settings
2. Add these records:

| Type  | Name | Value                          |
|-------|------|--------------------------------|
| CNAME | www  | your-site-name.netlify.app     |
| A     | @    | 75.2.60.5                      |

*(Netlify will provide the exact values)*

---

## Using the Admin Panel

Access the admin at: `https://alchemyofthings.com/admin/`

### First Time Login

1. Go to `/admin/`
2. Click **"Login with Netlify Identity"**
3. Complete the signup from your invite email
4. You're in!

### Adding a Painting

1. Click **"Paintings"** in the sidebar
2. Click **"New Painting"**
3. Fill in the fields:
   - **ID**: Auto-generates from title (e.g., `morning-light`)
   - **Title**: The work's title
   - **Year**: Year completed
   - **Medium**: e.g., "Acrylic on canvas"
   - **Dimensions**: e.g., "60 × 80 cm"
   - **Image**: Upload high-quality photo
   - **Available**: Toggle on/off
4. Click **"Publish"**

### Adding Photography

Same process, under **"Photography"** section.

**Remember**: Only 3-5 elevated photographs maximum, per your constitution.

### Uploading Your Symbol

1. Click **"Settings"** in sidebar
2. Click **"Symbol"**
3. Upload your symbol (SVG preferred)
4. Save

The symbol will appear in navigation, footer, and as favicon.

---

## File Structure

```
alchemy-of-things/
├── index.html          # Home (paintings)
├── photography.html    # Photography page
├── about.html          # About page
├── work.html           # Single work view
├── inquire.html        # Inquiry form
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # JavaScript
├── admin/
│   ├── index.html      # Admin panel
│   └── config.yml      # CMS configuration
├── data/
│   ├── paintings/      # Individual painting JSON files (CMS writes here)
│   ├── photography/    # Individual photo JSON files
│   ├── works.json      # Aggregated paintings (built)
│   ├── photography.json# Aggregated photography (built)
│   └── settings.json   # Site settings
├── images/
│   ├── symbol.svg      # Your authorship symbol
│   ├── paintings/      # Painting images
│   ├── photography/    # Photography images
│   └── uploads/        # CMS uploads
├── scripts/
│   └── build.js        # Build script
├── netlify.toml        # Netlify configuration
├── package.json        # Node.js config
└── README.md           # This file
```

---

## Local Development

```bash
# Install dependencies (optional, for local server)
npm install

# Run local server
npm run dev

# Open http://localhost:3000
```

---

## Security

- **Admin access**: Controlled via Netlify Identity (invite-only)
- **Form submissions**: Processed securely by Netlify Forms
- **HTTPS**: Automatic via Netlify
- **Git Gateway**: Secure commits from CMS to GitHub

---

## Inquiry Forms

Inquiries submitted through the site go to:
- **Netlify Dashboard** → **Forms**
- Set up email notifications in **Site settings** → **Forms** → **Form notifications**

---

## Troubleshooting

### Admin won't load
- Ensure Identity is enabled in Netlify
- Ensure Git Gateway is enabled
- Check browser console for errors

### Images not showing
- Check file paths in JSON files
- Ensure images are uploaded to `/images/` directories
- Run `npm run build` to regenerate data files

### Forms not working
- Ensure `data-netlify="true"` is on the form
- Check Netlify Forms dashboard for submissions

---

## Constitution Reference

This website adheres to the **Alchemy of Things Core Artistic & Website Constitution**:

- Depth over reach
- Restraint over abundance
- Ambiguity over explanation
- Presence over promotion
- Authority without spectacle

The artist is available but not accessible.

---

## Support

For technical issues, refer to:
- [Netlify Docs](https://docs.netlify.com)
- [Decap CMS Docs](https://decapcms.org/docs/)

---

*A quiet room someone has been invited into.*
