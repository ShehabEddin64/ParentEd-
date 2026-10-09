# Previously deployed services — retirement checklist

Repository changes do not stop resources already running elsewhere. This file records the remaining account-level work; it does not claim any service has been cancelled.

The previous version referenced Cloudflare Workers, a Supabase project, optional Anthropic AI and optional Resend email. The retired live URL is deliberately no longer advertised in the README. An old published build can still contain the former public Supabase key.

Before deleting hosted data, decide whether a private backup is needed. Do not add a backup or its credentials to Git.

1. **Cloudflare:** locate the former ParentEd Worker in the account dashboard. Retire its public deployment/routes and remove any GitHub-connected deployment pipeline. Check account-level Workers subscriptions and any separate domains; deleting repository configuration does not cancel them.
2. **Supabase:** disable the former `assistant` and `booking-email` functions if deployed and remove their stored provider secrets. Review the project's Auth users, tables and Storage before pausing or removing the project. Check the organization's billing separately; do not assume an unused project or a repository change cancels a plan.
3. **Anthropic:** if a key was created for ParentEd, revoke that project-specific key and inspect recent usage. No Anthropic credential is needed for this archive.
4. **Resend:** if a key was created for ParentEd, revoke that project-specific key and inspect the plan. No email service is needed for this archive.
5. **GitHub:** check repository Actions secrets, environment secrets, deployment keys and connected apps for credentials specific to ParentEd. Remove unused project-specific credentials without disrupting other repositories.
6. Review each account's billing page for outstanding charges and the effective state after changes. Keep confirmation privately.

Provider account access was not established by this cleanup. These operations are not performed automatically because they can affect retained data or other projects sharing the same accounts.
