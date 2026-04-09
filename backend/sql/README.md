# Backend SQL Notes

There is no migration runner in this repo yet. To apply backend schema changes in Supabase:

1. Open the Supabase SQL editor for the project backing `DATABASE_URL`.
2. Run [`message_submissions.sql`](/Users/sohailkhanifar/Developer/democracy.io/backend/sql/message_submissions.sql) if that table is not already present.
3. Run [`campaigns.sql`](/Users/sohailkhanifar/Developer/democracy.io/backend/sql/campaigns.sql).
4. Run [`campaign_events.sql`](/Users/sohailkhanifar/Developer/democracy.io/backend/sql/campaign_events.sql).

Apply the files in that order so the campaign stats queries can read the existing `message_submissions` table and `campaign_events` can reference `campaigns`.
