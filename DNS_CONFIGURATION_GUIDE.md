# DNS Configuration Guide for adonaifarm.co.ke

## Overview
This guide will help you configure your domain `adonaifarm.co.ke` to point to your Railway deployment with automatic SSL certificate.

## Required DNS Records

Railway has provided the following DNS configuration that you need to add to your domain registrar's DNS settings:

### Primary Domain Configuration
```
Type: CNAME
Name: @ (or leave blank for root domain)
Value: 5kbuqm8d.up.railway.app
TTL: 300 (or default)
```

### WWW Subdomain Configuration (Recommended)
```
Type: CNAME
Name: www
Value: 5kbuqm8d.up.railway.app
TTL: 300 (or default)
```

## Step-by-Step DNS Setup Instructions

### 1. Access Your Domain Registrar's DNS Management
- Log into your domain registrar's control panel (where you purchased adonaifarm.co.ke)
- Navigate to DNS Management, DNS Settings, or Domain Management section
- Look for options like "Manage DNS", "DNS Records", or "Name Servers"

### 2. Add the CNAME Record for Root Domain
- **Type**: CNAME
- **Name/Host**: @ (some registrars use blank field or "adonaifarm.co.ke")
- **Value/Points to**: `5kbuqm8d.up.railway.app`
- **TTL**: 300 seconds (5 minutes) or use default

### 3. Add the CNAME Record for WWW Subdomain
- **Type**: CNAME
- **Name/Host**: www
- **Value/Points to**: `5kbuqm8d.up.railway.app`
- **TTL**: 300 seconds (5 minutes) or use default

### 4. Remove Conflicting Records (Important!)
Before adding the new CNAME records, make sure to remove any existing:
- A records pointing to @ or www
- AAAA records pointing to @ or www
- Other CNAME records for @ or www

### 5. Save Changes
- Save/Apply the DNS changes in your registrar's control panel
- Changes may take up to 72 hours to propagate worldwide (usually much faster)

## Common Registrar-Specific Instructions

### Namecheap
1. Go to Domain List → Manage → Advanced DNS
2. Delete existing A/CNAME records for @ and www
3. Add new CNAME records as specified above

### GoDaddy
1. Go to My Products → DNS → Manage Zones
2. Select your domain → DNS Records
3. Delete existing A/CNAME records for @ and www
4. Add new CNAME records as specified above

### Cloudflare (if using Cloudflare DNS)
1. Go to DNS → Records
2. Delete existing A/CNAME records for @ and www
3. Add new CNAME records as specified above
4. **Important**: Set Proxy Status to "DNS only" (gray cloud) for Railway to work properly

### Google Domains
1. Go to DNS → Custom Records
2. Delete existing A/CNAME records for @ and www
3. Add new CNAME records as specified above

## Verification Steps

### 1. Check DNS Propagation
Use online tools to verify DNS propagation:
- https://dnschecker.org/
- https://www.whatsmydns.net/
- Enter `adonaifarm.co.ke` and check CNAME records

### 2. Test Domain Access
Once DNS propagates (usually 15-60 minutes):
- Visit https://adonaifarm.co.ke
- Visit https://www.adonaifarm.co.ke
- Both should redirect to your Railway application

### 3. Verify SSL Certificate
- Check that the browser shows a secure connection (lock icon)
- SSL certificate should be automatically issued by Railway/Let's Encrypt
- This may take 5-15 minutes after DNS propagation

## Troubleshooting

### DNS Not Propagating
- Wait longer (up to 72 hours maximum)
- Clear your browser cache and DNS cache
- Try accessing from different devices/networks
- Use incognito/private browsing mode

### SSL Certificate Issues
- Ensure DNS is fully propagated first
- Wait 15-30 minutes after DNS propagation for SSL issuance
- Check that CNAME points exactly to `5kbuqm8d.up.railway.app`

### "This site can't be reached" Error
- Verify CNAME record is correct: `5kbuqm8d.up.railway.app`
- Check that old A records are removed
- Ensure TTL is set to 300 or lower for faster updates

### Mixed Content Warnings
- All assets should automatically use HTTPS
- If issues persist, clear browser cache
- Check that FRONTEND_URL is set to `https://adonaifarm.co.ke`

## Email Configuration (Optional - Future Setup)

If you want to set up email with your domain later, you'll need MX records:

### Basic Email Setup (Example with Google Workspace)
```
Type: MX
Name: @ (or blank)
Value: ASPMX.L.GOOGLE.COM
Priority: 1

Type: MX
Name: @ (or blank)
Value: ALT1.ASPMX.L.GOOGLE.COM
Priority: 5
```

**Note**: Email setup is separate from website hosting and won't affect your Railway deployment.

## Security Considerations

### HTTPS Enforcement
- Railway automatically redirects HTTP to HTTPS
- Your application is configured to use HTTPS URLs
- SSL certificate is automatically managed and renewed

### Domain Security
- Consider enabling domain lock with your registrar
- Use strong passwords for your registrar account
- Enable two-factor authentication if available

## Support Contacts

### Railway Support
- If domain doesn't work after 72 hours
- If SSL certificate doesn't issue automatically
- Railway Discord: https://discord.gg/railway

### Domain Registrar Support
- For DNS management issues
- For domain transfer or ownership questions
- Contact your specific registrar's support team

## Final Checklist

- [ ] CNAME record added: @ → 5kbuqm8d.up.railway.app
- [ ] CNAME record added: www → 5kbuqm8d.up.railway.app
- [ ] Old A/AAAA records removed
- [ ] DNS propagation verified (dnschecker.org)
- [ ] Website accessible at https://adonaifarm.co.ke
- [ ] Website accessible at https://www.adonaifarm.co.ke
- [ ] SSL certificate showing as secure
- [ ] All website functionality working on custom domain

## Expected Timeline

- **DNS Changes**: 15 minutes to 72 hours (usually 15-60 minutes)
- **SSL Certificate**: 5-30 minutes after DNS propagation
- **Full Functionality**: Within 1-2 hours of DNS setup

Your website will be fully accessible at https://adonaifarm.co.ke once these steps are completed!