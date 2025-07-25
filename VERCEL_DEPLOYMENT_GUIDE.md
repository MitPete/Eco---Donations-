# 🚀 Deploy Eco Donations to Vercel (Free)

This guide helps you deploy your Eco Donations platform to Vercel for **free hosting** where you can showcase it and continue beta testing.

## ✅ What You'll Get

- **Free hosting** for frontend and API
- **Custom domain**: `eco-donations-beta.vercel.app`
- **Real-time beta feedback** collection
- **Production-ready** for showcasing
- **API endpoints** for beta testing analytics

## 🎯 Quick Deploy (Recommended)

### Option 1: Automated Script

```bash
./deploy-to-vercel.sh
```

### Option 2: Manual Steps

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**

   ```bash
   cd frontend
   npm install
   cd ..
   vercel
   ```

3. **Follow prompts:**
   - Set up and deploy? **Y**
   - Project name: **eco-donations-beta**
   - Directory: **.**
   - Link to existing project? **N**

## 📱 What's Included

### Frontend Features

- ✅ Complete donation platform UI
- ✅ Wallet connection (MetaMask)
- ✅ Foundation browsing
- ✅ Governance interface
- ✅ Dashboard and analytics
- ✅ Professional whitepaper

### Beta Testing Features

- ✅ **Floating feedback widget** on all pages
- ✅ **Real-time feedback collection** API
- ✅ **User experience tracking**
- ✅ **Multi-channel feedback** (bug reports, feature requests, etc.)

### API Endpoints

- `/api/feedback` - Submit and view beta feedback
- `/api/health` - System health monitoring

## 🧪 Beta Testing Setup

Once deployed, your platform will include:

1. **Feedback Widget**: Floating button on every page
2. **User Tracking**: Anonymous usage analytics
3. **Real-time Collection**: Instant feedback processing
4. **Multiple Feedback Types**: Bugs, features, improvements

## 📊 Monitoring Beta Testing

### View Feedback Data

```bash
curl https://your-app.vercel.app/api/feedback
```

### Health Check

```bash
curl https://your-app.vercel.app/api/health
```

## 🔧 Environment Configuration

### Development vs Production

The platform automatically detects the environment:

- **Development**: `localhost` - uses local APIs
- **Production**: Vercel - uses serverless functions

### Custom Configuration

Edit `frontend/js/config.js` to modify:

- API endpoints
- Beta testing settings
- Network configuration

## 📈 Post-Deployment Checklist

- [ ] **Share URL** with beta testers
- [ ] **Test feedback widget** functionality
- [ ] **Monitor API responses**
- [ ] **Update beta checklist** with live URL
- [ ] **Collect user feedback** for improvements

## 🌟 Free Tier Limits

Vercel's free tier includes:

- **100GB bandwidth** per month
- **Unlimited static files**
- **Serverless functions** (10-second timeout)
- **Custom domain** support
- **SSL certificates** included

Perfect for beta testing and showcasing! 🎉

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deployment Logs**: Available in Vercel dashboard
- **Domain Settings**: Configure custom domains
- **Analytics**: Built-in performance monitoring

## 🚨 Troubleshooting

### Build Errors

```bash
cd frontend
npm install
npm run build
```

### API Issues

Check Vercel function logs in dashboard

### Domain Problems

Ensure DNS settings are correct in Vercel dashboard

---

**Ready to deploy?** Run `./deploy-to-vercel.sh` and share your platform with the world! 🌍
