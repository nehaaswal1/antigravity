# Cloud Run Deployment

As an AI, I cannot directly host applications or generate live Cloud Run URLs. However, I have generated the necessary `Dockerfile` for you to deploy this application to Google Cloud Run yourself.

## Prerequisites
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Authenticate and set your Google Cloud project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Deployment Steps
Run the following command in the root directory of this project where the `Dockerfile` is located:

```bash
gcloud run deploy gemini-journeys \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

Once the deployment is complete, the Google Cloud CLI will output your live Cloud Run URL.
