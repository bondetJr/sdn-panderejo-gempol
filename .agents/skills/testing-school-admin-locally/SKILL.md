---
name: testing-school-admin-locally
description: Run browser tests of the school Next.js admin and public pages with disposable PostgreSQL when hosted credentials are unavailable.
---

# Local browser testing

- Add the installed Node binary directory to PATH before npm commands. In this environment it is `$HOME/.nvm/versions/node/v24.19.0/bin`.
- Use a disposable PostgreSQL database, not production. Install/start PostgreSQL if unavailable, then create a local role/database.
- Set ignored local `.env` values for `DATABASE_URL` and `DIRECT_URL` to that database. Supply a local `AUTH_SECRET` and `AUTH_URL=http://localhost:3000`.
- Run `npx prisma generate` and `npx prisma migrate deploy`, then `npm run dev`.
- Create an admin using `node --env-file=.env --import tsx scripts/create-admin.ts NAME EMAIL PASSWORD SUPER_ADMIN`. Plain tsx invocation may not load `.env`.
- Login at `/login`, then use the admin sidebar. `/admin/layanan` manages service standards; `/layanan` shows only published entries. Seed draft fixtures first if verifying the empty state.
- Use UI create/edit/publish/delete round trips and reload the public page to verify persistence and revalidation.
- Supabase placeholders permit text-only CRUD but not uploads. With an unreachable local Supabase URL, valid PDF/image uploads should leave the modal open with `Gagal upload dokumen` / `Gagal upload gambar`. Cancel and reopen to verify saved values remain unchanged.
- A stored document URL fixture can prove the public download anchor target without proving actual file retrieval.
- Check `matchMedia('(hover:hover)').matches` before judging hover animations: touch-oriented browser environments may disable hover CSS.
- After changing Supabase environment variables, restart Next.js. Assert both Prisma URLs still point at disposable localhost PostgreSQL before any database operation.
- When testing against a shared bucket, snapshot the relevant storage prefixes before uploads, retain exact uploaded paths from the local record, and delete only your own paths with the service-role API. Admin record deletion does not necessarily remove storage objects. Verify the final listing matches the baseline.
- Verify public file responses in addition to UI rendering: image uploads should have `.webp` paths, `image/webp` MIME and RIFF/WEBP signatures; PDFs should keep a sanitized `.pdf` filename and return bytes matching the local fixture.
- Test upload limits through the actual form: framework Server Action request limits can reject files before application validation runs. Distinguish a framework body-limit error from the intended Indonesian size-validation message.
- Check middleware body limits separately from Server Action limits. An oversized multipart request may be truncated by middleware and surface as `Unexpected end of form`; inspect server logs for `middlewareClientMaxBodySize` warnings. A request limit needs room for the complete multipart payload, not just the document bytes.
- To isolate server size validation when the client blocks submission, temporarily override only the selected browser File object's `size` property via `Object.defineProperty(file, "size", { configurable: true, value: 1 })`. Confirm `new Blob([file]).size` retains the actual oversized bytes, submit using the UI, and inspect the actual request-body byte length and server response/stack. Restore with `delete file.size`. A thrown application validation error can itself use HTTP 500 in Next.js dev; distinguish its intended message/stack from middleware truncation.

## Devin Secrets Needed

None for disposable database/text-only CRUD tests. Successful storage tests require valid `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, plus an appropriately configured public media bucket.
