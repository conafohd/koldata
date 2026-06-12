-- Promote title, period_start, period_end out of the fields JSONB into dedicated columns

alter table assessments
  add column title        text not null default '',
  add column period_start date,
  add column period_end   date;

-- Migrate existing data from fields JSONB
update assessments
  set title        = coalesce(fields->>'title', ''),
      period_start = nullif(fields->>'period_start', '')::date,
      period_end   = nullif(fields->>'period_end', '')::date;

-- Remove migrated keys from fields JSONB
update assessments
  set fields = fields - 'title' - 'period_start' - 'period_end';
