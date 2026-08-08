# platform/api

Reserved for a standalone backend API service.

Currently, the working API endpoints (leads, conversations, review actions) live as
Next.js Route Handlers inside `platform/frontend/src/app/api/v1/**`, because Next's
App Router requires them to be co-located with the app to be routed. They were left
in place during the restructure to avoid breaking routing.

If/when the API is split out into its own service, move those route handlers' logic
here.
