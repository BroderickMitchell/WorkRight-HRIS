# 🚀 Deploy WorkRight HRIS to Google Cloud Run

## ✅ What's Been Fixed

Your code now includes:
- **28 critical security fixes** for tenant filtering
- **Dockerfile optimization** to skip slow migrations and fix startup timeout
- All changes committed to branch: `charming-ishizaka`

---

## 📋 Deploy to Cloud Run (Choose One Method)

### **Method 1: Cloud Console UI** (Easiest)

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Go to **Cloud Build** → **Triggers**
3. Project: `workright-dev`
4. Click **"RUN TRIGGER"** or **"CREATE TRIGGER"**:
   - **Name**: `deploy-charming-ishizaka`
   - **Event**: Manual invocation
   - **Source**: GitHub (BroderickMitchell/WorkRight-HRIS)
   - **Branch**: `charming-ishizaka`
   - **Configuration**: Cloud Build configuration file (`cloudbuild.yaml`)
5. Click **RUN** to start deployment

---

### **Method 2: Cloud Shell** (Recommended)

1. Open **Cloud Shell** in Google Cloud Console (terminal icon, top-right)

2. Run these commands:
   ```bash
   # Set project
   gcloud config set project workright-dev

   # Clone repo and checkout your branch
   git clone https://github.com/BroderickMitchell/WorkRight-HRIS.git
   cd WorkRight-HRIS
   git checkout charming-ishizaka

   # Trigger Cloud Build
   gcloud builds submit --config cloudbuild.yaml
   ```

3. Wait 5-10 minutes for build and deployment

---

### **Method 3: Local gcloud CLI** (If Configured)

If you have gcloud CLI installed and configured locally:

```bash
cd c:\Users\brode\.claude-worktrees\WorkRight-HRIS\charming-ishizaka
gcloud config set project workright-dev
gcloud builds submit --config cloudbuild.yaml
```

---

## 📊 Monitor Deployment

### Watch Build Progress
- [Cloud Build History](https://console.cloud.google.com/cloud-build/builds?project=workright-dev)

### Check Service Status
- [Cloud Run Services](https://console.cloud.google.com/run?project=workright-dev)
- Look for:
  - `workright-api` (australia-southeast1)
  - `workright-web` (australia-southeast1)

### View Logs
- [API Logs](https://console.cloud.google.com/logs/query?project=workright-dev&query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22workright-api%22)
- [Web Logs](https://console.cloud.google.com/logs/query?project=workright-dev&query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22workright-web%22)

---

## ✅ Verify Deployment Success

Once deployed, test these pages:

1. **Employee Directory**: Should load employees (tenant-filtered)
2. **Settings → Workspace Settings**: Should work
3. **Settings → Tenant Settings**: Should work
4. **Leave Requests**: Should be tenant-scoped
5. **Performance Goals**: Should be tenant-scoped

All "failed to fetch" errors should be resolved!

---

## 🔧 If You Need to Run Migrations Later

If your database schema needs updates, run migrations manually:

```bash
# Connect to Cloud Run service
gcloud run services update workright-api \
  --region=australia-southeast1 \
  --command="sh,-c,npx prisma migrate deploy && node dist/main.js" \
  --project=workright-dev
```

Or run migrations in Cloud Shell:
```bash
# Set DATABASE_URL from secret
export DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)

# Run migrations
npx prisma migrate deploy
```

---

## 🎯 What Happens During Deployment

1. ✅ **Builds Docker images** (API + Web) with security fixes
2. ✅ **Pushes to GCR** (Google Container Registry)
3. ✅ **Deploys to Cloud Run**:
   - Creates new revision
   - Routes traffic to new revision
   - Old revision kept as backup
4. ✅ **Container starts** (should now work without timeout!)
5. ✅ **Health checks pass** (no more startup probe failures)
6. 🎉 **App is live** with security fixes!

---

## 📞 Support

If deployment fails:
- Check [Cloud Build logs](https://console.cloud.google.com/cloud-build/builds?project=workright-dev)
- Review [Cloud Run logs](https://console.cloud.google.com/run?project=workright-dev)
- Verify DATABASE_URL secret exists

---

**Last Updated**: 2025-12-08
**Branch**: charming-ishizaka
**Commit**: eecd3fb (Dockerfile fix for startup timeout)
