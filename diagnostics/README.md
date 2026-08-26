Health reports written by the admin.

`latest.json` is posted by `admin/index.html` when the admin is opened, when
errors have been logged, and when "Send diagnostics" is tapped — but only when
the report has changed, so the history stays quiet.

It carries: the admin version, the site origin, which functions answer and how,
whether the deployed data files parse, and the last 40 log lines. Netlify 404s
this path, so it is readable from the repository and not from the site.

    git fetch origin main && git show origin/main:diagnostics/latest.json
